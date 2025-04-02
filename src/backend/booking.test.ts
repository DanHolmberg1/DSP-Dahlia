import { DBInit, routeAdd, routeDelete, routeGet, createGroup, createUser, 
    getUser, updateUser, deleteUser, clearUsers } from "./db_opertions";
import { open, Database } from 'sqlite';

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

let usersDb: Database;

beforeEach(async () => {
    try{
    usersDb = await DBInit()
    } catch (err){
        console.error("Could not init db", err);
    }
}
);

afterEach(async () => {
    await clearUsers(usersDb); 
    await usersDb.close();
});

//testign to insert a user into a database 
test('Insert user into users database', async () => {
    const id = await createUser(usersDb, name1, email1, age1, sex1); 
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0); //börjar man på 0 eller 1?
});

//test get user from database 

test('Fetch user from users db', async () => {
    const id = await createUser(usersDb, name1, email1, age1, sex1); 
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0); 
    if(id.data){
        const user = await getUser(usersDb, id.data); 
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
    const id = await createUser(usersDb, name1, email1, age1, sex1);
    expect(id.success).toBe(true); 
    expect(id.data).toBeGreaterThanOrEqual(0);     
    if(id.data){
        expect((await deleteUser(usersDb, id.data)).success).toBe(true);
    }
});

//test insert same user twice 
test('Insert same email twice', async () => {
    const id1 = await createUser(usersDb, name1, email1, age1, sex1);
    const id2 = await createUser(usersDb, name2, email1, age2, sex2); //skriver ut error 
    expect(id1.success).toBe(true); 
    expect(id2.success).toBeFalsy; 
});

//test invalid user 
test('Insert invalid user information', async () => {
    const id1 = await createUser(usersDb, name1, invalidEmail, age1, sex1);
    const id2 = await createUser(usersDb, '', email1, age1, sex1);
    const id3 = await createUser(usersDb, name1, email1, invalidAge, sex1);
    const id4 = await createUser(usersDb, name1, email1, age1, invalidSex);
    expect(id1.success).toBeFalsy;
    expect(id2.success).toBeFalsy;
    expect(id3.success).toBeFalsy;
    expect(id4.success).toBeFalsy;
});

//test updating user 
test('Update user', async () => {
    const id = await createUser(usersDb, name1, email1, age1, sex1); 
    expect(id.success).toBeTruthy;

    if(id.success && id.data){
        await updateUser(usersDb, id.data, name2, email1, age1 + 1, sex2);
        const user = await getUser(usersDb, id.data);
        expect(user.success).toBeTruthy;

        if(user.success && user.data){
            expect(user.data.name).toBe(name2); 
            expect(user.data.email).toBe(email1); 
            expect(user.data.age).toEqual(age1 + 1); 
            expect(user.data.sex).toBe(sex2);
        } 
    }
});

//test updating invalid values 


