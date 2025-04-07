import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DBInit, createUser, getUser, updateUser } from './db_operations';
import { Database } from 'sqlite';
import jwt from 'jsonwebtoken';

const httpServer = createServer();
const io = new Server(httpServer, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  } 
});

const JWT_SECRET = 'your-very-secure-secret-key';
let db: Database;

// Mappningar för sessioner
const userSockets = new Map<number, string>(); // <userId, socketId>
const socketUsers = new Map<string, number>();  // <socketId, userId>

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Återställ session om token finns
  socket.on('restore-session', async ({ userId }, callback) => {
    try {
      if (userSockets.has(userId)) {
        const oldSocketId = userSockets.get(userId);
        if (oldSocketId) {
          io.to(oldSocketId).emit('force-logout');
        }
      }

      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      socket.join(`user-${userId}`);

      callback({ success: true });
    } catch (err) {
      callback({ success: false, error: 'Session restoration failed' });
    }
  });

  // Hantera användarevent
  socket.on('user-event', (payload: { 
    userId: number, 
    event: string, 
    data: any 
  }, callback) => {
    // Verifiera att användaren är korrekt kopplad
    if (socketUsers.get(socket.id) !== payload.userId) {
      return callback?.({ success: false, error: 'Unauthorized' });
    }

    // Skicka till användarens privata rum
    io.to(`user-${payload.userId}`).emit(payload.event, payload.data, callback);
  });

  // Skapa konto
  socket.on('createAccount', async (userData, callback) => {
    try {
      const result = await createUser(db, userData.name, userData.email, 
        userData.password, userData.age, userData.gender, userData.interests);
      callback(result);
    } catch (err) {
      console.error('Error creating account:', err);
      callback({ success: false, error: 'Server error' });
    }
  });

  // Inloggning
  socket.on('login', async ({ email, password }, callback) => {
    try {
      const user = await db.get(
        `SELECT id FROM users WHERE email = ? AND password = ?`,
        [email, password]
      );
      
      if (user) {
        // Hantera dubbla sessioner
        if (userSockets.has(user.id)) {
          const oldSocketId = userSockets.get(user.id);
          if (oldSocketId) {
            io.to(oldSocketId).emit('force-logout');
          }
        }

        // Skapa JWT-token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // Spara session
        userSockets.set(user.id, socket.id);
        socketUsers.set(socket.id, user.id);
        socket.join(`user-${user.id}`);

        // Skicka online-status
        io.emit('online-status', { userId: user.id, isOnline: true });

        callback({ 
          success: true, 
          userId: user.id,
          token 
        });
      } else {
        callback({ success: false, error: 'Invalid email or password' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      callback({ success: false, error: 'Server error' });
    }
  });

  // Hämta profil
  socket.on('getUserProfile', async (userId, callback) => {
    try {
      // Verifiera att användaren har tillgång till denna profil
      const requestingUser = socketUsers.get(socket.id);
      if (requestingUser !== userId) {
        return callback({ success: false, error: 'Unauthorized' });
      }

      const result = await getUser(db, userId);
      callback(result);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      callback({ success: false, error: 'Server error' });
    }
  });

  // Uppdatera profil
  socket.on('updateUserProfile', async (updateData, callback) => {
    try {
      // Verifiera att användaren uppdaterar sin egen profil
      const requestingUser = socketUsers.get(socket.id);
      if (requestingUser !== updateData.id) {
        return callback({ success: false, error: 'Unauthorized' });
      }

      const result = await updateUser(db, updateData.id, updateData.name,
        updateData.email, updateData.age, updateData.sex, updateData.interests);
      callback(result);
    } catch (err) {
      console.error('Error updating user profile:', err);
      callback({ success: false, error: 'Server error' });
    }
  });

  // Logga ut
  socket.on('logout', (userId, callback) => {
    try {
      if (socketUsers.get(socket.id) === userId) {
        userSockets.delete(userId);
        socketUsers.delete(socket.id);
        socket.leave(`user-${userId}`);
        io.emit('online-status', { userId, isOnline: false });
      }
      callback({ success: true });
    } catch (err) {
      callback({ success: false, error: 'Logout failed' });
    }
  });

  // Koppling från
  socket.on('disconnect', () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      io.emit('online-status', { userId, isOnline: false });
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

async function main() {
  try {
    db = await DBInit();
    httpServer.listen(3000, () => {
      console.log('WebSocket server running on port 3000');
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

main();