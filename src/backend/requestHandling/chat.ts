// requestHandling/chat.ts
import { Request, Response, Router } from 'express';
import { db } from '../httpDriver';
import { 
  getUserChats,
  getMessages,
  getUnreadCount,
  getOtherChatMembers,
  sendMessage,
  findExistingChat,
  createNewChat,
  getTotalUnreadMessages
} from '../db_opertions';
import { DBResponse, Chat } from '../db_opertions';

const router = Router();

// Hämta alla chattar för en användare
router.get('/users/:userId/chats', async (req: Request, res: Response): Promise<any> => {
  try {
    const userIdParam = req.params['userId'];
    if (!userIdParam) {
      return res.status(400).json({ error: 'User ID is missing' });
    }
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result: DBResponse<Chat[]> = await getUserChats(db, userId);
    if (!result.success || !result.data) {
      return res.status(500).json({ error: result.error || 'No chat data available' });
    }

    // Berika med senaste meddelande och olästa räknare
    const enhancedChats = await Promise.all(
      result.data.map(async (chat) => {
        const [messages, unreadCount, otherMember] = await Promise.all([
          getMessages(db, chat.id, userId),
          getUnreadCount(db, chat.id, userId),
          getOtherChatMembers(db, chat.id, userId)
        ]);

        return {
          id: chat.id,
          name: chat.name,
          lastMessage: messages.success && messages.data && messages.data.length > 0 
            ? messages.data[messages.data.length - 1] 
            : null,
          unreadCount: unreadCount.success && unreadCount.data 
            ? unreadCount.data 
            : 0,
          otherMember: otherMember.success && otherMember.data && otherMember.data.length > 0 
            ? otherMember.data[0] 
            : null
        };
      })
    );

    return res.json(enhancedChats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Hämta meddelanden i en chatt
router.get('/messages/:chatId', async (req: Request, res: Response):Promise <any> => {
  try {
    const chatIdParam = req.params['chatId'];
    if (!chatIdParam) {
      return res.status(400).json({ error: 'Chat ID is missing' });
    }
    const chatId = parseInt(chatIdParam);
    const userId = parseInt(req.query['userId'] as string);
    
    // Hämta meddelanden
    const messages = await db.all(
      `SELECT m.*, u.name as user_name, u.avatar as user_avatar 
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.chat_id = ?
       ORDER BY m.sent_at ASC`,
      [chatId]
    );

    // Hämta när användaren senast läste chatt
    const lastRead = await db.get(
      `SELECT last_read_at FROM chat_members 
       WHERE chat_id = ? AND user_id = ?`,
      [chatId, userId]
    );

    // Beräkna is_read för varje meddelande
    const enhancedMessages = messages.map(msg => ({
      ...msg,
      is_read: lastRead?.last_read_at 
        ? new Date(msg.sent_at) <= new Date(lastRead.last_read_at)
        : false
    }));

    return res.json(enhancedMessages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Skicka ett meddelande
router.post('/messages', async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId, userId, content } = req.body;
    
    if (!chatId || !userId || !content) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await sendMessage(db, chatId, userId, content);
    if (!result.success || result.data === undefined) {
      return res.status(500).json({ error: result.error || 'Failed to send message' });
    }

    return res.status(201).json({ messageId: result.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Hitta chatt mellan användare
router.post('/chats/find', async (req: Request, res: Response) :Promise<any>=> {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array required' });
    }

    const chats = await getUserChats(db, userIds[0]);
    for (const chat of (chats.data || [])) {
      const members = await getOtherChatMembers(db, chat.id, userIds[0]);
      const memberIds = (members.data || []).map(m => m.id);
      if (userIds.every(id => memberIds.includes(id) || id === userIds[0])) {
        return res.json(chat);
      }
    }
    return res.status(404).json({ error: 'Chat not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/users', async (_req: Request, res: Response): Promise<any> => {
  try {
    const users = await db.all(`SELECT id, name, email, age, sex, latitude, longitude, avatar, bio, pace, features FROM users`);

    return res.json(users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      sex: user.sex,
      avatar: user.avatar,
      latitude: user.latitude,
      longitude: user.longitude,
      bio: user.bio,
      pace: user.pace,
      features: user.features ? JSON.parse(user.features) : []
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.post('/chats', async (req: Request, res: Response):Promise<any> => {
  try {
    const { name, userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 user IDs required' });
    }

    const chatResult = await db.run(
      "INSERT INTO chats (name) VALUES (?)",
      [name || `Chat ${new Date().toISOString()}`]
    );

    if (!chatResult.lastID) {
      return res.status(500).json({ error: 'Failed to create chat' });
    }

    const chatId = chatResult.lastID;

    // Lägg till medlemmar
    await Promise.all(
      userIds.map(userId => 
        db.run(
          "INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)",
          [chatId, userId]
        )
      )
    );

    return res.status(201).json({ id: chatId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/chats/:chatId/other-members', async (req: Request, res: Response): Promise<any> => {
  try {
    const chatIdParam = req.params['chatId'];
    if (!chatIdParam) {
      return res.status(400).json({ error: 'Chat ID is missing' });
    }
    const chatId = parseInt(chatIdParam);
    const userIdParam = req.query['userId'];
    
    if (isNaN(chatId)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }
    if (!userIdParam) {
      return res.status(400).json({ error: 'User ID is missing' });
    }
    
    const userId = parseInt(userIdParam as string);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const members = await db.all(
      `SELECT u.* FROM users u
       JOIN chat_members cm ON u.id = cm.user_id
       WHERE cm.chat_id = ? AND cm.user_id != ?`,
      [chatId, userId]
    );

    return res.json(members);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Skapa eller hitta chatt mellan användare
router.post('/chats/find-or-create', async (req: Request, res: Response):Promise<any>=> {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array required' });
    }

    console.log('Finding or creating chat for users:', userIds);

    // 1. Försök hitta befintlig chatt
    const existingChat = await findExistingChat(db, userIds);
    if (existingChat.success && existingChat.data) {
      console.log('Found existing chat:', existingChat.data.id);
      return res.json(existingChat.data);
    }

    // 2. Skapa ny chatt om ingen finns
    console.log('No existing chat found, creating new one');
    const newChat = await createNewChat(db, userIds);
    if (!newChat.success || !newChat.data) {
      throw new Error(newChat.error || 'Failed to create chat');
    }

    console.log('Created new chat:', newChat.data.id);
    return res.status(201).json(newChat.data);

  } catch (err) {
    console.error('Error in find-or-create:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.post('/chats/:chatId/mark-read', async (req: Request, res: Response):Promise<any> => {
  try {
    const chatIdParam = req.params['chatId'];
    if (!chatIdParam) {
      return res.status(400).json({ error: 'Chat ID is missing' });
    }
    const chatId = parseInt(chatIdParam);
    const { userId } = req.body;
    
    await db.run(
      `UPDATE chat_members 
       SET last_read_at = CURRENT_TIMESTAMP 
       WHERE chat_id = ? AND user_id = ?`,
      [chatId, userId]
    );
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/users/:userId/unread-total', async (req: Request, res: Response):Promise<any> => {
  try {
    const userIdParam = req.params['userId'];
    if (!userIdParam) {
      return res.status(400).json({ error: 'User ID is missing' });
    }
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await getTotalUnreadMessages(db, userId);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.json({ total: result.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/users/:userId', async (req: Request, res: Response): Promise<any> => {
  try {
    const userIdParam = req.params['userId'];
    if (!userIdParam) {
      return res.status(400).json({ error: 'User ID is missing' });
    }
    
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await db.get(`
      SELECT 
        id, name, email, age, sex, 
        avatar, latitude, longitude, 
        bio, pace, features 
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse features från JSON sträng om den finns
    const userData = {
      ...user,
      features: user.features ? JSON.parse(user.features) : []
    };

    return res.json(userData);
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/chats/:chatId/unread-count', async (req: Request, res: Response): Promise<any> => {
  try {
    const chatIdParam = req.params['chatId'];
    const userIdParam = req.query['userId'];

    if (!chatIdParam || !userIdParam) {
      return res.status(400).json({ error: 'Missing chatId or userId' });
    }

    const chatId = parseInt(chatIdParam);
    const userId = parseInt(userIdParam as string);

    if (isNaN(chatId) || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid chatId or userId' });
    }

    const result = await db.get(
      `SELECT COUNT(m.id) as count 
       FROM messages m
       INNER JOIN chat_members cm ON 
         cm.chat_id = m.chat_id AND 
         cm.user_id = ?
       WHERE m.chat_id = ? 
         AND m.user_id != ?
         AND (cm.last_read_at IS NULL OR m.sent_at > cm.last_read_at)`,
      [userId, chatId, userId]
    );

    return res.json({ count: result?.count || 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


export default router;