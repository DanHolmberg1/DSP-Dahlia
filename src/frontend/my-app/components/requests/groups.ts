export async function getGroupByDate(date: Date): Promise<Array<any> | undefined> {
    try {
        const res = await fetch(`http://0.0.0.0:3000/groups/byDate?date=${date.toISOString()}`);
        const data = await res.json();
        console.log("Groups on that date:", data);
        return data; 
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

export async function sendGroupCreate(date: Date, userID: number, routeID: number, description: string, name: string, spots: number): Promise<number | undefined> {
    try {
        const res = await fetch('http://0.0.0.0:3000/groups/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userID,
                routeID: routeID,
                name: name,
                description: description,
                availableSpots: spots,
                date: date.toISOString()
            })
        });

        const data = await res.json();
        console.log("groupID:", data);
        return data; 

    } catch (err) {
        console.log("error group create" + err); 
        return undefined; 
    }

}

