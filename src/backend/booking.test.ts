import { DBInit, routeAdd, routeDelete, routeGet, createUser, 
    getUser, updateUser, deleteUser, clearUsers, removeAllRoutesFromPairs,
    removeUserRoutePair,
    getAllUsers,
    getAllRoutes,
    pairUserAndRoute,
    DBResponse, 
    clearGroups,
    clearUsersRoutes,
    clearRoutes, 
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

const name3 = "Alex"; 
const email3 = "alex@email.com"; 
const age3 = 20; 
const sex3 = 3; 

const invalidEmail = "inteBra.com"; 
const invalidAge = -1; 
const invalidSex = 0; 


const route1 = JSON.parse('{"name":"TestWalk1, not real data"}');
const route2 = JSON.parse('{"name":"TestWalk2, not real data"}');

let db: Database;

beforeEach(async () => {
    try{
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

//testign to insert a user into a database 
test('Insert user into users database', async () => {
    const id = await createUser(db, name1, email1, age1, sex1); 
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0); //börjar man på 0 eller 1?
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
});


