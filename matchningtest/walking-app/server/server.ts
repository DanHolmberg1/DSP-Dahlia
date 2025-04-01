import express from 'express';
import cors from 'cors';
import { db } from '../database/DB';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Konfiguration
const SECRET_KEY = process.env.JWT_SECRET || 'your-strong-secret-key-here';
const TOKEN_EXPIRY = '24h';
const PORT = process.env.PORT || 3000;

// Typer och interfaces
interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// App setup
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Autentiseringsmiddleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Ingen token tillhandahållen' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Ogiltig token' });
    }

    const payload = decoded as JwtPayload;
    req.user = {
      id: payload.userId,
      email: payload.email
    };
    next();
  });
}

// Hjälpfunktioner
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isUserOnline(isOnline: number, lastOnline: string | null): boolean {
  if (isOnline === 1) return true;
  if (!lastOnline) return false;
  const lastOnlineDate = new Date(lastOnline);
  return (Date.now() - lastOnlineDate.getTime()) < (15 * 60 * 1000);
}

// API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', database: 'Connected' });
});

// Registrering
app.post('/api/register', (req, res) => {
  const { username, email, password, age, gender } = req.body;

  if (!username || !email || !password || !age || !gender) {
    return res.status(400).json({ error: 'Alla fält måste fyllas i' });
  }

  try {
    db.exec('BEGIN TRANSACTION');

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'E-postadressen används redan' });
    }

    const result = db.prepare(`
      INSERT INTO users (username, email, password, age, gender, is_online)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(username, email, password, age, gender);

    const userId = result.lastInsertRowid;

    db.prepare(`
      INSERT INTO user_locations (user_id, latitude, longitude)
      VALUES (?, ?, ?)
    `).run(userId, 
      59.3293 + (Math.random() * 0.1 - 0.05),
      18.0686 + (Math.random() * 0.1 - 0.05)
    );

    db.prepare(`
      INSERT INTO user_preferences (user_id, show_men, show_women, show_other, min_age, max_age)
      VALUES (?, 1, 1, 1, 18, 99)
    `).run(userId);

    const token = jwt.sign(
      { userId: userId, email: email },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRY }
    );

    db.exec('COMMIT');

    res.status(201).json({ 
      token,
      user: { 
        id: userId,
        username,
        email,
        age,
        gender,
        is_online: 0,
        show_men: true,
        show_women: true,
        show_other: true,
        min_age: 18,
        max_age: 99
      } 
    });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ 
      error: 'Registrering misslyckades',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare(`
      SELECT 
        u.id, u.username, u.email, u.age, u.gender, u.is_online,
        up.show_men, up.show_women, up.show_other,
        up.min_age, up.max_age
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.email = ? AND u.password = ?
    `).get([email, password]) as any;

    if (!user) {
      return res.status(401).json({ error: 'Fel e-post eller lösenord' });
    }

    db.prepare(`
      UPDATE users 
      SET is_online = 1, last_online = datetime('now') 
      WHERE id = ?
    `).run(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        age: user.age,
        gender: user.gender,
        is_online: user.is_online,
        show_men: user.show_men,
        show_women: user.show_women,
        show_other: user.show_other,
        min_age: user.min_age,
        max_age: user.max_age
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Inloggning misslyckades' });
  }
});

// Logout
app.post('/api/logout', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Ej autentiserad' });

  try {
    db.prepare(`
      UPDATE users
      SET is_online = 0, last_online = datetime('now')
      WHERE id = ?
    `).run(req.user.id);

    res.json({ success: true, message: 'Utloggning lyckades' });
  } catch (err) {
    res.status(500).json({ error: 'Utloggning misslyckades' });
  }
});

// Användarpreferenser
app.get('/api/users/:id/preferences', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = parseInt(req.params.id);
  
  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'Åtkomst nekad' });
  }

  try {
    let preferences = db.prepare(`
      SELECT show_men, show_women, show_other, min_age, max_age
      FROM user_preferences
      WHERE user_id = ?
    `).get(userId);

    if (!preferences) {
      preferences = {
        show_men: 1,
        show_women: 1,
        show_other: 1,
        min_age: 18,
        max_age: 99
      };
    }

    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/users/:id/preferences', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = parseInt(req.params.id);
  const prefs = req.body;

  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'Åtkomst nekad' });
  }

  try {
    db.exec('BEGIN TRANSACTION');

    db.prepare(`
      INSERT OR REPLACE INTO user_preferences 
      (user_id, show_men, show_women, show_other, min_age, max_age)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, prefs.show_men, prefs.show_women, prefs.show_other, prefs.min_age, prefs.max_age);

    db.prepare('DELETE FROM user_interest_map WHERE user_id = ?').run(userId);
    if (prefs.interests?.length) {
      const insert = db.prepare('INSERT INTO user_interest_map (user_id, interest_id) VALUES (?, ?)');
      prefs.interests.forEach((id: number) => insert.run(userId, id));
    }

    const updatedPrefs = db.prepare(`
      SELECT up.*, GROUP_CONCAT(uim.interest_id) AS interests
      FROM user_preferences up
      LEFT JOIN user_interest_map uim ON up.user_id = uim.user_id
      WHERE up.user_id = ?
      GROUP BY up.user_id
    `).get(userId) as any;

    db.exec('COMMIT');

    res.json({
      ...updatedPrefs,
      interests: updatedPrefs.interests ? updatedPrefs.interests.split(',').map(Number) : []
    });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Update failed' });
  }
});

// Intressen
app.get('/api/interests', (req, res) => {
  try {
    const interests = db.prepare('SELECT id, name FROM interests ORDER BY name').all();
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

app.get('/api/users/:id/interests', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = parseInt(req.params.id);
  
  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'Åtkomst nekad' });
  }

  try {
    const interests = db.prepare(`
      SELECT interest_id 
      FROM user_interest_map 
      WHERE user_id = ?
    `).all(userId).map((item: any) => item.interest_id);

    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Statusuppdatering
app.post('/api/users/:id/status', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = parseInt(req.params.id);
  const { isOnline } = req.body;

  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'Åtkomst nekad' });
  }

  try {
    db.prepare(`
      UPDATE users
      SET is_online = ?, last_online = datetime('now')
      WHERE id = ?
    `).run(isOnline ? 1 : 0, userId);

    res.json({ success: true, isOnline });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Matchningar
app.get('/api/users/matches', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user?.id;
  const radius = parseFloat(req.query.radius as string) || 5;

  if (!userId) {
    return res.status(400).json({ error: 'Användar-ID krävs' });
  }

  try {
    const userData = db.prepare(`
      SELECT 
        u.id, u.gender, u.is_online, u.last_online,
        ul.latitude, ul.longitude,
        up.show_men, up.show_women, up.show_other,
        up.min_age, up.max_age
      FROM users u
      LEFT JOIN user_locations ul ON u.id = ul.user_id
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = ?
    `).get(userId) as any;

    if (!userData) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    if (!userData.latitude || !userData.longitude) {
      return res.status(400).json({ error: 'Användaren har ingen position' });
    }

    const genderFilters = [];
    if (userData.show_men) genderFilters.push("u.gender = 'man'");
    if (userData.show_women) genderFilters.push("u.gender = 'kvinna'");
    if (userData.show_other) genderFilters.push("u.gender = 'annat'");

    if (genderFilters.length === 0) {
      return res.json([]);
    }

    const potentialMatches = db.prepare(`
      SELECT 
        u.id, u.username, u.age, u.gender, u.is_online, u.last_online,
        ul.latitude, ul.longitude,
        GROUP_CONCAT(i.name) AS interests
      FROM users u
      LEFT JOIN user_locations ul ON u.id = ul.user_id
      LEFT JOIN user_interest_map ui ON u.id = ui.user_id
      LEFT JOIN interests i ON ui.interest_id = i.id
      WHERE u.id != ? 
        AND (${genderFilters.join(' OR ')})
        AND u.age BETWEEN ? AND ?
        AND ul.latitude IS NOT NULL
        AND ul.longitude IS NOT NULL
      GROUP BY u.id
    `).all(userId, userData.min_age, userData.max_age) as any[];

    const filteredMatches = potentialMatches
      .map(match => {
        const distance = calculateDistance(
          userData.latitude,
          userData.longitude,
          match.latitude,
          match.longitude
        );
        return {
          ...match,
          distance,
          interests: match.interests ? match.interests.split(',') : [],
          is_online: isUserOnline(match.is_online, match.last_online)
        };
      })
      .filter(match => match.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json(filteredMatches);
  } catch (err) {
    res.status(500).json({ 
      error: 'Kunde inte hitta matchningar',
      details: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
    });
  }
});

// Starta servern
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Network: http://${getLocalIpAddress()}:${PORT}`);
});

// Hjälpfunktion för att hitta lokal IP
function getLocalIpAddress(): string {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}