import { chatAPI } from '../http/chatAPI';

describe('Basic Chat Tests', () => {
  beforeAll(async () => {
    const health = await chatAPI.healthCheck();
    expect(health.status).toBe('OK');

    // Skapa några användare via API
    const user1 = await chatAPI.createUser('Alice', 'alice@example.com', 28, 1);
    const user2 = await chatAPI.createUser('Bob', 'bob@example.com', 32, 2);

    // Skapa en chatt via API och lägg till användare
    const chat = await chatAPI.createChat('Testchat', [user1.id, user2.id]);

    expect(chat.name).toBe('Testchat');
  });

  it('should list users', async () => {
    const users = await chatAPI.getUsers();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  it('should send and retrieve messages', async () => {
    const user = await chatAPI.getUsers();
    const userId = user[0].id;

    await chatAPI.sendMessage(userId, 'Test message from Alice');
    const messages = await chatAPI.getMessages();
    expect(messages.some((m: any) => m.content === 'Test message from Alice')).toBe(true);
  });
});
