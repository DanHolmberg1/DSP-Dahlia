import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const MapScreen = () => {
  // Coordinates for the two points (San Francisco and another point)
  const pointA = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
  const pointB = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 36.7783, // Center between SF and LA
          longitude: -119.4179,
          latitudeDelta: 5.0, // Zoom level
          longitudeDelta: 5.0,
        }}
      >
        {/* Marker for San Francisco /}
        <Marker
          coordinate={pointA}
          title="San Francisco"
          description="This is SF"
        />

        {/ Marker for Los Angeles /}
        <Marker
          coordinate={pointB}
          title="Los Angeles"
          description="This is LA"
        />

        {/ Draw a path between the two points */}
        <Polyline
          coordinates={[pointA, pointB]} // Array of coordinates for the path
          strokeColor="#0000FF" // Path color
          strokeWidth={4} // Path thickness
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;