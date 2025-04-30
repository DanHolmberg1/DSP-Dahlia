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
  avatar?: string; 
  latitude?: number;
  longitude?: number;
  bio?: string;
  pace?: string; // Pace in minutes per kilometer.
  features?: string; // JSON string of features.
  friends?: Array<User>; // List of friends.
  created_at?: string; // Date of creation.
}

export interface Route {
  id: number;
  data: string; // Stored as a JSON string.
}

export interface Group {
  id: number; 
  routeID: number;
  description: string;
  groupName: string;
  availableSpots: number; 
  datetime: string; 
}

// A generic response type for all database operations.
export interface DBResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Chat message interface.
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
// Initialize the database with the required tables.
// nameing????
export async function DBInit(): Promise<Database> {
  const dbPath = path.resolve(__dirname, '../../db/database.db');
  // console.log("Using database file:", dbPath);
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  try {

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        age INTEGER NOT NULL CHECK(age < 122 AND age > 17),
        sex INTEGER NOT NULL CHECK(sex > 0 AND sex < 4),
        latitude REAL,
        longitude REAL,
        bio TEXT,
        pace TEXT,
        features TEXT,
        avatar TEXT
      )
    `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT UNIQUE
    )
  `); // data = routes i json

  //await db.exec(`DROP TABLE IF EXISTS groups`); //run if you made changes to any table 

  await db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routeID INTEGER NOT NULL,
      description TEXT NOT NULL, 
      groupName TEXT NOT NULL, 
      availableSpots INTEGER NOT NULL CHECK(availableSpots < 11 AND availableSpots > -1),
      datetime TEXT NOT NULL,
      FOREIGN KEY (routeID) REFERENCES routes(id) ON DELETE CASCADE
    )
  `);
  //datetime ISO 8601 format: "YYYY-MM-DD HH:MM:SS"
    //Maybe add starting location and distance, if we want to sort based on that?? 

  await db.exec(`
    CREATE TABLE IF NOT EXISTS mapRoutesToUsers (
      userID INTEGER,
      routeID INTEGER,
      PRIMARY KEY (userID, routeID),
      FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (routeID) REFERENCES routes(id) ON DELETE CASCADE
    )
  `); //maps users to routes, ID must exist in users and routes, the pairing must be unique 


  await db.exec(`
    CREATE TABLE IF NOT EXISTS mapGroupsToUsers (
      userID INTEGER,
      groupID INTEGER,
      PRIMARY KEY (userID, groupID),
      FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (groupID) REFERENCES groups(id) ON DELETE CASCADE
    )
  `);

//chat tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER,
      friend_id INTEGER,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_members (
      chat_id INTEGER,
      user_id INTEGER,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_read_at DATETIME, 
      PRIMARY KEY (chat_id, user_id),
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER,
    user_id INTEGER,
    content TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
await db.exec(`
  CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id)
`); // for faster access to chat members by user ID(behövs egentligen inte för små dataset men hjälpte i enhetstester)


  //Creates search trees based on userID and routeID 
  //routes - users search trees 
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_userID ON mapRoutesToUsers(userID)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_routeID ON mapRoutesToUsers(routeID)`);

  //groups - users search trees 
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_userID ON mapGroupsToUsers(userID)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_groupID ON mapGroupsToUsers(groupID)`);

  //groups - date search trees 
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_groups_datetime ON groups(datetime)`);
  

  //Allows deletion to happen automatically in the mapRoutesToUsers table 
  await db.exec("PRAGMA foreign_keys = ON");

  return db;
  } catch (err) {
    console.error("Failed to create db" + err); 
    return db; 
  }
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
    return { success: true, data: route };
  } catch (err) {
    console.error("Error retrieving route:", err);
    return { success: false, error: "Error retrieving route." };
  }
}

//Creates a new walking group, creator is automatically added 
export async function groupCreate(db: Database, userID: number, routeID: number, description: string, groupName: string, spots: number, date: Date): Promise<DBResponse<number>> {
  if( !description || !groupName ){
    return {success: false, error: "no description or name"}; 
  }

  if(spots <= 0 || spots > 10) {
    return {success: false, error: "invalid amount of spots"}
  }

  if(!(date instanceof Date) || isNaN(date.getTime())) {
    return {success: false, error: "Invalid date"}; 
  }

  try {
    /*//Kanske onödigt??? 
    const routeStatus = await routeGet(db, routeID); 
    if(routeStatus.success === false) {
      return { success: false, error: "Could not find route" }; 
    }*/
    const dateS = date.toISOString(); 

    const resGroup = await db.run(`INSERT INTO groups (routeID, description, groupName, availableSpots, datetime) VALUES (?, ?, ?, ?, ?)`,
                                   [routeID, description, groupName, spots, dateS]);

    if (resGroup.changes && resGroup.lastID && (await groupAdd(db, userID, resGroup.lastID)).success) {
      return { success: true, data: resGroup.lastID };
    }
    
    return { success: false, error: "Please report, unexpected failure." };

  } catch (err) {
    console.error("Error creating group:", err);
    return { success: false, error: "Error creating group." };
  }
}

//Pairs user and group 
export async function groupAdd(db: Database, userID: number, groupID: number): Promise<DBResponse<void>> {
  try {
    await db.exec("BEGIN TRANSACTION"); //enables rollbacks just in case 

    const groupInfo = await groupGet(db, groupID); 

    if(groupInfo.success && groupInfo.data && groupInfo.data.availableSpots > 0) {
      const updateStatus = await db.run(
        `UPDATE groups SET availableSpots = ? WHERE id = ?`,
        [groupInfo.data.availableSpots - 1, groupID]
      );
      if(!updateStatus.changes) {
        await db.exec(`ROLLBACK`); 
        return {success: false}; 
      }
    } else {
      await db.exec(`ROLLBACK`); 
      return {success: false}; 
    }

    const res = await db.run(`INSERT INTO mapGroupsToUsers (userID, groupID) VALUES(?, ?)`, [userID, groupID]);

    if (res.changes) {
      await db.exec("COMMIT");
      return { success: true };
    }
    await db.exec(`ROLLBACK`); 
    return { success: false, error: "Failed to update group, please report" };
  } catch (err) {
    await db.exec(`ROLLBACK`); 
    console.error("Error adding user to group" + err); 
    return { success: false, error: "Error adding user to group" };
  }
}

//Checks if a user is in a group (group ID, user ID)
export async function isInGroup(db: Database, userID: number, groupID: number): Promise<DBResponse<void>> {
  try {
    const res = await db.get(`
      SELECT * FROM mapGroupsToUsers
      WHERE userID = ? AND groupID = ?
    `, [userID, groupID]);
    if(res) {
      return {success: true};
    }
    return {success: false}; 

  } catch (err) {
    return {success: false, error: "Could not find group - user pair"}; 
  }
}

//Get group (group ID)
export async function groupGet(db: Database, groupID: number): Promise<DBResponse<Group>> {
  try {
    const res = await db.get(`SELECT * FROM groups WHERE id = ?`, [groupID]); 

    if(res) {
      return {success: true, data: res};
    }
    return {success: false};

  } catch (err) {
    console.error("Error fetching group info from db" + err);
    return {success: false, error: "Error fetching group info from db"}; 
  }
}

//Get all groups (user ID)
export async function groupGetAllGroups(db: Database, userID: number): Promise<DBResponse<Array<Group>>> {
  try {
    const rows = await db.all(`  
      SELECT g.*
      FROM groups g
      JOIN mapGroupsToUsers mg ON g.id = mg.groupID
      WHERE mg.userID = ?
      ORDER BY mg.groupID
    `, [userID]);

    if(rows[0] === undefined) {
      return {success: false, error: "no pairs found"}
    }

    return {success: true, data: rows};
  } catch (err) {
    console.error("Error getting all routes: ", err); 
    return { success: false, error: "Error getting all routes"}; 
  }
}

//Get all users (group ID)
export async function groupGetAllUsers(db: Database, groupID: number): Promise<DBResponse<Array<User>>> {
  try {
    const rows = await db.all(`  
      SELECT u.*
      FROM users u
      JOIN mapGroupsToUsers mu ON u.id = mu.userID
      WHERE mu.groupID = ?
      ORDER BY mu.userID
    `, [groupID]);

    if(rows[0] === undefined) {
      return {success: false, error: "no pairs found"}
    }

    return {success: true, data: rows};
  } catch (err) {
    console.error("Error getting all routes: ", err); 
    return { success: false, error: "Error getting all routes"}; 
  }
}

//Get all groups (date)
export async function groupGetAllDate(db: Database, date: Date): Promise<DBResponse<Array<Group>>> {
  const dateObj = new Date(date); 

  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);
  
  const startISO = startOfDay.toISOString();
  const endISO = endOfDay.toISOString();
  
  try {
    const rows = await db.all(
      `SELECT * FROM groups 
       WHERE datetime BETWEEN ? AND ? 
       ORDER BY datetime ASC`,
      [startISO, endISO]
    );

    if(rows[0] === undefined) {
      return {success: false, error: "no pairs found"}
    }

    return {success: true, data: rows};
  } catch (err) {
    console.error("Error getting all routes: ", err); 
    return { success: false, error: "Error getting all routes"}; 
  }
}

//Remove one user from group (user ID, group ID)
export async function groupRemoveUser(db: Database, userID: number, groupID: number): Promise<DBResponse<void>> {
  try {
    const removed = await db.run(`
      DELETE FROM mapGroupsToUsers
      WHERE userID = ? AND groupID = ?
    `, [userID, groupID]);
    
    if (removed.changes === 0) {
      return { success: false, error: "No pair found to delete." };
    } else {
      return { success: true };
    }

  } catch (err) {
    console.error("Error deleting pair:", err);
    return {success: false, error: "Error deleting pair"};
  }
}

//Remove group (date)
export async function groupRemoveAllDate(db: Database, date: Date): Promise<DBResponse<void>> {
  const dateObj = new Date(date); 

  const startOfDate = new Date();
  startOfDate.setFullYear(0); 

  const endOfDate = new Date(dateObj);
  endOfDate.setHours(23, 59, 59, 999);
  
  const startISO = startOfDate.toISOString();
  const endISO = endOfDate.toISOString();
  
  try {
    await db.run(`
      DELETE FROM groups
      WHERE datetime BETWEEN ? AND ? 
    `, [startISO, endISO]);

    return {success: true};

  } catch (err) {
    console.error("Error deleting all groups based on date:", err);
    return {success: false, error: "Error deleting all groups"};
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
    const status = await db.run(`DELETE FROM users WHERE id = ?`, [id]);

    if(status.changes === 0) {
      console.error("Error no user to delete"); 
      return { success: false, error: "No user to delete" };
    } else {
      return { success: true, data: null };
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    return { success: false, error: "Error deleting user." };
  }
}

//pairs userID and routeID together in the mapRoutesToUsers table
export async function pairUserAndRoute(db: Database, userID: number, routeID: number): Promise <DBResponse<void>> {
  try {
    await db.run(`INSERT INTO mapRoutesToUsers (userID, routeID) VALUES(?, ?)`, [userID, routeID]);
    return { success: true };
  } catch (err) {
    console.error("Error inserting pair:", err);
    return { success: false, error: "Error inserting user/route pair"};
  }
}

//Gets all routes belonging to a user on log(n) time
export async function getAllRoutes(db: Database, userID: number): Promise <DBResponse<Array<any>>> {
  try {
    const rows = await db.all(`  
      SELECT r.*
      FROM routes r
      JOIN mapRoutesToUsers mr ON r.id = mr.routeID
      WHERE mr.userID = ?
      ORDER BY mr.routeID
    `, [userID]);

    if(rows[0] === undefined) {
      return {success: false, error: "no pairs found"}
    }

    return {success: true, data: rows};
  } catch (err) {
    console.error("Error getting all routes: ", err); 
    return { success: false, error: "Error getting all routes"}; 
  }
}

//Gets all users that has saved a route 
export async function getAllUsers(db: Database, routeID: number): Promise <DBResponse<Array<any>>> {
  try {
    const rows = await db.all(`  
      SELECT r.*
      FROM users r
      JOIN mapRoutesToUsers mr ON r.id = mr.userID
      WHERE mr.routeID = ?
      ORDER BY mr.userID
    `, [routeID]);
    if(rows[0] === undefined) {
      return {success: false, error: "no pairs found"}
    }

    return {success: true, data: rows};
  } catch (err) {
    console.error("Error getting all routes: ", err); 
    return { success: false, error: "Error getting all routes"}; 
  }
}

//Removes one pairing of userID and routeID in the mapRoutesToUsers table 
export async function removeUserRoutePair(db: Database, routeID: number, userID: number): Promise <DBResponse<void>> {
  try {
    const removed = await db.run(`
      DELETE FROM mapRoutesToUsers
      WHERE userID = ? AND routeID = ?
    `, [userID, routeID]);
    
    if (removed.changes === 0) {
      return { success: false, error: "No pair found to delete." };
    } else {
      return { success: true };
    }

  } catch (err) {
    console.error("Error deleting pair:", err);
    return {success: false, error: "Error deleting pair"};
  }
}

//Removes all user-route pairings based on routeID, so removes a route from the mapRoutersToUsers table
export async function removeAllUsersFromPairs(db: Database, routeID: number): Promise<DBResponse<void>> {
  try {
    await db.run(`
      DELETE FROM mapRoutesToUsers
      WHERE routeID = ?
    `, [routeID]);

    return {success: true};

  } catch (err) {
    console.error("Error deleting all users:", err);
    return {success: false, error: "Error deleting all users"};
  }
}

//Removes all user-route pairings based on userID, so removes a user from the mapRoutersToUsers table
export async function removeAllRoutesFromPairs(db: Database, userID: number): Promise <DBResponse<void>> {
  try {
    await db.run(`
      DELETE FROM mapRoutesToUsers
      WHERE userID = ?
    `, [userID]);

    return {success: true};
    
  } catch (err) {
    console.error("Error deleting all routes:", err);
    return {success: false, error: "Error deleting all routes"};
  }
}

//clears the user table 
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

//clears the routes table
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

//clears the groups table 
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

//Clears the routes and users table 
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

//Clears the groups and users table 
export async function clearUsersGroups(db: Database): Promise<boolean> {
  try {
    await db.run('DELETE FROM mapGroupsToUsers'); 
    await db.run('VACUUM'); 
    return true; 
  } catch (err) {
    console.error("Error clearing mapping table (groups)", err); 
    return false; 
  }

  
}

//Chat functions ******************** Dom kanske inte ska ligga här??*********************

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

export async function getOtherChatMembers(db: Database, chatId: number, userId: number): Promise<DBResponse<User[]>> {
  try {
    const members = await db.all(
      `SELECT u.* FROM users u
       JOIN chat_members cm ON u.id = cm.user_id
       WHERE cm.chat_id = ? AND cm.user_id != ?`,
      [chatId, userId]
    );
    return { success: true, data: members };
  } catch (err) {
    console.error("Error getting chat members:", err);
    return { success: false, error: "Error getting chat members" };
  }
}

export async function markChatAsRead(db: Database, chatId: number, userId: number): Promise<DBResponse<void>> {
  try {
    await db.run(
      "UPDATE chat_members SET last_read_at = CURRENT_TIMESTAMP WHERE chat_id = ? AND user_id = ?",
      [chatId, userId]
    );
    return { success: true };
  } catch (err) {
    console.error("Error marking chat as read:", err);
    return { success: false, error: "Error marking chat as read" };
  }
}

export async function getUnreadCount(db: Database, chatId: number, userId: number): Promise<DBResponse<number>> {
  try {
    const result = await db.get(
      `SELECT COUNT(*) as count FROM messages m
       WHERE m.chat_id = ? 
       AND m.user_id != ?
       AND (SELECT last_read_at FROM chat_members 
            WHERE chat_id = ? AND user_id = ?) < m.sent_at`,
      [chatId, userId, chatId, userId]
    );
    return { success: true, data: result?.count || 0 };
  } catch (err) {
    console.error("Error getting unread count:", err);
    return { success: false, error: "Error getting unread count" };
  }
}

// Add friend function
export async function addFriend(db: Database, userId: number, friendId: number): Promise<DBResponse<void>> {
  try {
    await db.run(
      "INSERT INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)",
      [userId, friendId, friendId, userId]
    );
    return { success: true };
  } catch (err) {
    console.error("Error adding friend:", err);
    return { success: false, error: "Error adding friend" };
  }
}

// Get user friends
export async function getUserFriends(db: Database, userId: number): Promise<DBResponse<User[]>> {
  try {
    const friends = await db.all(
      `SELECT u.* FROM users u
       JOIN friends f ON u.id = f.friend_id
       WHERE f.user_id = ?`,
      [userId]
    );
    return { success: true, data: friends };
  } catch (err) {
    console.error("Error getting friends:", err);
    return { success: false, error: "Error getting friends" };
  }
  
}
export async function findExistingChat(db: Database, userIds: number[]): Promise<DBResponse<{id: number} | null>> {
  try {
    console.log('Finding chat for users:', userIds);
    
    const query = `
      SELECT c.id FROM chats c
      WHERE (
        SELECT COUNT(*) FROM chat_members cm 
        WHERE cm.chat_id = c.id AND cm.user_id IN (${userIds.map(() => '?').join(',')})
      ) = ? 
      AND (
        SELECT COUNT(*) FROM chat_members cm 
        WHERE cm.chat_id = c.id
      ) = ?
    `;

    const result = await db.get(query, [...userIds, userIds.length, userIds.length]);
    
    console.log('Find chat result:', result);
    
    return { 
      success: true, 
      data: result ? { id: result.id } : null 
    };
  } catch (error) {
    console.error('Error in findExistingChat:', error);
    return { 
      success: false, 
      error: 'Error finding existing chat' 
    };
  }
}

export async function createNewChat(db: Database, userIds: number[]): Promise<DBResponse<{id: number}>> {
  try {
    console.log('Creating new chat for users:', userIds);
    
    const chatResult = await db.run(
      "INSERT INTO chats (name) VALUES (?)",
      [`Chat ${new Date().toISOString()}`]
    );

    if (!chatResult.lastID) {
      throw new Error('Failed to create chat - no ID returned');
    }

    const chatId = chatResult.lastID;
    console.log('Created chat with ID:', chatId);

    // Lägg till alla medlemmar
    await Promise.all(
      userIds.map(userId => 
        db.run(
          "INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)",
          [chatId, userId]
        ).catch(err => {
          console.error(`Error adding user ${userId} to chat:`, err);
          throw err;
        })
      )
    );

    console.log('Successfully added all users to chat');
    return { 
      success: true, 
      data: { id: chatId } 
    };
  } catch (error) {
    console.error('Error in createNewChat:', error);
    return { 
      success: false, 
      error: 'Error creating new chat' 
    };
  }
}
export async function getTotalUnreadMessages(db: Database, userId: number): Promise<DBResponse<number>> {
  try {
    const result = await db.get(
      `SELECT COUNT(*) as total
       FROM messages m
       JOIN chat_members cm ON m.chat_id = cm.chat_id
       WHERE cm.user_id = ?
       AND m.user_id != ?
       AND (cm.last_read_at IS NULL OR m.sent_at > cm.last_read_at)`,
      [userId, userId]
    );
    return { success: true, data: result?.total || 0 };
  } catch (err) {
    console.error("Error getting total unread messages:", err);
    return { success: false, error: "Error getting total unread messages" };
  }
}