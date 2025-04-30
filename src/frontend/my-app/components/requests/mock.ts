
export async function mockUser(): Promise<number | undefined> {
    try {
        const res = await fetch(`http://192.168.0.74:3000/mock/userCreate`);
        const data = await res.json();
        console.log("userID:", data);
        return data;
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

async function clearDB() {
    await fetch('http://localhost:3000/mock/clear'); 
    console.log("Done"); 
}