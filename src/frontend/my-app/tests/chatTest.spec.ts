import { chatAPI } from '../http/chatAPI';

describe('Basic Chat Tests', () => {
  beforeAll(async () => {
    console.log('Make sure test server is running on port 3000');
    try {
      const health = await chatAPI.healthCheck();
      if (health.status !== 'OK') {
        throw new Error('Server health check failed');
      }
    } catch (err) {
      console.error('Server not responding:', err);
      throw err; // Detta kommer att faila alla tester
    }
  });

  it('should have server running', async () => {
    await expect(chatAPI.healthCheck()).resolves.toEqual({
      status: 'OK',
      timestamp: expect.any(String)
    });
  });

  it('should list test users', async () => {
    await expect(chatAPI.healthCheck()).resolves.toHaveProperty('status', 'OK');
    const users = await chatAPI.getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(5);
    expect(users[0]?.name).toBe('Alice');
  });

  it('should send and receive messages', async () => {
    await chatAPI.sendMessage(1, 'Hello from Alice');
    await chatAPI.sendMessage(2, 'Hi from Bob');
    
    const messages = await chatAPI.getMessages();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages.some((m: { content: string }) => m.content.includes('Alice'))).toBe(true);
    expect(messages.some((m: { content: string }) => m.content.includes('Bob'))).toBe(true);
  });
  it('should fail when sending empty message', async () => {
    await expect(chatAPI.sendMessage(1, ''))
      .rejects
      .toThrow('userId and content are required');
  });

  it('should fail when sending message with invalid user', async () => {
    await expect(chatAPI.sendMessage(999, 'Test message'))
      .rejects
      .toThrow('Invalid user ID');
  });

  it('should return messages in chronological order', async () => {
    const users = await chatAPI.getUsers();
    const userId = users[0].id;
  
    const testMessage1 = `ChronoTest ${Date.now()}-1`;
    await chatAPI.sendMessage(userId, testMessage1);
    await new Promise((r) => setTimeout(r, 10)); // minimal delay
  
    const testMessage2 = `ChronoTest ${Date.now()}-2`;
    await chatAPI.sendMessage(userId, testMessage2);
  
    const messages = await chatAPI.getMessages();
  
    // Hämta bara de du precis skapade
    const found1 = messages.find((m) => m.content === testMessage1);
    const found2 = messages.find((m) => m.content === testMessage2);
  
    expect(found1).toBeDefined();
    expect(found2).toBeDefined();
  
    const time1 = new Date(found1!.sent_at).getTime();
    const time2 = new Date(found2!.sent_at).getTime();
  
    // Om de har samma timestamp, tillåt ändå testet att passera
    expect(time1).toBeLessThanOrEqual(time2); // ändrat här!
  });

  it('should handle special characters in messages', async () => {
    const specialMessage = 'Test message with spéciäl chäråct€rs!@#$%^&*()';
    await chatAPI.sendMessage(1, specialMessage);
    
    const messages = await chatAPI.getMessages();
    expect(messages.some(m => m.content === specialMessage)).toBe(true);
  });

  it('should handle long messages', async () => {
    const longMessage = 'A'.repeat(1000);
    await chatAPI.sendMessage(1, longMessage);
    
    const messages = await chatAPI.getMessages();
    const foundMessage = messages.find(m => m.content === longMessage);
    expect(foundMessage).toBeDefined();
    expect(foundMessage?.content.length).toBe(1000);
  });

  it('should return user details with messages', async () => {
    const messages = await chatAPI.getMessages();
    messages.forEach(message => {
      expect(message).toHaveProperty('userId');
      expect(message).toHaveProperty('userName');
      expect(typeof message.userId).toBe('number');
      expect(typeof message.userName).toBe('string');
    });
  });

  it('should filter messages by user', async () => {
    const aliceMessages = (await chatAPI.getMessages())
      .filter(m => m.userName === 'Alice');
    
    expect(aliceMessages.length).toBeGreaterThan(0);
    aliceMessages.forEach(msg => {
      expect(msg.userName).toBe('Alice');
    });
  });
});