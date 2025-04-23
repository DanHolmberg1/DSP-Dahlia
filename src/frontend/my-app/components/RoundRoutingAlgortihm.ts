import { all } from "axios";

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

/**
 * Calculates a coordinates in a circle from start point
 * @param start 
 * @param lenght 
 * @param numPoints 
 * @returns 
 */
export function calulateCircle( start:{longitude: number, latitude:number} | null, lenght: number, numPoints: number ) : coordinates[] | null {
    console.log("yas");
    if (start) {
        console.log("in if");
        //const radiusKm = lenght/(2 * Math.PI) / 6371000;
        const radiusKm = (lenght/1000)/2 
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

            console.log("all points circle", Allpoints);
            return Allpoints;
    }

    return null;

}

function roundCoordinate(value: number, decimals: number = 5): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}


/**
 * Calculates four corner points in a square, right top corner being start point
 * @param start 
 * @param len 
 * @returns 
 */

function roundCoord(coord: number): number {
    return parseFloat(coord.toFixed(6));  // ORS usually sends 5-6 decimals
}
export function calculateSquare(start:{longitude: number, latitude:number} | null, len: number) : coordinates[] | null {

    if (start) {

        const SquareSideLen = len/4;
        const latOffset = SquareSideLen/ 111320;
        const lonOffset = SquareSideLen/ (111320 * Math.cos(start.latitude * Math.PI/180));

        console.log("lan_offset:", latOffset);
        console.log("lon offset", lonOffset);

        const roundedStart = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude)};

        const cornerPoints = [roundedStart];

        const topLeft: coordinates = {longitude: roundCoord(start.longitude - lonOffset) , latitude: roundCoord(start.latitude)}
        cornerPoints.push(topLeft);

        const bottomLeft: coordinates = {longitude: roundCoord(start.longitude - lonOffset), latitude: roundCoord(start.latitude - latOffset)};
        cornerPoints.push(bottomLeft);

        const bottomRight: coordinates = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude - latOffset)};
        cornerPoints.push(bottomRight);

        cornerPoints.push(roundedStart);

        console.log("corner points square:", cornerPoints);

        return cornerPoints;
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

function helperRemoveDup(allPoints: number[][], cornerIndex: number, distanceThreshold: number = 10): number[] {
    const indexesToRemove: number[] = [];
    const length = allPoints.length;
    let i = 1;

    while ((cornerIndex - i >= 0) && (cornerIndex + i < length)) {
        const p1 = allPoints[cornerIndex - i];
        const p2 = allPoints[cornerIndex + i];

        if (!p1 || !p2) break;

        const distance = haversineDistance(p1, p2);
        console.log("dis", distance);

        if (distance < distanceThreshold) {
            indexesToRemove.push(cornerIndex - i, cornerIndex + i);
            i++; // keep expanding if still close
        } else {
            break; // as soon as points are too far, stop
        }
    }

    if (indexesToRemove.length > 0) {
        indexesToRemove.push(cornerIndex); // also remove the corner point itself
    }

    return indexesToRemove;
}

function round3(coord: {longitude: number, latitude: number}) {
    return [
        Math.round(coord.longitude * 1000) / 1000,
        Math.round(coord.latitude * 1000) / 1000
    ];
}

function arePointsClose(p1: number[], p2: number[], tolerance: number = 0.0005): boolean {
    const [lon1, lat1] = p1;
    const [lon2, lat2] = p2;
    return Math.abs(lon1 - lon2) < tolerance && Math.abs(lat1 - lat2) < tolerance;
}

function haversineDistance(p1: number[], p2: number[]): number {
    const [lon1, lat1] = p1;
    const [lon2, lat2] = p2;
    const R = 6371000; // Radius of Earth in meters

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    // const a = Math.sin(dLat / 2) ** 2 +
    //           Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    //           Math.sin(dLon / 2) ** 2;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}


let R = 6371; // Radious of the earth
//  Double lat1 = Double.parseDouble(args[0]);
//  Double lon1 = Double.parseDouble(args[1]);
//  Double lat2 = Double.parseDouble(args[2]);
//  Double lon2 = Double.parseDouble(args[3]);
//  Double latDistance = toRad(lat2-lat1);
//  Double lonDistance = toRad(lon2-lon1);
//  Double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) + 
//  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
//  Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
//  Double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//  Double distance = R * c;

// Simplified remove duplicates for coordinates
function removeDuplicates(allPoints: number[][], precision: number = 6): number[][] {
    const uniqueCoords = new Set<string>();

    const result = allPoints.filter(coord => {
        // Round the latitude and longitude to the specified precision
        const lat = coord[1].toFixed(precision);
        const lon = coord[0].toFixed(precision);
        const coordString = `${lat},${lon}`; // Create a unique string for each coordinate pair

        if (!uniqueCoords.has(coordString)) {
            uniqueCoords.add(coordString);
            return true;
        }
        return false;
    });

    return result;
}


function areCoordinatesClose(coord1: number[], coord2: number[], tolerance: number = 0.0001): boolean {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    // Check if the absolute difference in latitude and longitude is within the tolerance
    return Math.abs(lat1 - lat2) < tolerance && Math.abs(lon1 - lon2) < tolerance;
}

function removeDuplicatesNew(coords: number[][]): number[][] {
    const uniqueCoords: number[][] = [];
    
    for (const coord of coords) {
        // Check if this coordinate is close to any already added
        if (!uniqueCoords.some(existingCoord => areCoordinatesClose(existingCoord, coord))) {
            uniqueCoords.push(coord);
        }
    }

    return uniqueCoords;
}

export function RemoveDuplicatesSquare(allPoints: number[][], cornerPoints: number[][]): number[][] {

    const lenght = allPoints.length;

    // const roundedAllPoints = allPoints.map(p => round3({longitude: p[0], latitude: p[1]}));
    // const roundedCornerPoints = cornerPoints.map(p => round3({longitude: p[0], latitude: p[1]}));

    // console.log("hejsan");

     console.log("cornerPoints", cornerPoints);
     console.log("all points", allPoints);
    // console.log("start corner", cornerPoints[0]);
    // console.log("all points start", allPoints[0]);
    
    const leftTop = cornerPoints[1];
    console.log("left top" , leftTop);
    const leftBottom = cornerPoints[2];
    const rightBottom = cornerPoints[3];

    // const leftTop = roundedCornerPoints[1];
    // const leftBottom = roundedCornerPoints[2];
    // const rightBottom = roundedCornerPoints[3];

    // console.log("rounded corner", roundedCornerPoints);
    // console.log("rounded all points", roundedAllPoints);

    let leftTopDup = true;
    let leftBottomDup = true;
    let rightBottomDup = true;

    let leftTopDupArray:number[] = [];
    let leftBttomDupArray:number[]  = [];
    let rightBottomDupArray:number[]  = [];

    let dupFound = false;


    //Find the corner points in allPoints array
    const leftTopIndex = allPoints.findIndex(
        p =>  arePointsClose(p, leftTop) //p[0] === leftTop[0] && p[1] == leftTop[1]
    );

    console.log("left Top index", leftTopIndex);

    const leftBottomIndex = allPoints.findIndex(
        p => arePointsClose(p, leftBottom) //p[0] === leftBottom[0] && p[1] == leftBottom[1]
    );

    console.log("left bottom index", leftBottomIndex);

    const rightBottomIndex = allPoints.findIndex(
        p => arePointsClose(p, rightBottom)//p[0] === rightBottom[0] && p[1] == rightBottom[1]
    );

    console.log("right bottom index", rightBottomIndex);

    console.log("left top in allPoints", allPoints[leftTopIndex]);

    console.log("left top -1 and +1", allPoints[leftTopIndex-1], allPoints[leftTopIndex+1]);
    console.log("distans between +1, -1", haversineDistance(allPoints[leftTopIndex -1], allPoints[leftTopIndex+1]));
    console.log("left top -2 and +2", allPoints[leftTopIndex-2], allPoints[leftTopIndex+2]);

    console.log("are points close 1", arePointsClose(allPoints[leftTopIndex+1], allPoints[leftTopIndex-1]));
    console.log("are points close 2", arePointsClose(allPoints[leftTopIndex+2], allPoints[leftTopIndex-2] ));
    
    //Get arrays with indexes of duplicates + corner
    // leftTopDupArray = helperRemoveDup(allPoints, leftTopIndex);
    // leftBttomDupArray = helperRemoveDup(allPoints, leftBottomIndex);
    // rightBottomDupArray = helperRemoveDup(allPoints, rightBottomIndex);


    console.log("remove left top:", leftTopDupArray);

    const allIndexesToDelete = [...leftTopDupArray, ... leftBttomDupArray, ... rightBottomDupArray];

   

    const allCorners = [leftTopIndex, leftBottomIndex, rightBottomIndex];

    if (true) {
        const filteredPoints = allPoints.filter((_, index) => !allCorners.includes(index));
        const dup = removeDuplicatesNew(filteredPoints);
        console.log("no dup", dup);
        return dup;

    } else {
        return allPoints;
    }
}

