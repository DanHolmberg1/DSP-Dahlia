//import { IP } from '../../../../backend/httpDriver'; 
const IP = "172.20.10.3";

export async function mockUser(): Promise<number | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/mock/userCreate`);
        const data = await res.json();
        console.log("userID:", data);
        return data;
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

export async function mockUser2(): Promise<number | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/mock/userCreate2`);
        const data = await res.json();
        console.log("userID:", data);
        return data;
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

async function clearDB() {
    await fetch(`http://${IP}:3000/mock/clear`); 
    console.log("Done"); 
}