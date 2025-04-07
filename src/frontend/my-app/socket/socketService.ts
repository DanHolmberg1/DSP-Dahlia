import { io, Socket } from 'socket.io-client';

interface LoginResponse {
  success: boolean;
  userId?: number;
  error?: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  age: number;
  sex: number;
  interests: string[];
}

interface UpdateProfileData {
  id: number;
  name: string;
  email: string;
  age: number;
  sex: number;
  interests: string[];
}

class SocketService {
  public socket: Socket | null = null;
  private static instance: SocketService;
  private userId: number | null = null;
  private authToken: string | null = null;
  private isAuthenticated = false;
  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://192.168.0.118:3000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: this.authToken ? { token: this.authToken } : undefined
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (this.userId) {
        this.socket?.emit('restore-session', { userId: this.userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('session-expired', () => {
      this.handleSessionExpired();
    });

    this.socket.on('force-logout', () => {
      this.handleForceLogout();
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.userId = null;
    this.authToken = null;
  }

  private handleSessionExpired() {
    console.log('Session expired');
    this.disconnect();
    // Här kan du lägga till logik för att omdirigera till inloggning
  }

  private handleForceLogout() {
    console.log('Force logout received');
    this.disconnect();
    // Här kan du lägga till logik för att visa meddelande till användaren
  }

  async login(credentials: { email: string, password: string }): Promise<LoginResponse> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        this.connect();
      }

      this.socket?.emit('login', credentials, (response: any) => {
        if (response?.success) {
          this.userId = response.userId;
          this.authToken = response.token;
          resolve({ success: true, userId: response.userId });
        } else {
          resolve({ success: false, error: response?.error || 'Login failed' });
        }
      });
    });
  }
  // Kolla om användaren är inloggad och hämta sessionen
  async checkExistingSession(): Promise<{ isLoggedIn: boolean, userId?: number }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ isLoggedIn: false });
        return;
      }

      this.socket.emit('check-session', {}, (response: { 
        isLoggedIn: boolean, 
        userId?: number 
      }) => {
        if (response.isLoggedIn) {
          this.isAuthenticated = true;
          this.userId = response.userId || null;
        }
        resolve(response);
      });
    });
  }
  // Logga ut användaren och rensa sessionen
  async logout(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.userId || !this.socket?.connected) {
        resolve(false);
        return;
      }

      this.socket.emit('logout', this.userId, () => {
        this.disconnect();
        resolve(true);
      });
    });
  }

  async createAccount(userData: any): Promise<{success: boolean, error?: string}> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      this.socket.emit('createAccount', userData, (response: any) => {
        resolve(response || { success: false, error: 'No response from server' });
      });
    });
  }

  async getUserProfile(userId: number): Promise<{success: boolean, data?: UserProfile, error?: string}> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      this.socket.emit('getUserProfile', userId, (response: any) => {
        resolve(response || { success: false, error: 'No response from server' });
      });
    });
  }

  async updateUserProfile(updateData: UpdateProfileData): Promise<{success: boolean, error?: string}> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      this.socket.emit('updateUserProfile', updateData, (response: any) => {
        resolve(response || { success: false, error: 'No response from server' });
      });
    });
  }

  // Användarspecifika events
  emitToUser(event: string, data: any, callback?: (response: any) => void) {
    if (!this.userId) {
      console.error('No user ID - please login first');
      return;
    }
    this.socket?.emit('user-event', { 
      userId: this.userId, 
      event, 
      data 
    }, callback);
  }

  // Lyssna på användarspecifika events
  onUserEvent(event: string, handler: (data: any) => void) {
    this.socket?.on(event, handler);
  }
}

export const socketService = SocketService.getInstance();