import dotenv from 'dotenv';

dotenv.config();

const ORS_API_KEY = process.env['ORS_API_KEY']!;
const ORS_URL = "https://api.openrouteservice.org/v2/directions/foot-walking";

export interface apiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LatLng { latitude: number; longitude: number }


export async function getRouteWithStops(coordinates: LatLng[]): Promise<Response> {
  console.log(coordinates);
  const orsCoords = coordinates.map(({ latitude, longitude }) => [longitude, latitude]);

  const response = await fetch(ORS_URL, {
    method: "POST",

    headers: {
      Authorization: ORS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coordinates: orsCoords,
    }),
  });
  return response;

};




export async function getRoundRoute(start: LatLng, seed: number, len: number) {
  console.log(start);
  const response = await fetch(
    ORS_URL,
    {
      method: 'POST',
      headers: {
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [[start.longitude, start.latitude]],
        continue_straight: true,
        options: {
          round_trip: {
            length: len,
            seed: seed,
            points: 6,
          },
        },
      }),
    }
  );

  return response;
}


export async function getStartEndTrip(start: LatLng, end: LatLng) {
  const coordinates = [[start.longitude, start.latitude], [end.longitude, end.latitude]];
  const radius = 1000; // NOTE: THIS SHOULD BE WHAT???
  const response = await fetch(ORS_URL, {
    method: "POST",
    headers: {
      Authorization: ORS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coordinates: [[start.longitude, start.latitude], [end.longitude, end.latitude]],
      radiuses: Array(coordinates.length).fill(radius)
    }),
  });
  return response;
}
