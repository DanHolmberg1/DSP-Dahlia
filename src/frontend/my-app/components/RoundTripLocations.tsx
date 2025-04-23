
//import api_key from '../secrets.env'

import { addGridPointsToRoute, sortAngleSmallToBig } from "./LocationAlgorithm";

const ORS_API_KEY =''

type Coordinate = [number, number]; // [lon, lat]
type LatLng = {
  latitude: number;
  longitude: number;
};

export const getRouteWithStops = async (
  start: LatLng, 
  stops: LatLng[], 
  radius: number
) => {

  const orderedStops: LatLng[] = sortAngleSmallToBig([start, ...stops, start]);
  const gridLocations: LatLng[] = addGridPointsToRoute(orderedStops);

  const coordinates: Coordinate[] = orderedStops.map(stop => [stop.longitude, stop.latitude]);
  
  try {
    const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: coordinates,
        radiuses: Array(coordinates.length).fill(radius)  // Start/end coordinate
        
      }),
    });

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));
    if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
      return data.routes[0];
    } else {
      console.error("route data is invalid")
    }
  } catch (error) {
    console.error("API error:", error);
  }
};
