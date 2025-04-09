type LatLng = {
    latitude: number;
    longitude: number;
  };
  
  type Place = {
    name?: string;
    lat: number;
    lon: number;
    distance: number;
  };
  
  /**
   * Hämtar närmaste plats av en viss typ (t.ex. 'cafe') inom en radie från en plats.
   */
  export const getClosestLocation = async (
    center: LatLng,
    placeType: string,
    radius: number = 10000
  ): Promise<Place | null> => {
    const { latitude, longitude } = center;
  
    // Overpass Query
    const query = `
  [out:json];
  (
    node["amenity"="${placeType.toLowerCase()}"](around:${radius},${center.latitude},${center.longitude});
    way["amenity"="${placeType.toLowerCase()}"](around:${radius},${center.latitude},${center.longitude});
    relation["amenity"="${placeType.toLowerCase()}"](around:${radius},${center.latitude},${center.longitude});
  );
  out center;
`;

  
    try {
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        const text = await response.text();
        console.error("Overpass response not OK:", response.status, text);
        return null;
      }
      
      const data = await response.json();
  
      if (!data.elements || data.elements.length === 0) {
        console.warn(`No ${placeType} found nearby`);
        return null;
      }
  
      // Funktion för att beräkna avstånd
      const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const toRad = (deg: number) => deg * Math.PI / 180;
        const R = 6371e3;
        const φ1 = toRad(lat1), φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
  
      // Lägg till distans till varje plats och sortera
      interface OverpassElement {
        lat?: number;
        lon?: number;
        center?: {
          lat: number;
          lon: number;
        };
        tags?: {
          name?: string;
        };
      }

      const enriched: Place[] = data.elements
      .map((el: OverpassElement): Place | null => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat == null || lon == null) return null;
        
        return {
          name: el.tags?.name,
          lat,
          lon,
          distance: getDistance(latitude, longitude, lat, lon),
        };
      })
      .filter((p: Place | null): p is Place => p !== null);
    

  
      // Returnera närmaste
      const nearest = enriched.sort((a, b) => a.distance - b.distance)[0];

        return nearest ?? null;
  
    } catch (error) {
      console.error("Overpass API error:", error);
      return null;
    }
  };
  