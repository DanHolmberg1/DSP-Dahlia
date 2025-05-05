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
exports.createUser = createUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.clearUsers = clearUsers;
exports.clearRoutes = clearRoutes;
exports.clearGroups = clearGroups;
var sqlite3 = require("sqlite3");
var sqlite_1 = require("sqlite");
var path = require("path");
// Initialize the database with the required tables.
// nameing????
function DBInit() {
    return __awaiter(this, void 0, void 0, function () {
        var dbPath, db;
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
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS users (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      name TEXT NOT NULL,\n      email TEXT NOT NULL UNIQUE,\n      age INTEGER NOT NULL CHECK(age < 122 AND age > 0),\n      sex INTEGER NOT NULL CHECK(sex > 0 AND sex < 4)\n    )\n  ")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS groups (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      routeID INTEGER,\n      distance INTEGER,\n      users TEXT\n      )\n    ")];
                case 3:
                    _a.sent(); // Store users as json
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS routes (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      data TEXT UNIQUE\n    )\n  ")];
                case 4:
                    _a.sent(); // data = routes i json
                    return [2 /*return*/, db];
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
                    return [4 /*yield*/, db.run("INSERT INTO routes (data) VALUES (?)", data)];
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
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("DELETE FROM routes WHERE id = ?", [id])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, { success: true, data: (result.changes && result.changes > 0) || false }];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error deleting route:", err_1);
                    return [2 /*return*/, { success: false, error: "Error deleting route." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Retrieves a route by its ID.
function routeGet(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var route, err_2;
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
                    console.log(route);
                    return [2 /*return*/, { success: true, data: route }];
                case 2:
                    err_2 = _a.sent();
                    console.error("Error retrieving route:", err_2);
                    return [2 /*return*/, { success: false, error: "Error retrieving route." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Creates a new group (stub implementation)
// id = userID of the creator of the group
function groupCreate(db, routeID, distance) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("INSERT INTO groups (routeID, distance) VALUES (?, ?)", [routeID, distance])];
                case 1:
                    res = _a.sent();
                    if (res.changes && res.lastID) {
                        return [2 /*return*/, { success: true, data: res.lastID }];
                    }
                    return [2 /*return*/, { success: false, error: "Please report, unexpected failure." }];
                case 2:
                    err_3 = _a.sent();
                    console.error("Error creating group:", err_3);
                    return [2 /*return*/, { success: false, error: "Error creating group." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function groupAdd(db, userID, groupID) {
    return __awaiter(this, void 0, void 0, function () {
        var res, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("UPDATE groups SET users = ? WHERE id = ?", [userID, groupID])];
                case 1:
                    res = _a.sent();
                    if (res.changes) {
                        return [2 /*return*/, { success: true }];
                    }
                    return [2 /*return*/, { success: false, error: "Failed to update group, please report" }];
                case 2:
                    err_4 = _a.sent();
                    return [2 /*return*/, { success: false, error: "Error adding user to group" }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Creates a new user record.
function createUser(db, name, email, age, sex) {
    return __awaiter(this, void 0, void 0, function () {
        var validEmailRegExp, result, err_5;
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
                    if (age <= 0 || age > 122) {
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
                    return [4 /*yield*/, db.run("INSERT INTO users (name, email, age, sex) VALUES (?, ?, ?, ?)", [name, email, age, sex])];
                case 2:
                    result = _a.sent();
                    if (result.lastID) {
                        return [2 /*return*/, { success: true, data: result.lastID }];
                    }
                    return [2 /*return*/, { success: false, error: "Failed to create user." }];
                case 3:
                    err_5 = _a.sent();
                    console.error("Error creating user:", err_5);
                    return [2 /*return*/, { success: false, error: "Error creating user." }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Retrieves a user record by ID.
function getUser(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var user, err_6;
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
                    err_6 = _a.sent();
                    console.error("Error retrieving user:", err_6);
                    return [2 /*return*/, { success: false, error: "Error retrieving user." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Updates a user record by ID.
function updateUser(db, id, name, email, age, sex) {
    return __awaiter(this, void 0, void 0, function () {
        var validEmailRegExp, res, err_7;
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
                    if (age <= 0 || age > 122) {
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
                    return [4 /*yield*/, db.run("UPDATE users SET name = ?, email = ?, age = ?, sex = ? WHERE id = ?", [name, email, age, sex, id])];
                case 2:
                    res = _a.sent();
                    return [2 /*return*/, { success: true, data: (res.changes && res.changes > 0) || false }];
                case 3:
                    err_7 = _a.sent();
                    console.error("Error updating user:", err_7);
                    return [2 /*return*/, { success: false, error: "Error updating user." }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Deletes a user record by ID.
function deleteUser(db, id) {
    return __awaiter(this, void 0, void 0, function () {
        var err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.run("DELETE FROM users WHERE id = ?", [id])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true, data: null }];
                case 2:
                    err_8 = _a.sent();
                    console.error("Error deleting user:", err_8);
                    return [2 /*return*/, { success: false, error: "Error deleting user." }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function clearUsers(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_9;
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
                    err_9 = _a.sent();
                    console.error("Error clearing users table", err_9);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function clearRoutes(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_10;
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
                    err_10 = _a.sent();
                    console.error("Error clearing routes table", err_10);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function clearGroups(db) {
    return __awaiter(this, void 0, void 0, function () {
        var err_11;
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
                    err_11 = _a.sent();
                    console.error("Error clearing routes table", err_11);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
