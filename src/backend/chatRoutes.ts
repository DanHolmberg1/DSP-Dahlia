//chatRoutes.ts
import { Router } from 'express';
const router = Router();
import { findChatBetweenUsers } from './db_operations';

router.get('/users', async (req, res) => {
  const db = (req as any).db;
  try {
    const users = await db.all(`
      SELECT id, name, email, age, gender, latitude, longitude, bio, pace, features 
      FROM users
    `);

    res.json(users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
      latitude: user.latitude,
      longitude: user.longitude,
      bio: user.bio,
      pace: user.pace,
      features: user.features ? JSON.parse(user.features) : []
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


router.post('/users', async (req, res) => {
  const db = (req as any).db;
  const { name, email, age, gender } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!name || !email || age == null || gender == null) {
    return res.status(400).json({ error: 'All fields (name, email, age, gender) are required' });
  }

  const result = await db.run(
    'INSERT INTO users (name, email, age, gender) VALUES (?, ?, ?, ?)',
    [name, email, age, gender]
  );

  const user = await db.get('SELECT id, name, email, age, gender FROM users WHERE id = ?', [result.lastID]);
  res.status(201).json(user);
});

router.get('/chats', async (req, res) => {
  const db = (req as any).db;
  const chats = await db.all('SELECT id, name FROM chats');
  res.json(chats);
});
router.get('/users/:userId/friends', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.params;

  try {
    const friends = await db.all(
      `SELECT u.id, u.name, u.email 
       FROM users u
       JOIN friends f ON u.id = f.friend_id
       WHERE f.user_id = ?`,
      [userId]
    );

    interface Friend {
      id: number;
      name: string;
      email: string;
    }

    res.json(friends.map((friend: Friend) => ({
      ...friend,
      avatar: `https://i.pravatar.cc/150?u=${friend.id}`
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

router.post('/chats/find', async (req, res) => {
  const db = (req as any).db;
  const { userIds } = req.body;

  if (!userIds || userIds.length !== 2) {
    return res.status(400).json({ error: 'Exactly two userIds required' });
  }

  try {
    const chatId = await findChatBetweenUsers(db, userIds);
    if (chatId) {
      const chat = await db.get('SELECT * FROM chats WHERE id = ?', [chatId]);
      return res.json(chat);
    }
    return res.status(404).json({ error: 'Chat not found' });
  } catch (err) {
    console.error('Error finding chat:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
router.post('/chats', async (req, res) => {
  const db = (req as any).db;
  const { name, userIds } = req.body;

  if (!userIds || userIds.length !== 2) {
    return res.status(400).json({ error: 'Exactly two userIds required' });
  }

  // Kolla om chatt redan finns
  const existingChatId = await findChatBetweenUsers(db, userIds);
  if (existingChatId) {
    const chat = await db.get('SELECT * FROM chats WHERE id = ?', [existingChatId]);
    return res.json(chat);
  }

  // Skapa ny chatt
  const chatName = name || `Privat chatt`;
  const result = await db.run('INSERT INTO chats (name) VALUES (?)', [chatName]);
  const chatId = result.lastID;

  // Lägg till båda användarna
  for (const userId of userIds) {
    await db.run('INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)', [chatId, userId]);
  }

  res.status(201).json({ id: chatId, name: chatName });
});

router.post('/messages', async (req, res) => {
  const db = (req as any).db;
  const { userId, content, chatId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }
  if (!userId || !content || !chatId) {
    return res.status(400).json({ error: 'userId, content, and chatId are required' });
  }

  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const chatMember = await db.get('SELECT * FROM chat_members WHERE chat_id = ? AND user_id = ?', [chatId, userId]);
  if (!chatMember) {
    return res.status(400).json({ error: 'User is not a member of the chat' });
  }

  await db.run('INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)', [chatId, userId, content]);
  res.status(201).json({ success: true });
});
router.post('/chats/:chatId/mark-read', async (req, res) => {
  const db = (req as any).db;
  const { chatId } = req.params;
  const { userId } = req.body;

  await db.run(
    `UPDATE chat_members 
     SET last_read_at = CURRENT_TIMESTAMP 
     WHERE chat_id = ? AND user_id = ?`,
    [chatId, userId]
  );

  res.json({ success: true });
});
router.get('/messages/:chatId', async (req, res) => {
  const db = (req as any).db;
  const { chatId } = req.params;
  const { userId } = req.query;

  // Validering
  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMember = await db.get('SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?', [chatId, userId]);
  if (!isMember) return res.status(403).json({ error: 'Not a member' });

  // Hämta meddelanden med läst-status
  const messages = await db.all(`
    SELECT 
      m.id, 
      m.content, 
      m.sent_at, 
      u.id as userId, 
      u.name as userName,
      (m.sent_at <= IFNULL(cm.last_read_at, '1970-01-01')) as is_read
    FROM messages m
    JOIN users u ON m.user_id = u.id
    LEFT JOIN chat_members cm ON cm.chat_id = m.chat_id AND cm.user_id = ?
    WHERE m.chat_id = ?
    ORDER BY m.sent_at ASC
  `, [userId, chatId]);

  res.json(messages);
});
router.get('/chats/:chatId/unread-count', async (req, res) => {
  const db = (req as any).db;
  const { chatId } = req.params;
  const { userId } = req.query;

  const result = await db.get(
    `SELECT COUNT(*) as count
     FROM messages m
     JOIN chat_members cm ON m.chat_id = cm.chat_id
     WHERE 
       m.chat_id = ? AND
       cm.user_id = ? AND
       m.user_id != cm.user_id AND
       (cm.last_read_at IS NULL OR m.sent_at > cm.last_read_at)`,
    [chatId, userId]
  );

  res.json({ count: result.count });
});

router.get('/users/:userId/unread-total', async (req, res) => {
  const db = (req as any).db;
  const { userId } = req.params;

  const result = await db.get(`
    SELECT COUNT(*) as total
    FROM messages m
    JOIN chat_members cm ON m.chat_id = cm.chat_id
    WHERE 
      cm.user_id = ? AND
      m.user_id != cm.user_id AND
      (cm.last_read_at IS NULL OR m.sent_at > cm.last_read_at)
  `, [userId]);

  res.json({ total: result.total });
});

router.get('/messages/:chatId/last', async (req, res) => {
  const db = (req as any).db;
  const chatId = req.params.chatId;
  const userId = req.query.userId;

  // Kontrollera användare och medlemskap
  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMember = await db.get('SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?', [chatId, userId]);
  if (!isMember) return res.status(403).json({ error: 'Not a member' });

  // Hämta senaste meddelandet
  const lastMessage = await db.get(
    `SELECT m.id, m.content, m.sent_at, u.id as userId, u.name as userName
     FROM messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.chat_id = ?
     ORDER BY m.sent_at DESC
     LIMIT 1`,
    [chatId]
  );

  res.json(lastMessage || null);
});
router.delete('/messages/:id', async (req, res) => {
  const db = (req as any).db;
  const messageId = req.params.id;

  try {
    const result = await db.run('DELETE FROM messages WHERE id = ?', [messageId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});
router.get('/messages/all/:chatId', async (req, res) => {
  const db = (req as any).db;
  const chatId = req.params.chatId;

  try {
    const messages = await db.all('SELECT * FROM messages WHERE chat_id = ?', [chatId]);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching all messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.delete('/chat-members/all', async (req, res) => {
  const db = (req as any).db;

  try {
    await db.run('DELETE FROM chat_members');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error clearing chat members:', err);
    res.status(500).json({ error: 'Failed to clear chat members' });
  }
});
router.delete('/users/:id', async (req, res) => {
  const db = (req as any).db;
  const userId = req.params.id;

  // Ta först bort användaren från alla chattar
  await db.run('DELETE FROM chat_members WHERE user_id = ?', [userId]);

  // Ta sedan bort användaren
  await db.run('DELETE FROM users WHERE id = ?', [userId]);

  res.status(200).json({ success: true });
});

router.delete('/chats/:id', async (req, res) => {
  const db = (req as any).db;
  const chatId = req.params.id;

  await db.run('DELETE FROM chats WHERE id = ?', [chatId]);
  res.status(200).json({ success: true });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;