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
  sex: number;
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
      age INTEGER NOT NULL CHECK(age < 122 AND age > 17),
      sex INTEGER NOT NULL CHECK(sex > 0 AND sex < 4)
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
    CREATE TABLE IF NOT EXISTS mapRoutesToUsers (
      userID INTEGER,
      routeID INTEGER,
      PRIMARY KEY (userID, routeID),
      FOREIGN KEY (userID) REFERENCES users(id),
      FOREIGN KEY (routeID) REFERENCES routes(id)
    )

  `); //maps users to routes, ID must exist in users and routes, the pairing must be unique 
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_userID ON mapRoutesToUsers(userID)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_routeID ON mapRoutesToUsers(routeID)`);
  //Skapar index-tree (binary search tror jag?) så att det går snabbt att plocka ut users som sparat en viss route och vice versa 

  return db;
}



// Inserts a new route and returns its ID.
export async function routeAdd(db: Database, data: JSON): Promise<DBResponse<number>> {
  try {
    const result = await db.run("INSERT INTO routes (data) VALUES (?)", JSON.stringify(data));

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
export async function createUser(db: Database, name: string, email: string, age: number, sex: number): Promise<DBResponse<number>> {
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
  if (age <= 17 || age > 122) {
    console.error("Invalid age:", age);
    return { success: false, error: "Invalid age." };
  }

  // Validate sex. (Assuming 1 = female, 2 = male, 3 = other)
  if (sex < 1 || sex > 3) {
    console.error("Invalid sex:", sex);
    return { success: false, error: "Invalid sex." };
  }

  try {
    const result = await db.run(
      `INSERT INTO users (name, email, age, sex) VALUES (?, ?, ?, ?)`,
      [name, email, age, sex]
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
  email: string, age: number, sex: number): Promise<DBResponse<boolean>> {

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
    if (age <= 17 || age > 122) {
      console.error("Invalid age:", age);
      return { success: false, error: "Invalid age." };
    }
  
    // Validate sex. (Assuming 1 = female, 2 = male, 3 = other)
    if (sex < 1 || sex > 3) {
      console.error("Invalid sex:", sex);
      return { success: false, error: "Invalid sex." };
    }
  
  try {
    const res = await db.run(
      `UPDATE users SET name = ?, email = ?, age = ?, sex = ? WHERE id = ?`,
      [name, email, age, sex, id]
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

export async function pairUserAndRoute(db: Database, userID: number, routeID: number): Promise <DBResponse<void>> {
  try {
    await db.run(`INSERT INTO mapRoutesToUsers (userID, routeID) VALUES(?, ?)`, [userID, routeID]);
    return { success: true };
  } catch (err) {
    console.error("Error inserting pair:", err);
    return { success: false, error: "Error inserting user/route pair"};
  }
}

export async function getAllRoutes(db: Database, userID: number): Promise <DBResponse<any>> {
  try {
    const rows = await db.all(`  
      SELECT r.*
      FROM routes r
      JOIN mapRoutesToUsers mr ON r.id = mr.routeID
      WHERE mr.userID = ?
      ORDER BY mr.routeID
    `, [userID]);
    console.log(rows); 

    return {success: true, data: rows};
  } catch (err) {
    console.error("Error getting all routes: ", err); 
    return { success: false, error: "Error getting all routes"}; 
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

export async function clearUsersRoutes(db: Database): Promise<boolean> {
  try {
    await db.run('DELETE FROM mapRoutesToUsers'); 
    await db.run('VACUUM'); 
    return true; 
  } catch (err) {
    console.error("Error clearing mapping table", err); 
    return false; 
  }
}




