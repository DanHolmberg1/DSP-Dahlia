
import { sortAngleSmallToBig } from "./LocationAlgorithm";

const ORS_API_KEY = ''

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

  //const coordinates: LatLng[] = orderedStops.map(stop => [stop.longitude, stop.latitude]);
  //console.log(coordinates);
  try {
    const response = await fetch("http://172.20.10.8:8443/routeWithStops", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: orderedStops,//coordinates,
        radiuses: Array(orderedStops.length).fill(radius)  // Start/end coordinate

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
