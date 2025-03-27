import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoundTripRoute } from "./RoutingAPI";
import polyline, { decode } from "polyline";

const MapScreen = ({}) => {
    const [route, setRoute] = useState<{latitude: number, longitude: number }[]>([]);
  
    useEffect(() => {
      const fetchRoute = async () => {
        const start = { latitude: 59.8586, longitude: 17.6450}; // Example starting point (Berlin)
        const result = await getRoundTripRoute(start, 1000, 42, 3);
        console.log("result", result);
            const decodegeom = polyline.decode(result);
            console.log("decode", decodegeom);
            const formattedRoute = decodegeom.map((coord: number[]) => ({
                latitude: coord[0],
                longitude: coord[1],
              }));

            console.log("here again", formattedRoute);
            setRoute(formattedRoute);
      };
  
      fetchRoute();
    }, []); 
  
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 59.8586, // Example center (Berlin)
            longitude: 17.6450,
            latitudeDelta: 0.05, // Zoom level
            longitudeDelta: 0.05,
          }}
        >
          {/* Optionally, display a marker at the start location */}
          <Marker coordinate={{ latitude: 59.8586, longitude: 17.6450 }} title="Start & End" />
  
          {/* Render the route on the map */}
          <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
        </MapView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
  });
  
  export default MapScreen;