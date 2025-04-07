export default async function sendRouteDataHttpRequest(Routedata: JSON, userID: number){
    console.log("hereeee");
try{
    var response = await fetch("http://192.168.0.118/routesAdd", { // change IP address to your computer
        body: JSON.stringify(Routedata),
        headers: {"userID": userID.toString(),
        'Content-Type': 'application/json',
        },
        method: "POST"
        });
        console.log("OK", response)
}
catch(error){
console.log("ERROR",error)
}
}