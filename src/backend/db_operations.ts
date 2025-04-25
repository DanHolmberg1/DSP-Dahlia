
//db_operations.ts

import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as path from 'path';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: number;
}
export interface Chat {
  id: number;
  name: string;
  created_at: string;
}

export interface ChatMember {
  chat_id: number;
  user_id: number;
  joined_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  sent_at: string;
}
export interface Route {
  id: number;
  data: string; // Stored as a JSON string.
}

// A generic response type for all database operations.
export interface DBResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}


// Initialize the database with the required tables.
// nameing????
export async function DBInit(dbPath: string = '../../db/database.db'): Promise<Database> {
  const resolvedPath = dbPath === ':memory:' ? ':memory:' : path.resolve(__dirname, dbPath);
  console.log("Database path:", resolvedPath);

  const db = await open({
    filename: resolvedPath,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      age INTEGER NOT NULL CHECK(age < 122 AND age > 0),
      gender INTEGER NOT NULL CHECK(gender > 0 AND gender < 4)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routeID INTEGER,
      distance INTEGER,
      users TEXT
      )
    `); // Store users as json

  await db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT UNIQUE
    )
  `); // data = routes i json

  await db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_members (
      chat_id INTEGER,
      user_id INTEGER,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (chat_id, user_id),
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER,
      user_id INTEGER,
      content TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  return db;
}



// Inserts a new route and returns its ID.
export async function routeAdd(db: Database, data: string): Promise<DBResponse<number>> {
  try {
    //const jsonData = JSON.stringify(data);
    const result = await db.run("INSERT INTO routes (data) VALUES (?)", data);

    if (result.changes && result.lastID) {
      return { success: true, data: result.lastID };
    }
    return { success: false, error: "No changes made when inserting route." };
  } catch (error) {
    console.error("Error inserting route:", error);
    return { success: false, error: "Error inserting route." };
  }
}

// Deletes a route by its ID.
export async function routeDelete(db: Database, id: number): Promise<DBResponse<boolean>> {
  try {
    const result = await db.run("DELETE FROM routes WHERE id = ?", [id]);
    return { success: true, data: (result.changes && result.changes > 0) || false };
  } catch (err) {
    console.error("Error deleting route:", err);
    return { success: false, error: "Error deleting route." };
  }
}

// Retrieves a route by its ID.
export async function routeGet(db: Database, id: number): Promise<DBResponse<Route>> {
  try {
    const route = await db.get("SELECT * FROM routes WHERE id = ?", [id]);
    if (!route) {
      return { success: false, error: "Route not found." };
    }
    console.log(route);
    return { success: true, data: route };
  } catch (err) {
    console.error("Error retrieving route:", err);
    return { success: false, error: "Error retrieving route." };
  }
}

// Creates a new group (stub implementation)
// id = userID of the creator of the group
export async function groupCreate(db: Database, routeID: number, distance: number): Promise<DBResponse<number>> {
  try {
    const res = await db.run("INSERT INTO groups (routeID, distance) VALUES (?, ?)", [routeID, distance]);
    if (res.changes && res.lastID) {
      return { success: true, data: res.lastID };
    }
    return { success: false, error: "Please report, unexpected failure." };
  } catch (err) {
    console.error("Error creating group:", err);
    return { success: false, error: "Error creating group." };
  }
}

export async function groupAdd(db: Database, userID: number, groupID: number): Promise<DBResponse<void>> {
  try {
    const res = await db.run(`UPDATE groups SET users = ? WHERE id = ?`, [userID, groupID]);
    if (res.changes) {
      return { success: true };
    }
    return { success: false, error: "Failed to update group, please report" };
  } catch (err) {
    return { success: false, error: "Error adding user to group" };
  }
}



// Creates a new user record.
export async function createUser(db: Database, name: string, email: string, age: number, gender: number): Promise<DBResponse<number>> {
  // Validate email.
  const validEmailRegExp = new RegExp("^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$");
  if (!validEmailRegExp.test(email)) {
    console.error("Invalid email:", email);
    return { success: false, error: "Invalid email." };
  }

  // Validate name.
  if (!name.trim()) {
    console.error("Invalid name");
    return { success: false, error: "Invalid name." };
  }

  // Validate age.
  if (age <= 0 || age > 122) {
    console.error("Invalid age:", age);
    return { success: false, error: "Invalid age." };
  }

  // Validate gender. (Assuming 1 = female, 2 = male, 3 = other)
  if (gender < 1 || gender > 3) {
    console.error("Invalid gender:", gender);
    return { success: false, error: "Invalid gender." };
  }

  try {
    const result = await db.run(
      `INSERT INTO users (name, email, age, gender) VALUES (?, ?, ?, ?)`,
      [name, email, age, gender]
    );

    if (result.lastID) {
      return { success: true, data: result.lastID };
    }
    return { success: false, error: "Failed to create user." };
  } catch (err) {
    console.error("Error creating user:", err);
    return { success: false, error: "Error creating user." };
  }
}

// Retrieves a user record by ID.
export async function getUser(db: Database, id: number): Promise<DBResponse<User>> {
  try {
    const user = await db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!user) {
      return { success: false, error: "User not found." };
    }
    return { success: true, data: user };
  } catch (err) {
    console.error("Error retrieving user:", err);
    return { success: false, error: "Error retrieving user." };
  }
}

// Updates a user record by ID.
export async function updateUser(db: Database, id: number, name: string, 
  email: string, age: number, gender: number): Promise<DBResponse<boolean>> {

    // Validate email. ska man kunna uppdatera email?? 
    const validEmailRegExp = new RegExp("^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$");
    if (!validEmailRegExp.test(email)) {
      console.error("Invalid email:", email);
      return { success: false, error: "Invalid email." };
    }
  
    // Validate name.
    if (!name.trim()) {
      console.error("Invalid name");
      return { success: false, error: "Invalid name." };
    }
  
    // Validate age.
    if (age <= 0 || age > 122) {
      console.error("Invalid age:", age);
      return { success: false, error: "Invalid age." };
    }
  
    // Validate gender. (Assuming 1 = female, 2 = male, 3 = other)
    if (gender < 1 || gender > 3) {
      console.error("Invalid gender:", gender);
      return { success: false, error: "Invalid gender." };
    }
  
  try {
    const res = await db.run(
      `UPDATE users SET name = ?, email = ?, age = ?, gender = ? WHERE id = ?`,
      [name, email, age, gender, id]
    );
    return { success: true, data: (res.changes && res.changes > 0) || false };
  } catch (err) {
    console.error("Error updating user:", err);
    return { success: false, error: "Error updating user." };
  }
}

// Deletes a user record by ID.
export async function deleteUser(db: Database, id: number): Promise<DBResponse<null>> {
  try {
    await db.run(`DELETE FROM users WHERE id = ?`, [id]);
    return { success: true, data: null };
  } catch (err) {
    console.error("Error deleting user:", err);
    return { success: false, error: "Error deleting user." };
  }
}

export async function clearUsers(db: Database): Promise<boolean> {
  try {
    await db.run('DELETE FROM users'); 
    await db.run('VACUUM'); 
    return true; 
  } catch (err) {
    console.error("Error clearing users table", err); 
    return false; 
  }
}

export async function clearRoutes(db: Database): Promise<boolean> {
  try {
    await db.run('DELETE FROM routes'); 
    await db.run('VACUUM'); 
    return true; 
  } catch (err) {
    console.error("Error clearing routes table", err); 
    return false; 
  }
}

export async function clearGroups(db: Database): Promise<boolean> {
  try {
    await db.run('DELETE FROM groups'); 
    await db.run('VACUUM'); 
    return true; 
  } catch (err) {
    console.error("Error clearing routes table", err); 
    return false; 
  }
}

// Lägg till dessa interface i din db_operations.ts
export interface Chat {
  id: number;
  name: string;
  created_at: string;
}

export interface ChatMember {
  chat_id: number;
  user_id: number;
  joined_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  sent_at: string;
}

// Lägg till dessa funktioner i din db_operations.ts:

// Skapa en ny chat
export async function createChat(db: Database, name: string): Promise<DBResponse<number>> {
  if (!name.trim()) {
    return { success: false, error: "Chat name required" };
  }

  try {
    const result = await db.run("INSERT INTO chats (name) VALUES (?)", [name]);
    return result.lastID 
      ? { success: true, data: result.lastID }
      : { success: false, error: "Failed to create chat" };
  } catch (err) {
    console.error("Error creating chat:", err);
    return { success: false, error: "Database error" };
  }
}

// Lägg till användare i chat
export async function addUserToChat(db: Database, chatId: number, userId: number): Promise<DBResponse<void>> {
  try {
    await db.run("INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)", [chatId, userId]);
    return { success: true };
  } catch (err) {
    console.error("Error adding user to chat:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Database error" 
    };
  }
}

// Skicka meddelande
export async function sendMessage(db: Database, chatId: number, userId: number, content: string): Promise<DBResponse<number>> {
  try {
    const result = await db.run(
      "INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)",
      [chatId, userId, content]
    );
    if (result.lastID) {
      return {
        success: true,
        data: result.lastID // Only include defined properties
      };
    }
    return { success: false, error: "Failed to send message" };
  } catch (err) {
    console.error("Error sending message:", err);
    return { success: false, error: "Error sending message" };
  }
}

// Hämta meddelanden för en chat
export async function getMessages(db: Database, chatId: number, limit: number = 50): Promise<DBResponse<Message[]>> {
  try {
    const messages = await db.all(
      "SELECT * FROM messages WHERE chat_id = ? ORDER BY sent_at DESC LIMIT ?",
      [chatId, limit]
    );
    return { 
      success: true, 
      data: messages.reverse() // Correctly return the messages array
    };
  } catch (err) {
    console.error("Error getting messages:", err);
    return { success: false, error: "Error getting messages" };
  }
}

// Hämta användarens chattar
export async function getUserChats(db: Database, userId: number): Promise<DBResponse<Chat[]>> {
  try {
    const chats = await db.all(
      `SELECT c.* FROM chats c
       JOIN chat_members cm ON c.id = cm.chat_id
       WHERE cm.user_id = ?`,
      [userId]
    );
    return { success: true, data: chats };
  } catch (err) {
    console.error("Error getting user chats:", err);
    return { success: false, error: "Error getting user chats" };
  }
}

// Rensa chat-tabeller (för tester)
export async function clearChats(db: Database): Promise<boolean> {
  try {
    await db.run('DELETE FROM messages');
    await db.run('DELETE FROM chat_members');
    await db.run('DELETE FROM chats');
    return true;
  } catch (err) {
    console.error('Error clearing chats:', err);
    return false;
  }
}