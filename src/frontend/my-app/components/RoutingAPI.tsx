import { useState, useEffect } from "react";
import axios from "axios";

const ORS_API_KEY = "YOUR_ORS_API_KEY";
const ORS_URL = "https://api.openrouteservice.org/v2/directions/foot-walking";

const useWalkingRoute = (start: [number, number], end: [number, number]) => {
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getWalkingRoute() {
      try {
        setLoading(true);
        const response = await axios.post(
          ORS_URL,
          { coordinates: [start, end] },
          { headers: { Authorization: ORS_API_KEY, "Content-Type": "application/json" } }
        );

        if (!response.data.routes || response.data.routes.length === 0) {
          setError("No route found");
          return;
        }

        const coordinates = response.data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lon,
        }));

        setRouteCoords(coordinates);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "API Error");
        } else {
          setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    getWalkingRoute();
  }, [start, end]);

  return { routeCoords, loading, error };
};

export default useWalkingRoute;
