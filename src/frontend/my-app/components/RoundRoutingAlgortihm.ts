
type coordinates = {longitude: number, latitude:number};
/**
 * Calculates four corner points in a square that can be used to create a round route
 * @param start start coordinate --> right top corner of square
 * @param len the length of the route
 * @returns an array with corner coordinates
 */
export function calculateSquare(start:{longitude: number, latitude:number} | null, len: number) : coordinates[] | null {

    if (start) {

        const SquareSideLen = len /5;
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
