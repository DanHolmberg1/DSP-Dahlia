


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


//Test the API to make sure it returns correct data
test("should convert address to valid coordinates using Photon API", async () => {
    const result = await translatedAdress("Uppsala Centralstation");
    expect(result).toBeDefined();
    expect(typeof result.latitude).toBe("number");
    expect(typeof result.longitude).toBe("number");
  });

//Test that data is being sent correctly to database

// Test correct translations from adress to coordinate