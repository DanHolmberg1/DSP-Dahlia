
type coordinates = {longitude: number, latitude:number};

const toRadians = (degree: number) => degree * (Math.PI / 180);
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

/**
 * 
 * @param start strat coordinate
 * @param lenght length of walk
 * @param numPoints number of points
 * @returns an array of cooridnates
 */

export function RoundRouting(start:{latitude: number, longitude:number} | null, lenght: number, numPoints: number ) : coordinates[] | null  {


    if ( start ) {
    const angle = 360 / numPoints;
    const radius = lenght/(2 * Math.PI);
    const distance = (angle/360) * 2 * Math.PI * radius; //Båglängd

    const Result = [start]; // Array with all coordinates
    

    // Omkrets = 2pir

    for ( let i = 1; i < numPoints; i ++ ) {
        const currentRad= toRadians(angle * i);
        //const angleDeg = toRadians(angle*i);

        const lat = toRadians(start.latitude);
        const lon = toRadians(start.longitude);

        const distance = (currentRad/2* Math.PI) * 2 * Math.PI * radius;

        const angularDistance = distance / 6371000; 
        
        const newLat = lat + distance * Math.cos(currentRad);
        const newLon = lon + distance * Math.sin(currentRad);

    
        Result.push({latitude: newLat, longitude: newLon});

    }
    Result.push(start);
    return Result;
}

return null;

}


export function calulateCircle( start:{longitude: number, latitude:number} | null, lenght: number, numPoints: number ) : coordinates[] | null {
    console.log("yas");
    if (start) {
        console.log("in if");
        //const radiusKm = lenght/(2 * Math.PI) / 6371000;
        const radiusKm = (lenght/1000)/(2 * Math.PI);
        console.log("radius", radiusKm);
        const angularDistance = radiusKm / 6371; // Convert radius to angular distance (radians)
        console.log("angulardis:", angularDistance);

        const Allpoints:coordinates[] = [start];

        // Find center point
        const newLat = start.latitude - (angularDistance * (180 / Math.PI)); // Convert to degrees
        const newLon = start.longitude - (angularDistance * (180 / Math.PI)); // Same for longitude

        const center: coordinates = {longitude: newLon, latitude: newLat};

        const radiusLon = 1 /(111.319 * Math.cos(center.latitude* (Math.PI/180))) * radiusKm;
        const radiusLat = 1 / 110.574 * radiusKm;
        let theta = 0;
        const dTheta = 2 * Math.PI / numPoints;
        console.log("before loop")


        for (var i = 0; i < numPoints; i++){
            console.log("in loop");
                const newLat = center.latitude + radiusLat * Math.sin(theta);
                const newLon = center.longitude + radiusLon * Math.cos(theta)
                
                Allpoints.push({longitude: newLon, latitude: newLat});

                theta += dTheta;
            }

            Allpoints.push(start);
            console.log(Allpoints);
            return Allpoints;
    }

    return null;

}


export function calculateSquare(start:{longitude: number, latitude:number} | null, len: number) : coordinates[] | null {

    if (start) {

        const SquareSideLen = len /4;
        const latOffset = SquareSideLen/ 111320;
        const lonOffset = SquareSideLen/ (111320 * Math.cos(start.latitude * Math.PI/180));

        console.log("lan_offset:", latOffset);
        console.log("lon offset", lonOffset);

        const Allpoints = [start];

        const topLeft: coordinates = {longitude: start.longitude - lonOffset , latitude: start.latitude}
        Allpoints.push(topLeft);

        const bottomLeft: coordinates = {longitude: start.longitude - lonOffset, latitude: start.latitude - latOffset};
        Allpoints.push(bottomLeft);

        const bottomRight: coordinates = {longitude: start.longitude, latitude: start.latitude - latOffset};
        Allpoints.push(bottomRight);

        Allpoints.push(start);

        console.log("all points square:", Allpoints);

        return Allpoints;
    }

    return null;
}



export function RemoveDuplicates(Allpoints: number[][]) : number[][]  {

    const length = Allpoints.length;

    // return Allpoints.filter((coord, index, self) => {
    //     // Check if the current coordinate is the first occurrence of that coordinate
    //     return index === self.findIndex((c) => JSON.stringify(c) === JSON.stringify(coord));
    //   });

    const uniqueCoordinates = Allpoints.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t[0] === value[0] && t[1] === value[1]
        )))

        return uniqueCoordinates;
}
