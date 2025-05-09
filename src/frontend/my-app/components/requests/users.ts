const IP = "192.168.0.74";

export async function sendUserCreate(name: string, email: string, age: number, sex: number): Promise<number | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/users/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                age: age,
                sex: sex
            })
        });

        const data = await res.json();
        console.log("userID:", data);
        return data; 

    } catch (err) {
        console.log("error user create" + err); 
        return undefined; 
    }

}

export async function getUserByID(userID: number): Promise<any | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/users/get?userID=${userID}`);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Database error:", errorData);
            return undefined;  
        }

        const data = await res.json();
        console.log("userID:", data);
        return data; 
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

export async function getUserByEmail(email: string): Promise<number | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/users/getId?email=${email}`);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Database error:", errorData);
            return undefined;  
        }

        const data = await res.json();
        console.log("userID:", data);
        return data; 
        
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}