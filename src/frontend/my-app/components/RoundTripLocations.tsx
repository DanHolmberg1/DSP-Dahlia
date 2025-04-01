// components/RouteMap.tsx

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import polyline from "@mapbox/polyline";

const ORS_API_KEY = 'DIN_API_NYCKEL';

type Coordinate = {
  latitude: number;
  longitude: number;
};

export default function RouteMap() {
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);

  const start = { latitude: 59.8586, longitude: 17.6389 };
  const stops = [
    { latitude: 59.8570, longitude: 17.6340 },
    { latitude: 59.8595, longitude: 17.6300 }
  ];

  useEffect(() => {
    const getRoute = async () => {
      try {
        const coordinates = [
          [start.longitude, start.latitude],
          ...stops.map((s) => [s.longitude, s.latitude]),
          [start.longitude, start.latitude], // rundtur
        ];

        const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
          method: "POST",
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coordinates }),
        });

        const data = await response.json();
        const encoded = data.routes[0].geometry;

        const decoded = polyline.decode(encoded).map(([lat, lng]: number[]) => ({
          latitude: lat,
          longitude: lng,
        }));

        setRouteCoords(decoded);
        setLoading(false);
      } catch (error) {
        console.error("API-fel:", error);
      }
    };

    getRoute();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: start.latitude,
          longitude: start.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={routeCoords}
          strokeColor="#ff6600"
          strokeWidth={4}
        />
        <Marker coordinate={start} title="Start / Slut" />
        {stops.map((stop, i) => (
          <Marker key={i} coordinate={stop} title={`Stopp ${i + 1}`} pinColor="green" />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
