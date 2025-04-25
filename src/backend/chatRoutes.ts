//chatRoutes.ts
import { Router } from 'express';
const router = Router();

router.get('/users', async (req, res) => {
  const db = (req as any).db;
  const users = await db.all('SELECT id, name, email, age, gender FROM users');
  res.json(users);
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

router.post('/chats', async (req, res) => {
  const db = (req as any).db;
  const { name, userIds } = req.body;

  if (!name || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Name and userIds[] are required' });
  }

  const result = await db.run('INSERT INTO chats (name) VALUES (?)', [name]);
  const chatId = result.lastID;

  for (const userId of userIds) {
    await db.run('INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)', [chatId, userId]);
  }

  res.status(201).json({ id: chatId, name });
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

router.get('/messages/:chatId', async (req, res) => {
  const db = (req as any).db;
  const chatId = req.params.chatId;
  const userId = req.query.userId;

  // 1. Kontrollera att användaren finns först
  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 2. Kontrollera chatmedlemskap
  const isMember = await db.get(
    'SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?',
    [chatId, userId]
  );
  if (!isMember) {
    return res.status(403).json({ error: 'User is not a member of this chat' });
  }

  // 3. Hämta meddelanden
const messages: { id: number; content: string; sent_at: string; userId: number; userName: string }[] = await db.all(
  `SELECT m.id, m.content, m.sent_at, u.id as userId, u.name as userName
  FROM messages m
  JOIN users u ON m.user_id = u.id
  WHERE m.chat_id = ?
  AND m.user_id = ?
  ORDER BY m.sent_at DESC`,
  [chatId, userId]
);

  res.json(messages);
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