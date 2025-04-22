
import axios from 'axios';


const ORS_API_KEY = "";
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking';

type Coordinate = [number, number]; // [lon, lat]

async function getRouteWithStops(start: Coordinate, stops: Coordinate[]): Promise<void> {
  const coordinates: Coordinate[] = [start, ...stops, start];

  try {
    const response = await axios.post(ORS_URL, {
      coordinates: coordinates
    }, {
      headers: {
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    if (!data.routes || data.routes.length === 0) {
      console.error("Ingen rutt hittades.");
      return;
    }

    const route = data.routes[0];
    console.log("Rutt hittad!");
    console.log("Distans (meter):", route.summary.distance);
    console.log("Varaktighet (sek):", route.summary.duration);
    console.log("Antal steg:", route.segments[0].steps.length);
    console.log("Första instruktionen:", route.segments[0].steps[0].instruction);

    console.log("\n=== Steg-för-steg-instruktioner ===");
    route.segments[0].steps.forEach((step: any, index: number) => {
      console.log(`${index + 1}. ${step.instruction} (${step.distance.toFixed(1)} m)`);
    });

    console.log("GeoJSON geometry:", route.geometry);

  } catch (error: any) {
    console.error("API-fel:", error.response?.data || error.message);
  }

}

const start: Coordinate = [17.6389, 59.8586]; // Uppsala centrum
const stops: Coordinate[] = [
  [17.6340, 59.8570],
  [17.6300, 59.8595]
];

getRouteWithStops(start, stops);
