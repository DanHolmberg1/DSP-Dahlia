
export async function createRoute(userID: number, routeData: JSON): Promise<number | undefined> {
    try {
        const res = await fetch("http://0.0.0.0:3000/routes/create", { // change IP address to your computer
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

