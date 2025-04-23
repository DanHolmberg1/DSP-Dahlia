//Locations dyker upp i ordning som inte garanterar en runt rutt. Denna algoritm ska motverka detta
// Skickar in en array med platser. Beräkning sker och den nya ordningen skickas tillbaka. 

//Räkna ut vinkeln från startpunkten till de andra punkterna.
// Den vinkel som är trubbigast blir nästa punkt. osv tills man gått varvet runt?

// Använder atan2, den räknar vinkeln i radianer (skillnad mellan start och punkt)
// Sedan sorterar vi dessa i minsta vinkel till största vinkel medurs

type LatLng = {
    latitude: number;
    longitude: number;
  };

/**
 * Calculates angle between stops
 * @param coordinates array of coordinates, first coordinate is start
 * @returns sorted array of coordinates
 */
function calculateAngle(start: LatLng, stop: LatLng){
    return Math.atan2(stop.latitude - start.latitude, stop.longitude - start.longitude);
}

export function sortAngleSmallToBig(stops: LatLng[]){
    const start = stops[0];
    const sortedStops = [...stops.slice(1)].sort(
        (a, b) => calculateAngle(start, a) - calculateAngle(start, b)
    );

    return [start, ...sortedStops, start];
} 


/**
 * Create grid-routing style path: A → via middle → B
 */
export function addGridPointsToRoute(stops: LatLng[]): LatLng[] {
    if (stops.length < 2) return stops;
  
    const result: LatLng[] = [];
  
    for (let i = 0; i < stops.length - 1; i++) {
      const current = stops[i];
      const next = stops[i + 1];
  
      // Första delen: gå rakt i latitud
      const middlePoint: LatLng = {
        latitude: next.latitude,
        longitude: current.longitude,
      };
  
      result.push(current);
      result.push(middlePoint);
    }
  
    // Lägg till sista stoppet
    result.push(stops[stops.length - 1]);
  
    return result;
  }