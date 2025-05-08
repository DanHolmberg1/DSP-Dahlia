const IP = "0.0.0.0";

export async function sendUserCreate(name: string, email: string, age: number, sex: number): Promise<number | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/create`, {
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

export async function getUser(userID: number): Promise<number | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userID
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
