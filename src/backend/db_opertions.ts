import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

async function initDB(): Promise<Database> {
  
  
  const dbPath = path.resolve(__dirname, '../../db/database.db');
  console.log("Using database file:", dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      age INTEGER NOT NULL CHECK(age<122 AND age > 0),
      sex INTEGER NOT NULL CHECK(sex > 0 AND sex < 4)
    )
  `); // sex -> int, 1 = female, 2 = male, 3 = other. 

  return db;
}

// create Group
// id = userID of creater of group
// return groupID
async function createGroup(db: Database, id: number, startingPoint: geojson, distance: number): Promise<number> {
  return -1
}

// Create (Insert) a new user record
async function createUser(db: Database, name: string, email: string, age: number, sex: number
): Promise<number> {

  //Validate email
  let validEmailRegExp = new RegExp("^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$");
  if(!validEmailRegExp.test(email)){
    console.error("invalid email");
    return -1;
  }

  //Validate name
  if(!name.trim()){
    console.error("Invalid name");
    return -1;
  }
  
  //Validate age
  if(age < 0 || age > 122){
    console.error("Invalid age");
    return -1;
  }

  //Validate sex
  if(sex < 0 || sex > 4){
    console.error("Invalid sex");
    return -1;
  }

  const result = await db.run(
    `INSERT INTO users (name, email, age, sex) VALUES (?, ?, ?, ?)`,
    [name, email, age, sex]
  );

  return result.lastID!;
}

// Read (Select) a user record by ID
async function getUser(db: Database, id: number): Promise<any> {
  return await db.get(`SELECT * FROM users WHERE id = ?`, id);
}

// Update a user record by ID
async function updateUser(
  db: Database,
  id: number,
  name: string,
  email: string,
  age: number | null,
  sex: number
): Promise<void> {
  await db.run(
    `UPDATE users SET name = ?, email = ?, age = ?, sex = ? WHERE id = ?`,
    [name, email, age, sex, id]
  );
}

// Delete a user record by ID
async function deleteUser(db: Database, id: number): Promise<void> {
  await db.run(`DELETE FROM users WHERE id = ?`, id);
}

// Example usage of the CRUD functions
async function main() {
  try {
    // Initialize the database
    const db = await initDB();

    // Create a new user
    const userId = await createUser(db, 'John Doe', 'johsnexample.com', 30, 1);
    if(userId === -1){
      console.error("some error");
    } else{
      console.log(`User created with ID: ${userId}`);
    }
    
  } catch (err){
    console.error(err)
    return -1
  }
}

main();