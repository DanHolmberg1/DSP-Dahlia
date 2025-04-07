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
  password: string;
  age: number;
  sex: number;
  interests: string[]; // Stored as a JSON string.
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
export async function DBInit(): Promise<Database> {
  const dbPath = path.resolve(__dirname, '../../db/database.db');
  // console.log("Using database file:", dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      age INTEGER NOT NULL CHECK(age < 122 AND age > 0),
      sex INTEGER NOT NULL CHECK(sex >= 0 AND sex <= 2),
      interests TEXT NOT NULL DEFAULT '[]'
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

  return db;
}



// Inserts a new route and returns its ID.
export async function routeAdd(db: Database, data: Coordinate[]): Promise<DBResponse<number>> {
  try {
    const jsonData = JSON.stringify(data);
    const result = await db.run("INSERT INTO routes (data) VALUES (?)", [jsonData]);

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
export async function createUser(db: Database, name: string, email: string, password: string, age: number, sex: number, interests: string[] = []): Promise<DBResponse<number>> {
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
  // Validate password.
  if (!password || password.length < 8) {
    console.error("Invalid password");
    return { success: false, error: "Password must be at least 8 characters." };
  }
  // Validate age.
  if (age <= 0 || age > 122) {
    console.error("Invalid age:", age);
    return { success: false, error: "Invalid age." };
  }

  // Validate sex. 0-2
  if (sex < 0 || sex > 2) {
    console.error("Invalid sex:", sex);
    return { success: false, error: "Invalid gender." };
  }
 // Validate interests
 if (!Array.isArray(interests)) {
  console.error("Invalid interests format");
  return { success: false, error: "Invalid interests format." };
}
//check if user already exists
try {
  const existingUser = await db.get(
    `SELECT email FROM users WHERE email = ?`, 
    [email]
  );
  
  if (existingUser) {
    return { success: false, error: "Email already exists." };
  }
} catch (err) {
  console.error("Error checking email:", err);
  return { success: false, error: "Error checking email availability." };
}

  try {
    const result = await db.run(
      `INSERT INTO users (name, email, password, age, sex, interests) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, age, sex, JSON.stringify(interests)]
    );

    if (result.lastID) {
      return { success: true, data: result.lastID };
    }
    return { success: false, error: "Failed to create user." };
  } catch (err) {
    console.error("Error creating user:", err);
      // if email already exists
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: "Email already exists." };
    }

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

export async function updateUser(
  db: Database,
  id: number,
  name: string,
  email: string,
  age: number,
  sex: number,
  interests: string[] = [] // Ny parameter med default-värde
): Promise<DBResponse<boolean>> {

  // Validera email
  const validEmailRegExp = new RegExp("^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$");
  if (!validEmailRegExp.test(email)) {
    console.error("Invalid email:", email);
    return { success: false, error: "Invalid email." };
  }

  if (!name.trim()) {
    console.error("Invalid name");
    return { success: false, error: "Invalid name." };
  }

  if (age <= 0 || age > 122) {
    console.error("Invalid age:", age);
    return { success: false, error: "Invalid age." };
  }

  if (sex < 0 || sex > 2) {
    console.error("Invalid sex:", sex);
    return { success: false, error: "Invalid sex." };
  }

  // Validera intressen
  if (!Array.isArray(interests)) {
    console.error("Invalid interests format");
    return { success: false, error: "Invalid interests format." };
  }

  try {
    const res = await db.run(
      `UPDATE users SET name = ?, email = ?, age = ?, sex = ?, interests = ? WHERE id = ?`,
      [name, email, age, sex, JSON.stringify(interests), id] // Lägg till interests
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
    console.error("Error clearing table", err);
    return false;
  }
}