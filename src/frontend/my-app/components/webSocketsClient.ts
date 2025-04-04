
export interface typeOfData{
    type: string, 
    data: JSON
}

const port = 3000;
//export const ws = new WebSocket("ws://0.0.0.0:3000"); //LÄGG IN DIN DATORS IP ADDRESS HÄR

ws.onopen = () => {
  console.log('[Client] Connected');
  //ws.send('Hi, this is a client');
}
ws.onmessage = (event) => {
  console.log(`Message from server: ${event.data}`);
  //ws.send("Cool data");
}
ws.onerror = (error) => {
  console.error("WebSocket Error:", error);
}

//1 = Route data, 2 = user data, 3 = group data, 4 = request id
export function sendToBackend(ws: WebSocket, currentWalkData: JSON, Dataidentifier: number) {
  if (ws.readyState === WebSocket.OPEN) {
    console.log("\n\n\nWalk data: " + JSON.stringify(currentWalkData));
    //ws.send(Dataidentifier.toString() + JSON.stringify(currentWalkData));
    console.log("Message sent to server");
    let result: typeOfData;
    switch( Dataidentifier ) {
        case 1:
            result = {
                type: 'Route data',
                data: currentWalkData
            };
            console.log(JSON.stringify(result));
            ws.send(JSON.stringify(result));
    }

  } else {
    console.log("WebSocket is not open");
  }
}
