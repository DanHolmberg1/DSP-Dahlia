
type coordinates = {longitude: number, latitude:number};

const toRadians = (degree: number) => degree * (Math.PI / 180);
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

function roundCoord(coord: number): number {
    return parseFloat(coord.toFixed(6));  // ORS usually sends 5-6 decimals
}


export function calculateSquareWalk(start:{longitude: number, latitude:number} | null, len: number) : coordinates[] | null {

    if (start) {

        const SquareSideLen = len/5;
        const latOffset = SquareSideLen/ 111320;
        const lonOffset = SquareSideLen/ (111320 * Math.cos(start.latitude * Math.PI/180));

        console.log("lan_offset:", latOffset);
        console.log("lon offset", lonOffset);

        const roundedStart = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude)};

        const cornerPoints = [roundedStart];

        const topLeft: coordinates = {longitude: roundCoord(start.longitude - lonOffset) , latitude: roundCoord(start.latitude)}
        cornerPoints.push(topLeft);
        console.log("left in alg:", topLeft);

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

function arePointsClose(p1: number[], p2: number[], tolerance: number = 0.0005): boolean {
    const [lon1, lat1] = p1;
    const [lon2, lat2] = p2;
    return Math.abs(lon1 - lon2) < tolerance && Math.abs(lat1 - lat2) < tolerance;
}


function calculateAngle(allPoints: number[][], cornerIndex: number) : boolean {



    const indexBefore = cornerIndex -1;
    const indexAfter = cornerIndex + 1;

    const A = allPoints[indexBefore]; //coord before
    const B = allPoints[cornerIndex]; // coord in middle
    const C = allPoints[indexAfter]; // coord after
   

    const AB = [ B[0] - A[0], B[1] - A[1]]; // vector AB

    const BC = [C[0]- B[0], C[1] - B[1]]; // Vector BC

    const dotABBC = AB[0] * BC[0] + AB[1] * BC[1];

    const lenAB = Math.hypot(AB[0], AB[1]);
    const lenBC = Math.hypot(BC[0], BC[1]);

    const cosAngle = dotABBC / (lenAB * lenBC);

    const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));

    console.log("angle", toDegrees(angle));

    if(angle > toRadians(150)) {
        console.log('hey');
        return true;
    }

    return false;

}

export function removeUTurn( allPoints: number[][], cornerPoints: number[][]) : number[][] {

    const leftTop = cornerPoints[1];
    console.log("left top", leftTop);
    const leftBottom = cornerPoints[2];
    const rightBottom = cornerPoints[3];

    let topLeftArray = [];
    let bottomLeftArray = [];
    let bottomRightArray = [];

    // const leftTopIndex = allPoints.findIndex(
    //     p =>  arePointsClose(p, leftTop) //p[0] === leftTop[0] && p[1] == leftTop[1]
    // );

    // console.log("left top in all points", allPoints[leftTopIndex]);

    // console.log("left Top index", leftTopIndex);

    const leftBottomIndex = allPoints.findIndex(
        p => arePointsClose(p, leftBottom) //p[0] === leftBottom[0] && p[1] == leftBottom[1]
    );

    console.log("left bottom index", leftBottomIndex);

    const rightBottomIndex = allPoints.findIndex(
        p => arePointsClose(p, rightBottom)//p[0] === rightBottom[0] && p[1] == rightBottom[1]
    );

    //  if(calculateAngle(allPoints, leftTopIndex)) {
    //     console.log("calc top left");
    //     topLeftArray.push(leftTopIndex-1, leftTopIndex,leftTopIndex+1);  
    //  }

     if(calculateAngle(allPoints, leftBottomIndex)) {
        console.log("calc bottom left");

        console.log("index left bottom", leftBottomIndex-1, leftBottomIndex,leftBottomIndex+1);
        bottomLeftArray.push(leftBottomIndex-1, leftBottomIndex,leftBottomIndex+1);  
     }


        console.log("right bottom index", rightBottomIndex);
    //  if(calculateAngle(allPoints, rightBottomIndex)) {
    //     console.log("calc right bottom");
    //     bottomRightArray.push(rightBottomIndex,rightBottomIndex+1);  
    //  }

     const allIndexesToDelete = [... bottomLeftArray];

     console.log(allIndexesToDelete);

     if (allIndexesToDelete.length > 0) {
        console.log("tja");
        const filteredPoints = allPoints.filter((_, index) => !allIndexesToDelete.includes(index));
        return filteredPoints;
    } else {
        return allPoints;
    }

}


export function calculateTriangleeWalk(start:{longitude: number, latitude:number} | null, len: number) : coordinates[] | null {

    if (start) {

        const triangleSideLen = len/4.5; // more accurate lengths when dividing with 4 and not 3 (unsure why)
        const latOffset = triangleSideLen/ 111320; // calculate the offset when moving in latitude
        const lonOffset = triangleSideLen/ (111320 * Math.cos(start.latitude * Math.PI/180)); // calculate the offset when moving in longitude

        console.log("lan_offset:", latOffset);
        console.log("lon offset", lonOffset);

        const roundedStart = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude)};

        const cornerPoints = [roundedStart];

        const bottomLeft: coordinates = {longitude: roundCoord(start.longitude - lonOffset), latitude: roundCoord(start.latitude - latOffset)};
        cornerPoints.push(bottomLeft);

        const bottomRight: coordinates = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude - latOffset)};
        cornerPoints.push(bottomRight);

        cornerPoints.push(roundedStart);

        console.log("corner points triangle:", cornerPoints);

        return cornerPoints;
    }

    return null;
}

export function calculateTriangleAndCircleWalk(start:{longitude: number, latitude:number} | null, len: number) : coordinates[] | null {

    if (start) {

        const SquareSideLen = len/4; // more accurate lengths when dividing with 4
        const latOffset = SquareSideLen/ 111320;
        const lonOffset = SquareSideLen/ (111320 * Math.cos(start.latitude * Math.PI/180));

        console.log("lan_offset:", latOffset);
        console.log("lon offset", lonOffset);

        const roundedStart = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude)};

        const cornerPoints = [roundedStart];

        // const topLeft: coordinates = {longitude: roundCoord(start.longitude - lonOffset) , latitude: roundCoord(start.latitude)}
        // cornerPoints.push(topLeft);
        // console.log("left in alg:", topLeft);

        const bottomLeft: coordinates = {longitude: roundCoord(start.longitude - lonOffset), latitude: roundCoord(start.latitude - latOffset)};
        cornerPoints.push(bottomLeft);

        const bottomRight: coordinates = {longitude: roundCoord(start.longitude), latitude: roundCoord(start.latitude - latOffset)};
        cornerPoints.push(bottomRight);

        cornerPoints.push(roundedStart);

        console.log("corner points triangle:", cornerPoints);

        const R = 6371000; // Earth's radius in meters

        const lat1 = toRadians(bottomLeft.latitude);
        const lon1 = toRadians(bottomLeft.longitude);

        const lat2 = toRadians(bottomRight.latitude);
        const lon2 = toRadians(bottomRight.longitude);
    
        const bearing = toRadians(0); // North / top of the half circle

        const radius = len/2;
    
        const latCircle1 = Math.asin(
            Math.sin(lat1) * Math.cos(radius / R) +
            Math.cos(lat1) * Math.sin(radius / R) * Math.cos(bearing)
        );
    
        const lonCircle1 = lon1 + Math.atan2(
            Math.sin(bearing) * Math.sin(radius / R) * Math.cos(lat1),
            Math.cos(radius / R) - Math.sin(lat1) * Math.sin(lat2)
        );


        const latCircle2 = Math.asin(
            Math.sin(lat2) * Math.cos(radius / R) +
            Math.cos(lat2) * Math.sin(radius / R) * Math.cos(bearing)
        );
    
        const lonCircle2 = lon2 + Math.atan2(
            Math.sin(bearing) * Math.sin(radius / R) * Math.cos(lat2),
            Math.cos(radius / R) - Math.sin(lat2) * Math.sin(lat2)
        );


        const circlePointlat1 = toDegrees(latCircle1);
        const circlePointlon1 = toDegrees(lonCircle1);

    
        const circlePointlat2 = toDegrees(latCircle2);
        const circlePointlon2 = toDegrees(lonCircle2)

        const circlePoint1:coordinates = {latitude: circlePointlat1, longitude: circlePointlon2};
        const circlePoint2:coordinates = {latitude: circlePointlat2, longitude: circlePointlon2};

        //cornerPoints.push(circlePoint1, circlePoint2);







        return cornerPoints;
    }

    return null;
}
