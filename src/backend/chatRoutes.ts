import { Router } from 'express';
const router = Router();

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: number;
}

interface Message {
  id: number;
  content: string;
  sent_at: string;
  userId: number;
  userName: string;
}

router.get('/users', async (req, res) => {
  try {
    const db = (req as any).db;
    const users: User[] = await db.all('SELECT id, name, email, age, gender FROM users');
    res.json(users);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: (err as Error).message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const db = (req as any).db;
    const { userId, content } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    // Add user validation
    const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    await db.run(
      'INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)',
      [1, userId, content]
    );
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to send message', details: (err as Error).message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const db = (req as any).db;
    const messages: Message[] = await db.all(`
      SELECT m.id, m.content, m.sent_at, 
             u.id as userId, u.name as userName
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.chat_id = 1
      ORDER BY m.sent_at DESC
    `);
    res.json(messages);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: (err as Error).message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;