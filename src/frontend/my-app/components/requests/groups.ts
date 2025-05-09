//import { IP } from `../../../../backend/httpDriver`; 
const IP = "192.168.0.74";

export async function getGroupByDate(date: Date): Promise<Array<any> | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/byDate?date=${date.toISOString()}`);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Database error:", errorData);
            return undefined;  
        }

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
        const res = await fetch(`http://${IP}:3000/groups/create`, {
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

export async function sendGroupAdd(userID: number, groupID: number): Promise<boolean> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userID,
                groupID: groupID,
            })
        });
        //console.log("send group data data", res); 
        const data = await res.json(); 
        if(data.groupID) {
            return true; 
        }
        return false; 

    } catch (err) {
        console.log("error group add" + err); 
        return false; 
    }

}

export async function getAllGroupsForUser(userID: number): Promise<Array<any> | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/byUser?userID=${userID}`);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Database error:", errorData);
            return undefined;  
        }

        const data = await res.json();
        console.log("Groups on that date:", data);
        return data; 
    } catch (err) {
        console.error("Fetch error:", err);
        return undefined;
    }
}

export async function getAllUsersForGroup(groupID: number): Promise<Array<any> | undefined> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/byGroup?groupID=${groupID}`);

        if(!res.ok) {
            const errorData = await res.json(); 
            console.log("Database error:", errorData); 
            return undefined;
        }

        const data = await res.json(); 
        console.log("Users in the group", data); 
        return data;
    } catch (err) {
        console.error("Fetch error:", err); 
        return undefined; 
    }
}

export async function removeUserFromGroup(userID: number, groupID: number): Promise<boolean> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/removeUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userID,
                groupID: groupID,
            })
        });
        if(!res.ok) {
            return false; 
        }
        return true; 

    } catch (err) {
        console.log("error removing user from group" + err); 
        return false; 

    }
}

export async function getIsInGroup(groupID: number, userID: number): Promise<boolean> {
    try {
        const res = await fetch(`http://${IP}:3000/groups/isInGroup?userID=${userID}&groupID=${groupID}`);

        if(!res.ok) {
            const errorData = await res.json(); 
            console.log("Database error:", errorData); 
            return false;
        }

        const status = await res.json(); 
        console.log("User is in group", status); 
        return status;
    } catch (err) {
        console.error("Fetch error:", err); 
        return false; 
    }
}


