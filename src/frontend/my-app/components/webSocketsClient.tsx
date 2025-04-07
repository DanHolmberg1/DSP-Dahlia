export interface typeOfData{
    type: string, 
    data: JSON, 
    id: number, 
    message?: string
  }

const port = 3000;
export const ws = new WebSocket("ws://0.0.0.0:3000"); //LÄGG IN DIN DATORS IP ADDRESS HÄR

ws.onopen = () => {
  console.log('[Client] Connected');
  //ws.send('Hi, this is a client');
  sendToBackend(ws, JSON.parse('{"message": "Hi, this is a client"}'), 5); 
}
ws.onmessage = (event) => {
  console.log(`Message from server: ${event.data}`);
  //ws.send("Cool data");
}
ws.onerror = (error) => {
  console.error("WebSocket Error:", error); //borde lägga till något bättre??? 
}


/**
 * Use this when you want to send data to the backend port 
 * @param ws webSocket
 * @param sendData The data you want to send, in JSON format 
 * @param DataIdentifier 1 = Route data, 2 = user data, 3 = group data, 4 = request id, 5 = other
 */
export function sendToBackend(ws: WebSocket, sendData: JSON, DataIdentifier: number) {
  if (ws.readyState === WebSocket.OPEN) {
    console.log("\n\n\nWalk data: " + JSON.stringify(sendData));
    //ws.send(Dataidentifier.toString() + JSON.stringify(sendData));
    console.log("Message sent to server");
    let result: typeOfData;

    const userID = 0; //Obs ändra när vi fixat local storage!!!!

    switch( DataIdentifier ) {
        case 1:
            result = {
                type: 'Route data',
                data: sendData,
                id: userID
            };
            console.log(JSON.stringify(result));
            ws.send(JSON.stringify(result));
        case 2:
            result = {
                type: 'User data',
                data: sendData,
                id: userID
            };
            ws.send(JSON.stringify(result));
        
        case 3:
            result = {
                type: 'Group data',
                data: sendData,
                id: userID
            };
            ws.send(JSON.stringify(result));

        case 4: 
            result = {
                type: 'id request',
                data: sendData,
                id: userID
            };
            ws.send(JSON.stringify(result));
        
        case 5:
            result = {
                type: 'Other',
                data: sendData,
                id: userID
            }
            ws.send(JSON.stringify(result));
    }

  } else {
    console.log("WebSocket is not open");
  }
}