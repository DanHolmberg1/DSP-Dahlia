import { Router } from 'express';
const router = Router();

router.get('/users', async (req, res) => {
  const db = (req as any).db;
  const users = await db.all('SELECT id, name, email, age, gender FROM users');
  res.json(users);
});

// ✅ Lägg till användare via API
router.post('/users', async (req, res) => {
  const db = (req as any).db;
  const { name, email, age, gender } = req.body;

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

// ✅ Lägg till chat + medlemmar via API
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
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'userId and content are required' });
  }

  const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
  if (!user) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  await db.run('INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)', [1, userId, content]);
  res.status(201).json({ success: true });
});

router.get('/messages', async (req, res) => {
  const db = (req as any).db;
  const messages = await db.all(`
    SELECT m.id, m.content, m.sent_at, u.id as userId, u.name as userName
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.chat_id = 1
    ORDER BY m.sent_at DESC
  `);
  res.json(messages);
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
