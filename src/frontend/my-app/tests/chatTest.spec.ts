// // chatTest.spec.ts
// import { chatAPI } from '../http/chatAPI';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   age: number;
//   gender: number;
// }

// interface Chat {
//   id: number;
//   name: string;
// }

// interface Message {
//   id: number;
//   content: string;
//   userId: number;
//   userName: string;
//   sent_at: string;
// }

// describe('Advanced Chat Tests', () => {
//   let user1: User;
//   let user2: User;
//   let chat: Chat;

//   beforeAll(async () => {
//     try {
//       await chatAPI.healthCheck();
  
//       // Rensa data i rätt ordning med mer robust felhantering
//       try {
//         // 1. Ta bort alla meddelanden först
//         const chats = await chatAPI.getChats();
//         for (const chat of chats) {
//           const messages = await chatAPI.getAllMessages(chat.id);
//           for (const msg of messages) {
//             await chatAPI.deleteMessage(msg.id);
//           }
//         }
  
//         // 2. Ta bort alla chatmedlemskap
//         // (Lägg till denna funktion i din API)
//         await chatAPI.removeAllChatMembers();
  
//         // 3. Ta bort användare och chattar
//         const users = await chatAPI.getUsers();
//         for (const user of users) {
//           await chatAPI.deleteUser(user.id); // Testar deleteUser
//         }
  
//         const remainingChats = await chatAPI.getChats();
//         for (const chat of remainingChats) {
//           await chatAPI.deleteChat(chat.id); // Testar deleteChat
//         }
  
//       } catch (e) {
//         console.error('Rensning misslyckades:', e);
//         throw e; // Kasta vidare felet så testet failar tydligt
//       }
  
//       // Skapa ny testdata
//       const timestamp = Date.now();
//       user1 = await chatAPI.createUser(`Alice_${timestamp}`, `alice_${timestamp}@test.com`, 28, 1);
//       user2 = await chatAPI.createUser(`Bob_${timestamp}`, `bob_${timestamp}@test.com`, 32, 2);
//       chat = await chatAPI.createChat(`Testchat_${timestamp}`, [user1.id, user2.id]);
  
//     } catch (e) {
//       console.error('Test Setup Failed:', e);
//       throw e;
//     }
//   }, 20000);

//   afterAll(async () => {
//     if (user1?.id) await chatAPI.deleteUser(user1.id);
//     if (user2?.id) await chatAPI.deleteUser(user2.id);
//     if (chat?.id) await chatAPI.deleteChat(chat.id);
//   });

//   describe('Message Handling Tests', () => {
//     beforeEach(async () => {
//       // Rensa alla meddelanden mellan tester
//       try {
//         const messages = await chatAPI.getMessages(chat.id, user1.id);
//         for (const msg of messages) {
//           await chatAPI.deleteMessage(msg.id);
//         }
//       } catch (e) {
//         console.log('Inga meddelanden att rensa');
//       }
//     });

//     it('should only show user their own messages', async () => {
//       await chatAPI.sendMessage(user1.id, "Meddelande från Alice", chat.id);
//       await chatAPI.sendMessage(user2.id, "Meddelande från Bob", chat.id);

//       const aliceMessages = await chatAPI.getMessages(chat.id, user1.id);
//       const bobMessages = await chatAPI.getMessages(chat.id, user2.id);

//       expect(aliceMessages.some((m: Message) => m.content === "Meddelande från Alice")).toBe(true);
//       expect(aliceMessages.some((m: Message) => m.content === "Meddelande från Bob")).toBe(false);
//       expect(bobMessages.some((m: Message) => m.content=== "Meddelande från Bob")).toBe(true);
//     });

//     it('should store and retrieve message history', async () => {
//       const testMessage = 'Test message ' + Date.now();
//       await chatAPI.sendMessage(user1.id, testMessage, chat.id);
      
//       const messages = await chatAPI.getMessages(chat.id, user1.id);
//       expect(messages.some((m: Message) => m.content === testMessage)).toBe(true);
//     });

//   // tests/chatTest.spec.ts
//   it('should preserve message order by timestamp', async () => {
//     // 1. Rensa befintliga meddelanden
//     const existingMessages = await chatAPI.getMessages(chat.id, user1.id);
//     for (const msg of existingMessages) {
//       try {
//         await chatAPI.deleteMessage(msg.id);
//       } catch (e) {
//         console.log('Could not delete message:', msg.id);
//       }
//     }
  
//     // 2. Skicka nya meddelanden med delay
//     const messages = [
//       `Message_1_${Date.now()}`,
//       `Message_2_${Date.now()}`,
//       `Message_3_${Date.now()}`
//     ];
  
//     for (const msg of messages) {
//       await chatAPI.sendMessage(user1.id, msg, chat.id);
//       await new Promise(resolve => setTimeout(resolve, 1000)); // 100ms mellan meddelanden
//     }
  
//     // 3. Verifiera ordning
//     const retrieved = await chatAPI.getMessages(chat.id, user1.id);
//     const contents = retrieved.map((m: Message) => m.content);
    
//     // Förväntad ordning: senaste först (DESC)
//     expect(contents).toEqual([messages[2], messages[1], messages[0]]);
//   });
//   });

//   describe('Edge Cases', () => {
//     it('should handle user deletion gracefully', async () => {
//       const timestamp = Date.now();
//       const tempUser = await chatAPI.createUser(
//         `Temp_${timestamp}`, 
//         `temp_${timestamp}@test.com`, 
//         25, 
//         1
//       );
      
//       // Skapa en ny chat för testet
//       const tempChat = await chatAPI.createChat(
//         `TempChat_${timestamp}`, 
//         [tempUser.id, user1.id]
//       );
      
//       await chatAPI.sendMessage(tempUser.id, "Testmeddelande", tempChat.id);
//       await chatAPI.deleteUser(tempUser.id);

//       // Verifiera att användaren inte kan komma åt chatten
//       await expect(
//         chatAPI.getMessages(tempChat.id, tempUser.id)
//       ).rejects.toThrow(/User not found/i);
      
//       // Rensa upp
//       await chatAPI.deleteChat(tempChat.id);
//     });

//     it('should handle unicode characters in messages', async () => {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       const unicodeMsg = "Hello 😊 你好 नमस्ते";
//       await chatAPI.sendMessage(user1.id, unicodeMsg, chat.id);
//       const messages = await chatAPI.getMessages(chat.id, user1.id);
//       expect(messages[0].content).toContain("😊");
//     });

//     it('should handle empty messages (only whitespace)', async () => {
//       await expect(chatAPI.sendMessage(user1.id, '   ', chat.id))
//         .rejects.toThrow(/content|required/i);
//     });

//     describe('Message edge cases', () => {
//       it('should allow reasonably long messages', async () => {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         // Testa med en mer realistisk längd som fungerar med din backend
//         const longMsg = "A".repeat(1000);
//         await chatAPI.sendMessage(user1.id, longMsg, chat.id);
//         const messages = await chatAPI.getMessages(chat.id, user1.id);
//         expect(messages[0].content.length).toBeGreaterThanOrEqual(1000);
//       });

//       it('should handle special characters', async () => {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         const testMsg = "Specialtecken: 😊 你好 नमस्ते";
//         await chatAPI.sendMessage(user1.id, testMsg, chat.id);
//         const messages = await chatAPI.getMessages(chat.id, user1.id);
//         expect(messages[0].content).toContain("😊");
//       });
//     });
//   });

//   describe('User Management Tests', () => {
//     it('should create users with valid data', async () => {
//       const timestamp = Date.now();
//       const newUser = await chatAPI.createUser(
//         `Charlie_${timestamp}`, 
//         `charlie_${timestamp}@example.com`, 
//         30, 
//         3
//       );
//       expect(newUser).toHaveProperty('id');
//       expect(newUser.name).toBe(`Charlie_${timestamp}`);
//       await chatAPI.deleteUser(newUser.id);
//     });

//     it('should reject invalid email formats', async () => {
//       const timestamp = Date.now();
//       await expect(chatAPI.createUser(
//         `Dave_${timestamp}`, 
//         'invalid-email', 
//         25, 
//         1
//       )).rejects.toThrow(/email|invalid/i);
//     });
//   });

//   describe('Chat Room Tests', () => {
//     it('should create chat rooms with multiple users', async () => {
//       const timestamp = Date.now();
//       const newChat = await chatAPI.createChat(
//         `GroupProject_${timestamp}`, 
//         [user1.id, user2.id]
//       );
//       expect(newChat).toHaveProperty('id');
      
//       const chats = await chatAPI.getChats();
//       expect(chats.some((c: Chat) => c.id === newChat.id)).toBe(true);
//       await chatAPI.deleteChat(newChat.id);
//     });

//     it('should prevent creating chats with no users', async () => {
//       const timestamp = Date.now();
//       await expect(chatAPI.createChat(
//         `EmptyChat_${timestamp}`, 
//         []
//       )).rejects.toThrow(/users|required/i);
//     });
//   });

//   describe('Security Tests', () => {
//     it('should enforce chat membership for message access', async () => {
//       const timestamp = Date.now();
//       const outsider = await chatAPI.createUser(
//         `Outsider_${timestamp}`, 
//         `outsider_${timestamp}@example.com`, 
//         40, 
//         1
//       );
      
//       await expect(chatAPI.getMessages(chat.id, outsider.id))
//         .rejects.toThrow(/member|access/i);
      
//       await chatAPI.deleteUser(outsider.id);
//     });
//   });
//   it('should delete user and verify user is removed', async () => {
//     const timestamp = Date.now();
//     const tempUser = await chatAPI.createUser(
//       `DeleteMe_${timestamp}`,
//       `deleteme_${timestamp}@test.com`,
//       23,
//       1
//     );

//     const usersBefore = await chatAPI.getUsers();
//     expect(usersBefore.some((u: User) => u.id === tempUser.id)).toBe(true);

//     await chatAPI.deleteUser(tempUser.id);

//     const usersAfter = await chatAPI.getUsers();
//     expect(usersAfter.some((u: User) => u.id === tempUser.id)).toBe(false);
//   });
//   it('should delete chat and verify chat is removed', async () => {
//     const timestamp = Date.now();
//     const testChat = await chatAPI.createChat(
//       `DeleteChat_${timestamp}`,
//       [user1.id, user2.id]
//     );

//     const chatsBefore = await chatAPI.getChats();
//     expect(chatsBefore.some((c: Chat) => c.id === testChat.id)).toBe(true);

//     await chatAPI.deleteChat(testChat.id);

//     const chatsAfter = await chatAPI.getChats();
//     expect(chatsAfter.some((c: Chat) => c.id === testChat.id)).toBe(false);
//   });
// });