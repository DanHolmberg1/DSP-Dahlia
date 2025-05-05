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
      sex INTEGER NOT NULL CHECK(sex > 0 AND sex < 4)
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

