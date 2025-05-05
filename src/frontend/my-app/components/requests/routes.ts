export async function createRoute(userID: number, routeData: JSON): Promise<number | undefined> {
    try {
        const res = await fetch("http://172.20.10.3:3000/routes/create", { // change IP address to your computer
            body: JSON.stringify(routeData),
            headers: {"userID": userID.toString(),
            'Content-Type': 'application/json',
            },
            method: "POST"
            });

        const data = await res.json();
        console.log("routeID:", data);
        return data; 
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

export async function routeGet(routeID: number): Promise<JSON | undefined> {
    try {
        const res = await fetch(`http://172.20.10.3:3000/routes/get?routeID=${routeID}`); 
        const data = await res.json();
        return JSON.parse(data); 

    } catch (err) {
        console.error("Failed to fetch:", err); 
        return undefined; 
    }
}

async function pairRouteAndUser(userID: number, routeID: number): Promise<boolean> {
    try {
        const res = await fetch("http://172.20.10.3:3000/routes/add", { 
            body: JSON.stringify({userID: userID, routeID: routeID}),
            headers: {
            'Content-Type': 'application/json',
            },
            method: "POST"
            });

        if(!res.ok) {
            return false; 
        }
        return true; 
    
    } catch (err) {
        console.error("Fetch error:", err);
        return false;
    }
}
