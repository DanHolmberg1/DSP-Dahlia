"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBInit = DBInit;
exports.routeAdd = routeAdd;
exports.routeDelete = routeDelete;
exports.routeGet = routeGet;
exports.groupCreate = groupCreate;
exports.groupAdd = groupAdd;
exports.isInGroup = isInGroup;
exports.groupGet = groupGet;
exports.groupGetAllGroups = groupGetAllGroups;
exports.groupGetAllUsers = groupGetAllUsers;
exports.groupGetAllDate = groupGetAllDate;
exports.groupRemoveUser = groupRemoveUser;
exports.groupRemoveAllDate = groupRemoveAllDate;
exports.createUser = createUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.pairUserAndRoute = pairUserAndRoute;
exports.getAllRoutes = getAllRoutes;
exports.getAllUsers = getAllUsers;
exports.removeUserRoutePair = removeUserRoutePair;
exports.removeAllUsersFromPairs = removeAllUsersFromPairs;
exports.removeAllRoutesFromPairs = removeAllRoutesFromPairs;
exports.clearUsers = clearUsers;
exports.clearRoutes = clearRoutes;
exports.clearGroups = clearGroups;
exports.clearUsersRoutes = clearUsersRoutes;
exports.clearUsersGroups = clearUsersGroups;
exports.createChat = createChat;
exports.addUserToChat = addUserToChat;
exports.sendMessage = sendMessage;
exports.getMessages = getMessages;
exports.getUserChats = getUserChats;
exports.clearChats = clearChats;
var sqlite3 = require("sqlite3");
var sqlite_1 = require("sqlite");
var path = require("path");
// Initialize the database with the required tables.
// nameing????
function DBInit() {
    return __awaiter(this, void 0, void 0, function () {
        var dbPath, db, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbPath = path.resolve(__dirname, '../../db/database.db');
                    return [4 /*yield*/, (0, sqlite_1.open)({
                            filename: dbPath,
                            driver: sqlite3.Database,
                        })];
                case 1:
                    db = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 20, , 21]);
                    return [4 /*yield*/, db.exec("DROP TABLE IF EXISTS users")];
                case 3:
                    _a.sent(); //run if you made changes to any table 
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS users (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      email TEXT NOT NULL UNIQUE,\n      age INTEGER NOT NULL CHECK(age < 122 AND age > 17),\n      sex INTEGER NOT NULL CHECK(sex > 0 AND sex < 4),\n      latitude REAL,\n      longitude REAL,\n      bio TEXT\n    )\n  ")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS routes (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      data TEXT UNIQUE\n    )\n  ")];
                case 5:
                    _a.sent(); // data = routes i json
                    //await db.exec(`DROP TABLE IF EXISTS groups`); //run if you made changes to any table 
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS groups (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      routeID INTEGER NOT NULL,\n      description TEXT NOT NULL, \n      groupName TEXT NOT NULL, \n      availableSpots INTEGER NOT NULL CHECK(availableSpots < 11 AND availableSpots > -1),\n      datetime TEXT NOT NULL,\n      FOREIGN KEY (routeID) REFERENCES routes(id) ON DELETE CASCADE\n    )\n  ")];
                case 6:
                    //await db.exec(`DROP TABLE IF EXISTS groups`); //run if you made changes to any table 
                    _a.sent();
                    //datetime ISO 8601 format: "YYYY-MM-DD HH:MM:SS"
                    //Maybe add starting location and distance, if we want to sort based on that?? 
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS mapRoutesToUsers (\n      userID INTEGER,\n      routeID INTEGER,\n      PRIMARY KEY (userID, routeID),\n      FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,\n      FOREIGN KEY (routeID) REFERENCES routes(id) ON DELETE CASCADE\n    )\n  ")];
                case 7:
                    //datetime ISO 8601 format: "YYYY-MM-DD HH:MM:SS"
                    //Maybe add starting location and distance, if we want to sort based on that?? 
                    _a.sent(); //maps users to routes, ID must exist in users and routes, the pairing must be unique 
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS mapGroupsToUsers (\n      userID INTEGER,\n      groupID INTEGER,\n      PRIMARY KEY (userID, groupID),\n      FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,\n      FOREIGN KEY (groupID) REFERENCES groups(id) ON DELETE CASCADE\n    )\n  ")];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS chats (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    )\n  ")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS friends (\n      user_id INTEGER,\n      friend_id INTEGER,\n      PRIMARY KEY (user_id, friend_id),\n      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE\n    )\n  ")];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS chat_members (\n      chat_id INTEGER,\n      user_id INTEGER,\n      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      last_read_at DATETIME, \n      PRIMARY KEY (chat_id, user_id),\n      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,\n      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n    )\n  ")];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS messages (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    chat_id INTEGER,\n    user_id INTEGER,\n    content TEXT,\n    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,\n    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n  )\n")];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n  CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id)\n")];
                case 13:
                    _a.sent();
                    //Creates search trees based on userID and routeID 
                    //routes - users search trees 
                    return [4 /*yield*/, db.exec("CREATE INDEX IF NOT EXISTS idx_userID ON mapRoutesToUsers(userID)")];
                case 14:
                    //Creates search trees based on userID and routeID 
                    //routes - users search trees 
                    _a.sent();
                    return [4 /*yield*/, db.exec("CREATE INDEX IF NOT EXISTS idx_routeID ON mapRoutesToUsers(routeID)")];
                case 15:
                    _a.sent();
                    //groups - users search trees 
                    return [4 /*yield*/, db.exec("CREATE INDEX IF NOT EXISTS idx_userID ON mapGroupsToUsers(userID)")];
                case 16:
                    //groups - users search trees 
                    _a.sent();
                    return [4 /*yield*/, db.exec("CREATE INDEX IF NOT EXISTS idx_groupID ON mapGroupsToUsers(groupID)")];
                case 17:
                    _a.sent();
                    //groups - date search trees 
                    return [4 /*yield*/, db.exec("CREATE INDEX IF NOT EXISTS idx_groups_datetime ON groups(datetime)")];
                case 18:
                    //groups - date search trees 
                    _a.sent();
                    //Allows deletion to happen automatically in the mapRoutesToUsers table 
                    return [4 /*yield*/, db.exec("PRAGMA foreign_keys = ON")];
                case 19:
                    //Allows deletion to happen automatically in the mapRoutesToUsers table 
                    _a.sent();
                    return [2 /*return*/, db];
                case 20:
                    err_1 = _a.sent();
                    console.error("Failed to create db" + err_1);
                    return [2 /*return*/, db];
                case 21: return [2 /*return*/];
            }
        });
    });
}
// Inserts a new route and returns its ID.
function routeAdd(db, data) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("INSERT INTO routes (data) VALUES (?)", JSON.stringify(data))];
                case 1:
                    result = _a.sent();
                    if (result.changes && result.lastID) {
                        return [2 /*return*/, { success: true, data: result.lastID }];
                    }
                    return [2 /*return*/, { success: false, error: "No changes made when inserting route." }];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error inserting route:", error_1);
                    return [2 /*return*/, { success: false, error: "Error inserting route." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Deletes a route by its ID.
function routeDelete(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("DELETE FROM routes WHERE id = ?", [id])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, { success: true, data: (result.changes && result.changes > 0) || false }];
                case 2:
                    err_2 = _a.sent();
                    console.error("Error deleting route:", err_2);
                    return [2 /*return*/, { success: false, error: "Error deleting route." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Retrieves a route by its ID.
function routeGet(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var route, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.get("SELECT * FROM routes WHERE id = ?", [id])];
                case 1:
                    route = _a.sent();
                    if (!route) {
                        return [2 /*return*/, { success: false, error: "Route not found." }];
                    }
                    return [2 /*return*/, { success: true, data: route }];
                case 2:
                    err_3 = _a.sent();
                    console.error("Error retrieving route:", err_3);
                    return [2 /*return*/, { success: false, error: "Error retrieving route." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Creates a new walking group, creator is automatically added 
function groupCreate(db, userID, routeID, description, groupName, spots, date) {
    return __awaiter(this, void 0, void 0, function () {
        var dateS, resGroup, _a, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!description || !groupName) {
                        return [2 /*return*/, { success: false, error: "no description or name" }];
                    }
                    if (spots <= 0 || spots > 10) {
                        return [2 /*return*/, { success: false, error: "invalid amount of spots" }];
                    }
                    if (!(date instanceof Date) || isNaN(date.getTime())) {
                        return [2 /*return*/, { success: false, error: "Invalid date" }];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    dateS = date.toISOString();
                    return [4 /*yield*/, db.run("INSERT INTO groups (routeID, description, groupName, availableSpots, datetime) VALUES (?, ?, ?, ?, ?)", [routeID, description, groupName, spots, dateS])];
                case 2:
                    resGroup = _b.sent();
                    _a = resGroup.changes && resGroup.lastID;
                    if (!_a) return [3 /*break*/, 4];
                    return [4 /*yield*/, groupAdd(db, userID, resGroup.lastID)];
                case 3:
                    _a = (_b.sent()).success;
                    _b.label = 4;
                case 4:
                    if (_a) {
                        return [2 /*return*/, { success: true, data: resGroup.lastID }];
                    }
                    return [2 /*return*/, { success: false, error: "Please report, unexpected failure." }];
                case 5:
                    err_4 = _b.sent();
                    console.error("Error creating group:", err_4);
                    return [2 /*return*/, { success: false, error: "Error creating group." }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
//Pairs user and group 
function groupAdd(db, userID, groupID) {
    return __awaiter(this, void 0, void 0, function () {
        var groupInfo, updateStatus, res, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 15]);
                    return [4 /*yield*/, db.exec("BEGIN TRANSACTION")];
                case 1:
                    _a.sent(); //enables rollbacks just in case 
                    return [4 /*yield*/, groupGet(db, groupID)];
                case 2:
                    groupInfo = _a.sent();
                    if (!(groupInfo.success && groupInfo.data && groupInfo.data.availableSpots > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, db.run("UPDATE groups SET availableSpots = ? WHERE id = ?", [groupInfo.data.availableSpots - 1, groupID])];
                case 3:
                    updateStatus = _a.sent();
                    if (!!updateStatus.changes) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.exec("ROLLBACK")];
                case 4:
                    _a.sent();
                    return [2 /*return*/, { success: false }];
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, db.exec("ROLLBACK")];
                case 7:
                    _a.sent();
                    return [2 /*return*/, { success: false }];
                case 8: return [4 /*yield*/, db.run("INSERT INTO mapGroupsToUsers (userID, groupID) VALUES(?, ?)", [userID, groupID])];
                case 9:
                    res = _a.sent();
                    if (!res.changes) return [3 /*break*/, 11];
                    return [4 /*yield*/, db.exec("COMMIT")];
                case 10:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 11: return [4 /*yield*/, db.exec("ROLLBACK")];
                case 12:
                    _a.sent();
                    return [2 /*return*/, { success: false, error: "Failed to update group, please report" }];
                case 13:
                    err_5 = _a.sent();
                    return [4 /*yield*/, db.exec("ROLLBACK")];
                case 14:
                    _a.sent();
                    console.error("Error adding user to group" + err_5);
                    return [2 /*return*/, { success: false, error: "Error adding user to group" }];
                case 15: return [2 /*return*/];
            }
        });
    });
}
//Checks if a user is in a group (group ID, user ID)
function isInGroup(db, userID, groupID) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.get("\n      SELECT * FROM mapGroupsToUsers\n      WHERE userID = ? AND groupID = ?\n    ", [userID, groupID])];
                case 1:
                    res = _a.sent();
                    if (res) {
                        return [2 /*return*/, { success: true }];
                    }
                    return [2 /*return*/, { success: false }];
                case 2:
                    err_6 = _a.sent();
                    return [2 /*return*/, { success: false, error: "Could not find group - user pair" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Get group (group ID)
function groupGet(db, groupID) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.get("SELECT * FROM groups WHERE id = ?", [groupID])];
                case 1:
                    res = _a.sent();
                    if (res) {
                        return [2 /*return*/, { success: true, data: res }];
                    }
                    return [2 /*return*/, { success: false }];
                case 2:
                    err_7 = _a.sent();
                    console.error("Error fetching group info from db" + err_7);
                    return [2 /*return*/, { success: false, error: "Error fetching group info from db" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Get all groups (user ID)
function groupGetAllGroups(db, userID) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.all("  \n      SELECT g.*\n      FROM groups g\n      JOIN mapGroupsToUsers mg ON g.id = mg.groupID\n      WHERE mg.userID = ?\n      ORDER BY mg.groupID\n    ", [userID])];
                case 1:
                    rows = _a.sent();
                    if (rows[0] === undefined) {
                        return [2 /*return*/, { success: false, error: "no pairs found" }];
                    }
                    return [2 /*return*/, { success: true, data: rows }];
                case 2:
                    err_8 = _a.sent();
                    console.error("Error getting all routes: ", err_8);
                    return [2 /*return*/, { success: false, error: "Error getting all routes" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Get all users (group ID)
function groupGetAllUsers(db, groupID) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.all("  \n      SELECT u.*\n      FROM users u\n      JOIN mapGroupsToUsers mu ON u.id = mu.userID\n      WHERE mu.groupID = ?\n      ORDER BY mu.userID\n    ", [groupID])];
                case 1:
                    rows = _a.sent();
                    if (rows[0] === undefined) {
                        return [2 /*return*/, { success: false, error: "no pairs found" }];
                    }
                    return [2 /*return*/, { success: true, data: rows }];
                case 2:
                    err_9 = _a.sent();
                    console.error("Error getting all routes: ", err_9);
                    return [2 /*return*/, { success: false, error: "Error getting all routes" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Get all groups (date)
function groupGetAllDate(db, date) {
    return __awaiter(this, void 0, void 0, function () {
        var dateObj, startOfDay, endOfDay, startISO, endISO, rows, err_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dateObj = new Date(date);
                    startOfDay = new Date(dateObj);
                    startOfDay.setHours(0, 0, 0, 0);
                    endOfDay = new Date(dateObj);
                    endOfDay.setHours(23, 59, 59, 999);
                    startISO = startOfDay.toISOString();
                    endISO = endOfDay.toISOString();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.all("SELECT * FROM groups \n       WHERE datetime BETWEEN ? AND ? \n       ORDER BY datetime ASC", [startISO, endISO])];
                case 2:
                    rows = _a.sent();
                    if (rows[0] === undefined) {
                        return [2 /*return*/, { success: false, error: "no pairs found" }];
                    }
                    return [2 /*return*/, { success: true, data: rows }];
                case 3:
                    err_10 = _a.sent();
                    console.error("Error getting all routes: ", err_10);
                    return [2 /*return*/, { success: false, error: "Error getting all routes" }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Remove one user from group (user ID, group ID)
function groupRemoveUser(db, userID, groupID) {
    return __awaiter(this, void 0, void 0, function () {
        var removed, groupInfo, updateStatus, err_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, db.run("\n      DELETE FROM mapGroupsToUsers\n      WHERE userID = ? AND groupID = ?\n    ", [userID, groupID])];
                case 1:
                    removed = _a.sent();
                    return [4 /*yield*/, groupGet(db, groupID)];
                case 2:
                    groupInfo = _a.sent();
                    if (!(groupInfo.success && groupInfo.data && groupInfo.data.availableSpots > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.run("UPDATE groups SET availableSpots = ? WHERE id = ?", [groupInfo.data.availableSpots + 1, groupID])];
                case 3:
                    updateStatus = _a.sent();
                    _a.label = 4;
                case 4:
                    if (removed.changes === 0) {
                        return [2 /*return*/, { success: false, error: "No pair found to delete." }];
                    }
                    else {
                        return [2 /*return*/, { success: true }];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    err_11 = _a.sent();
                    console.error("Error deleting pair:", err_11);
                    return [2 /*return*/, { success: false, error: "Error deleting pair" }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
//Remove group (date)
function groupRemoveAllDate(db, date) {
    return __awaiter(this, void 0, void 0, function () {
        var dateObj, startOfDate, endOfDate, startISO, endISO, err_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dateObj = new Date(date);
                    startOfDate = new Date();
                    startOfDate.setFullYear(0);
                    endOfDate = new Date(dateObj);
                    endOfDate.setHours(23, 59, 59, 999);
                    startISO = startOfDate.toISOString();
                    endISO = endOfDate.toISOString();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.run("\n      DELETE FROM groups\n      WHERE datetime BETWEEN ? AND ? \n    ", [startISO, endISO])];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    err_12 = _a.sent();
                    console.error("Error deleting all groups based on date:", err_12);
                    return [2 /*return*/, { success: false, error: "Error deleting all groups" }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Creates a new user record.
function createUser(db, name, email, age, sex) {
    return __awaiter(this, void 0, void 0, function () {
        var validEmailRegExp, result, err_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validEmailRegExp = new RegExp("^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$");
                    if (!validEmailRegExp.test(email)) {
                        console.error("Invalid email:", email);
                        return [2 /*return*/, { success: false, error: "Invalid email." }];
                    }
                    // Validate name.
                    if (!name.trim()) {
                        console.error("Invalid name");
                        return [2 /*return*/, { success: false, error: "Invalid name." }];
                    }
                    // Validate age.
                    if (age <= 17 || age > 122) {
                        console.error("Invalid age:", age);
                        return [2 /*return*/, { success: false, error: "Invalid age." }];
                    }
                    // Validate sex. (Assuming 1 = female, 2 = male, 3 = other)
                    if (sex < 1 || sex > 3) {
                        console.error("Invalid sex:", sex);
                        return [2 /*return*/, { success: false, error: "Invalid sex." }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.run("INSERT INTO users (name, email, age, sex, latitude, longitude, bio) VALUES (?, ?, ?, ?, ?, ?, ?)", [name, email, age, sex, 0, 0, null])];
                case 2:
                    result = _a.sent();
                    if (result.lastID) {
                        return [2 /*return*/, { success: true, data: result.lastID }];
                    }
                    return [2 /*return*/, { success: false, error: "Failed to create user." }];
                case 3:
                    err_13 = _a.sent();
                    console.error("Error creating user:", err_13);
                    return [2 /*return*/, { success: false, error: "Error creating user." }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Retrieves a user record by ID.
function getUser(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var user, err_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.get("SELECT * FROM users WHERE id = ?", [id])];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, { success: false, error: "User not found." }];
                    }
                    return [2 /*return*/, { success: true, data: user }];
                case 2:
                    err_14 = _a.sent();
                    console.error("Error retrieving user:", err_14);
                    return [2 /*return*/, { success: false, error: "Error retrieving user." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Updates a user record by ID.
function updateUser(db, id, name, email, age, sex, latitude, longitude, bio) {
    return __awaiter(this, void 0, void 0, function () {
        var validEmailRegExp, res, err_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validEmailRegExp = new RegExp("^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$");
                    if (!validEmailRegExp.test(email)) {
                        console.error("Invalid email:", email);
                        return [2 /*return*/, { success: false, error: "Invalid email." }];
                    }
                    // Validate name.
                    if (!name.trim()) {
                        console.error("Invalid name");
                        return [2 /*return*/, { success: false, error: "Invalid name." }];
                    }
                    // Validate age.
                    if (age <= 17 || age > 122) {
                        console.error("Invalid age:", age);
                        return [2 /*return*/, { success: false, error: "Invalid age." }];
                    }
                    // Validate sex. (Assuming 1 = female, 2 = male, 3 = other)
                    if (sex < 1 || sex > 3) {
                        console.error("Invalid sex:", sex);
                        return [2 /*return*/, { success: false, error: "Invalid sex." }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.run("UPDATE users SET name = ?, email = ?, age = ?, sex = ?, latitude = ?, longitude = ?, bio = ? WHERE id = ?", [name, email, age, sex, latitude, longitude, bio, id])];
                case 2:
                    res = _a.sent();
                    return [2 /*return*/, { success: true, data: (res.changes && res.changes > 0) || false }];
                case 3:
                    err_15 = _a.sent();
                    console.error("Error updating user:", err_15);
                    return [2 /*return*/, { success: false, error: "Error updating user." }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Deletes a user record by ID.
function deleteUser(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var status_1, err_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("DELETE FROM users WHERE id = ?", [id])];
                case 1:
                    status_1 = _a.sent();
                    if (status_1.changes === 0) {
                        console.error("Error no user to delete");
                        return [2 /*return*/, { success: false, error: "No user to delete" }];
                    }
                    else {
                        return [2 /*return*/, { success: true, data: null }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_16 = _a.sent();
                    console.error("Error deleting user:", err_16);
                    return [2 /*return*/, { success: false, error: "Error deleting user." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//pairs userID and routeID together in the mapRoutesToUsers table
function pairUserAndRoute(db, userID, routeID) {
    return __awaiter(this, void 0, void 0, function () {
        var err_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("INSERT INTO mapRoutesToUsers (userID, routeID) VALUES(?, ?)", [userID, routeID])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    err_17 = _a.sent();
                    console.error("Error inserting pair:", err_17);
                    return [2 /*return*/, { success: false, error: "Error inserting user/route pair" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Gets all routes belonging to a user on log(n) time
function getAllRoutes(db, userID) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.all("  \n      SELECT r.*\n      FROM routes r\n      JOIN mapRoutesToUsers mr ON r.id = mr.routeID\n      WHERE mr.userID = ?\n      ORDER BY mr.routeID\n    ", [userID])];
                case 1:
                    rows = _a.sent();
                    if (rows[0] === undefined) {
                        return [2 /*return*/, { success: false, error: "no pairs found" }];
                    }
                    return [2 /*return*/, { success: true, data: rows }];
                case 2:
                    err_18 = _a.sent();
                    console.error("Error getting all routes: ", err_18);
                    return [2 /*return*/, { success: false, error: "Error getting all routes" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Gets all users that has saved a route 
function getAllUsers(db, routeID) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.all("  \n      SELECT r.*\n      FROM users r\n      JOIN mapRoutesToUsers mr ON r.id = mr.userID\n      WHERE mr.routeID = ?\n      ORDER BY mr.userID\n    ", [routeID])];
                case 1:
                    rows = _a.sent();
                    if (rows[0] === undefined) {
                        return [2 /*return*/, { success: false, error: "no pairs found" }];
                    }
                    return [2 /*return*/, { success: true, data: rows }];
                case 2:
                    err_19 = _a.sent();
                    console.error("Error getting all routes: ", err_19);
                    return [2 /*return*/, { success: false, error: "Error getting all routes" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Removes one pairing of userID and routeID in the mapRoutesToUsers table 
function removeUserRoutePair(db, routeID, userID) {
    return __awaiter(this, void 0, void 0, function () {
        var removed, err_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("\n      DELETE FROM mapRoutesToUsers\n      WHERE userID = ? AND routeID = ?\n    ", [userID, routeID])];
                case 1:
                    removed = _a.sent();
                    if (removed.changes === 0) {
                        return [2 /*return*/, { success: false, error: "No pair found to delete." }];
                    }
                    else {
                        return [2 /*return*/, { success: true }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_20 = _a.sent();
                    console.error("Error deleting pair:", err_20);
                    return [2 /*return*/, { success: false, error: "Error deleting pair" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Removes all user-route pairings based on routeID, so removes a route from the mapRoutersToUsers table
function removeAllUsersFromPairs(db, routeID) {
    return __awaiter(this, void 0, void 0, function () {
        var err_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("\n      DELETE FROM mapRoutesToUsers\n      WHERE routeID = ?\n    ", [routeID])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    err_21 = _a.sent();
                    console.error("Error deleting all users:", err_21);
                    return [2 /*return*/, { success: false, error: "Error deleting all users" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//Removes all user-route pairings based on userID, so removes a user from the mapRoutersToUsers table
function removeAllRoutesFromPairs(db, userID) {
    return __awaiter(this, void 0, void 0, function () {
        var err_22;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("\n      DELETE FROM mapRoutesToUsers\n      WHERE userID = ?\n    ", [userID])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    err_22 = _a.sent();
                    console.error("Error deleting all routes:", err_22);
                    return [2 /*return*/, { success: false, error: "Error deleting all routes" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//clears the user table 
function clearUsers(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_23;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db.run('DELETE FROM users')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.run('VACUUM')];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    err_23 = _a.sent();
                    console.error("Error clearing users table", err_23);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//clears the routes table
function clearRoutes(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_24;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db.run('DELETE FROM routes')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.run('VACUUM')];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    err_24 = _a.sent();
                    console.error("Error clearing routes table", err_24);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//clears the groups table 
function clearGroups(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_25;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db.run('DELETE FROM groups')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.run('VACUUM')];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    err_25 = _a.sent();
                    console.error("Error clearing routes table", err_25);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Clears the routes and users table 
function clearUsersRoutes(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_26;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db.run('DELETE FROM mapRoutesToUsers')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.run('VACUUM')];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    err_26 = _a.sent();
                    console.error("Error clearing mapping table", err_26);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Clears the groups and users table 
function clearUsersGroups(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_27;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db.run('DELETE FROM mapGroupsToUsers')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.run('VACUUM')];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    err_27 = _a.sent();
                    console.error("Error clearing mapping table (groups)", err_27);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Lägg till dessa funktioner i din db_operations.ts:
// Skapa en ny chat
function createChat(db, name) {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_28;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!name.trim()) {
                        return [2 /*return*/, { success: false, error: "Chat name required" }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.run("INSERT INTO chats (name) VALUES (?)", [name])];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.lastID
                            ? { success: true, data: result.lastID }
                            : { success: false, error: "Failed to create chat" }];
                case 3:
                    err_28 = _a.sent();
                    console.error("Error creating chat:", err_28);
                    return [2 /*return*/, { success: false, error: "Database error" }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Lägg till användare i chat
function addUserToChat(db, chatId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var err_29;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)", [chatId, userId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    err_29 = _a.sent();
                    console.error("Error adding user to chat:", err_29);
                    return [2 /*return*/, {
                            success: false,
                            error: err_29 instanceof Error ? err_29.message : "Database error"
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Skicka meddelande
function sendMessage(db, chatId, userId, content) {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_30;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("INSERT INTO messages (chat_id, user_id, content) VALUES (?, ?, ?)", [chatId, userId, content])];
                case 1:
                    result = _a.sent();
                    if (result.lastID) {
                        return [2 /*return*/, {
                                success: true,
                                data: result.lastID // Only include defined properties
                            }];
                    }
                    return [2 /*return*/, { success: false, error: "Failed to send message" }];
                case 2:
                    err_30 = _a.sent();
                    console.error("Error sending message:", err_30);
                    return [2 /*return*/, { success: false, error: "Error sending message" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Hämta meddelanden för en chat
function getMessages(db_1, chatId_1) {
    return __awaiter(this, arguments, void 0, function (db, chatId, limit) {
        var messages, err_31;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.all("SELECT * FROM messages WHERE chat_id = ? ORDER BY sent_at DESC LIMIT ?", [chatId, limit])];
                case 1:
                    messages = _a.sent();
                    return [2 /*return*/, {
                            success: true,
                            data: messages.reverse() // Correctly return the messages array
                        }];
                case 2:
                    err_31 = _a.sent();
                    console.error("Error getting messages:", err_31);
                    return [2 /*return*/, { success: false, error: "Error getting messages" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Hämta användarens chattar
function getUserChats(db, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var chats, err_32;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.all("SELECT c.* FROM chats c\n       JOIN chat_members cm ON c.id = cm.chat_id\n       WHERE cm.user_id = ?", [userId])];
                case 1:
                    chats = _a.sent();
                    return [2 /*return*/, { success: true, data: chats }];
                case 2:
                    err_32 = _a.sent();
                    console.error("Error getting user chats:", err_32);
                    return [2 /*return*/, { success: false, error: "Error getting user chats" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Rensa chat-tabeller (för tester)
function clearChats(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_33;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db.run('DELETE FROM messages')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.run('DELETE FROM chat_members')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.run('DELETE FROM chats')];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    err_33 = _a.sent();
                    console.error('Error clearing chats:', err_33);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
