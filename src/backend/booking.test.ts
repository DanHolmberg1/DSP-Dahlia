import { DBInit, routeAdd, routeDelete, routeGet, createUser, 
    getUser, updateUser, deleteUser, clearUsers, removeAllRoutesFromPairs,
    removeUserRoutePair, getAllUsers, getAllRoutes, pairUserAndRoute, 
    clearGroups, clearUsersRoutes, clearRoutes, 
    removeAllUsersFromPairs} from "./db_opertions";
import { Database } from 'sqlite';

const name1 = "Anna"; 
const email1 = "anna@email.com"; 
const age1 = 35; 
const sex1 = 1; 

const name2 = "Åke"; 
const email2 = "ake@email.com"; 
const age2 = 60; 
const sex2 = 2; 

const invalidEmail = "inteBra.com"; 
const invalidAge = -1; 
const invalidSex = 0; 


const route1 = JSON.parse('{"name":"TestWalk1, not real data"}');
const route2 = JSON.parse('{"name":"TestWalk2, not real data"}');

let db: Database;

beforeEach(async () => {
    try{
        await clearUsers(db); 
    await clearGroups(db);
    await clearRoutes(db); 
    await clearUsersRoutes(db);
    db = await DBInit()
    } catch (err){
        console.error("Could not init db", err);
    }
}
);

afterEach(async () => {
    await clearUsers(db); 
    await clearGroups(db);
    await clearRoutes(db); 
    await clearUsersRoutes(db);
});

afterAll( async () => {
    await db.close();
})

//Testing user table functions 
//testign to insert a user into a database 
test('Insert user into users database', async () => {
    const id = await createUser(db, name1, email1, age1, sex1); 
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0);
});

//test get user from database 
test('Fetch user from users db', async () => {
    const id = await createUser(db, name1, email1, age1, sex1); 
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0); 
    if(id.data){
        const user = await getUser(db, id.data); 
        expect(user.success).toBeTruthy; 
        expect(user.data?.name).toBe(name1);
        expect(user.data?.age).toBe(age1);
        expect(user.data?.email).toBe(email1);
        expect(user.data?.sex).toBe(sex1);
        expect(user.data?.id).toBe(id.data);
    }
});

//test remove user 
test('Delete user from users db', async () => {
    const id = await createUser(db, name1, email1, age1, sex1);
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0);     
    if(id.data){
        expect((await deleteUser(db, id.data)).success).toBe(true);

        const check = await getUser(db, id.data);
        expect(check.success).toBe(false);
    }
});

//test insert same user twice 
test('Insert same email twice', async () => {
    const id1 = await createUser(db, name1, email1, age1, sex1);
    const id2 = await createUser(db, name2, email1, age2, sex2); //skriver ut error 
    expect(id1.success).toBe(true); 
    expect(id2.success).toBeFalsy; 
});

//test invalid user 
test('Insert invalid user information', async () => {
    const id1 = await createUser(db, name1, invalidEmail, age1, sex1);
    const id2 = await createUser(db, '', email1, age1, sex1);
    const id3 = await createUser(db, name1, email1, invalidAge, sex1);
    const id4 = await createUser(db, name1, email1, age1, invalidSex);
    expect(id1.success).toBeFalsy;
    expect(id2.success).toBeFalsy;
    expect(id3.success).toBeFalsy;
    expect(id4.success).toBeFalsy;
});

//test updating user 
test('Update user', async () => {
    const id = await createUser(db, name1, email1, age1, sex1); 
    expect(id.success).toBeTruthy;

    if(id.success && id.data){
        await updateUser(db, id.data, name2, email1, age1 + 1, sex2);
        const user = await getUser(db, id.data);
        expect(user.success).toBeTruthy;

        if(user.success && user.data){
            expect(user.data.name).toBe(name2); 
            expect(user.data.email).toBe(email1); 
            expect(user.data.age).toEqual(age1 + 1); 
            expect(user.data.sex).toBe(sex2);
        } 
    }
});

test('Fetch non-existent user from db', async () => {
    const user = await getUser(db, 99999); // ID does not exist, since db is cleared between each test
    expect(user.success).toBe(false);
    expect(user.data).toBeUndefined();
});

test('Delete non-existent user from db', async () => {
    const result = await deleteUser(db, 99999);
    expect(result.success).toBe(false);
});

test('Insert user with borderline valid data', async () => {
    const borderlineName = "A"; 
    const borderlineAge = 18;    
    const borderlineSex = 1;  

    const result = await createUser(db, borderlineName, "a@b.co", borderlineAge, borderlineSex);
    expect(result.success).toBe(true);
});

test('Insert multiple users in sequence', async () => {
    const users = [
        { name: "A", email: "a@test.com" },
        { name: "B", email: "b@test.com" },
        { name: "C", email: "c@test.com" }
    ];

    for (const u of users) {
        const res = await createUser(db, u.name, u.email, age1, sex1);
        expect(res.success).toBe(true);
    }
});

//Testing route table functions
//routeAdd
test('Insert route in routing table', async () => {
    const routeID = await routeAdd(db, route1); 
    expect(routeID.success).toBe(true); 
    expect(routeID.data!).toBeDefined(); 
})

//routeGet 
test('Fetch route from routing table', async () => {
    const routeID = await routeAdd(db, route1); 
    expect(routeID.success).toBe(true); 
    expect(routeID.data!).toBeDefined(); 

    const fetchedRoute = await routeGet(db, routeID.data!); 
    expect(fetchedRoute.success).toBe(true); 
    expect(JSON.parse(fetchedRoute.data!.data)).toEqual(route1); 
})

//routeDelete
test('Delete route from routing table', async () => {
    const routeID = await routeAdd(db, route1); 
    expect(routeID.success).toBe(true); 
    expect(routeID.data!).toBeDefined(); 

    const status = await routeDelete(db, routeID.data!);
    expect(status.success).toBe(true); 

    const fetchedRoute = await routeGet(db, routeID.data!);
    expect(fetchedRoute.success).toBe(false); 
})




//Tests Mapping users to routes (and vice versa)
//test create pair of userID and routeID 
test("Create pair", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1); 
    expect(userID.success).toBe(true); 
    expect(routeID.success).toBe(true);
    
    const pairingSuccess = await pairUserAndRoute(db, userID.data!, routeID.data!);
    expect(pairingSuccess.success).toBe(true); 
});

test("Get all routes based on user ID", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1); 
    expect(userID.success).toBe(true); 
    expect(routeID.success).toBe(true);

    const pairingSuccess = await pairUserAndRoute(db, userID.data!, routeID.data!);
    expect(pairingSuccess.success).toBe(true); 

    const allRoutes = await getAllRoutes(db, userID.data!); 
    expect(allRoutes.success).toBe(true);
    expect(allRoutes.data![0]).toBeDefined();

    const route = await routeGet(db, routeID.data!);
    expect(route.success).toBe(true);
    expect(route.data).toEqual(allRoutes.data![0]);
});

test("Get all users based on route ID", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1); 
    expect(userID.success).toBe(true); 
    expect(routeID.success).toBe(true);

    const pairingSuccess = await pairUserAndRoute(db, userID.data!, routeID.data!);
    expect(pairingSuccess.success).toBe(true); 

    const allUsers = await getAllUsers(db, routeID.data!); 
    expect(allUsers.success).toBe(true);
    expect(allUsers.data).toBeDefined();

    const user = await getUser(db, userID.data!);
    expect(user.success).toBe(true);
    expect(user.data).toEqual(allUsers.data![0]);
});

test("Delete one pairing of userID and routeID", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1); 
    expect(userID.success).toBe(true); 
    expect(routeID.success).toBe(true);

    const pairingSuccess = await pairUserAndRoute(db, userID.data!, routeID.data!);
    expect(pairingSuccess.success).toBe(true); 

    const pairingDeletion = await removeUserRoutePair(db, routeID.data!, userID.data!);
    expect(pairingDeletion.success).toBe(true); 

    //Make sure we don't delete users and routes 
    const user = await getUser(db, userID.data!); 
    const route = await routeGet(db, routeID.data!); 
    expect(user.success).toBe(true); 
    expect(route.success).toBe(true); 
});

test("Delete users based on route in mapping table", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const userID2 = await createUser(db, name2, email2, age2, sex2);
    const routeID = await routeAdd(db, route1); 
    const routeID2 = await routeAdd(db, route2);
    expect(userID.success).toBe(true); 
    expect(userID2.success).toBe(true); 
    expect(routeID.success).toBe(true);
    expect(routeID2.success).toBe(true);

    expect((await pairUserAndRoute(db, userID.data!, routeID.data!)).success).toBe(true); 
    expect((await pairUserAndRoute(db, userID2.data!, routeID.data!)).success).toBe(true); 
    expect((await pairUserAndRoute(db, userID.data!, routeID2.data!)).success).toBe(true); 

    expect((await removeAllUsersFromPairs(db, routeID.data!)).success).toBe(true); 
    expect((await getAllUsers(db, routeID.data!)).success).toBe(false); 
    expect((await getAllUsers(db, routeID2.data!)).success).toBe(true); 
})

test("Delete routes based on user in mapping table", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const userID2 = await createUser(db, name2, email2, age2, sex2);
    const routeID = await routeAdd(db, route1); 
    const routeID2 = await routeAdd(db, route2);
    expect(userID.success).toBe(true); 
    expect(userID2.success).toBe(true); 
    expect(routeID.success).toBe(true);
    expect(routeID2.success).toBe(true);

    expect((await pairUserAndRoute(db, userID.data!, routeID.data!)).success).toBe(true); 
    expect((await pairUserAndRoute(db, userID2.data!, routeID.data!)).success).toBe(true); 
    expect((await pairUserAndRoute(db, userID.data!, routeID2.data!)).success).toBe(true); 

    expect((await removeAllRoutesFromPairs(db, userID.data!)).success).toBe(true); 
    expect((await getAllRoutes(db, userID.data!)).success).toBe(false); 
    expect((await getAllRoutes(db, userID2.data!)).success).toBe(true); 
});

test("Delete user, then looking up in map table", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1); 
    expect(userID.success).toBe(true); 
    expect(routeID.success).toBe(true);

    const pairingSuccess = await pairUserAndRoute(db, userID.data!, routeID.data!);
    expect(pairingSuccess.success).toBe(true); 

    const userStatus = await deleteUser(db, userID.data!); 
    const routeStatus = await routeDelete(db, routeID.data!);
    expect(userStatus.success).toBe(true); 
    expect(routeStatus.success).toBe(true); 

    const allRoutes = await getAllRoutes(db, userID.data!); 
    expect(allRoutes.success).toBe(false); 

    const allUsers = await getAllUsers(db, routeID.data!);
    expect(allUsers.success).toBe(false);
});

test("Fail to create duplicate pair of user and route", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1);
    expect(userID.success).toBe(true);
    expect(routeID.success).toBe(true);

    const firstPairing = await pairUserAndRoute(db, userID.data!, routeID.data!);
    const secondPairing = await pairUserAndRoute(db, userID.data!, routeID.data!);
    
    expect(firstPairing.success).toBe(true);
    expect(secondPairing.success).toBe(false); 
});

test("Attempt to remove non-existing pair", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    const routeID = await routeAdd(db, route1);
    expect(userID.success).toBe(true);
    expect(routeID.success).toBe(true);

    const deletePair = await removeUserRoutePair(db, routeID.data!, userID.data!);
    expect(deletePair.success).toBe(false); 
});

test("Get all routes for user without any pairings", async () => {
    const userID = await createUser(db, name1, email1, age1, sex1);
    expect(userID.success).toBe(true);

    const allRoutes = await getAllRoutes(db, userID.data!);
    expect(allRoutes.success).toBe(false); 
});

test("Get all users for route without any pairings", async () => {
    const routeID = await routeAdd(db, route1);
    expect(routeID.success).toBe(true);

    const allUsers = await getAllUsers(db, routeID.data!);
    expect(allUsers.success).toBe(false); 
});



