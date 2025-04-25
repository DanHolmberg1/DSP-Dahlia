// import request from 'supertest';
// import { app, startServer, stopServer } from './server';

// describe('Chat Server', () => {
//   beforeAll(async () => {
//     await startServer(0); // Startar server på en random ledig port
//   });

//   afterAll(async () => {
//     await stopServer(); // Stänger server och DB
//   });

//   it('should return chat ID when creation succeeds', async () => {
//     const res = await request(app)
//       .post('/chats')
//       .send({ name: 'Test Chat' });
  
//     expect(res.status).toBe(200);
//     expect(res.body.success).toBe(true);
//     expect(typeof res.body.data).toBe('number'); // ID är ett nummer
//   });
// });
