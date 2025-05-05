import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
type Coordinate = [number, number];
/**
 * API call to Photon to translate coordinates to street, city or country. No API key needed. 
 * @param coordinate coordinate to translate
 * @returns street, city or country name. If all of these are undefined the coordinate will be returned in string format. 
 */
export const translateCoordinate = async (coordinate: Coordinate): Promise<string | null> => {
  const [latitude, longitude] = coordinate;

  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      console.error("Failed to fetch address from Photon");
      return null;
    }

    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        const name = props.name || props.street || props.city;
  
        if (name) {
          return name;
        }
      }
  
      return `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
    } catch (error) {
      console.error("Error translating coordinate:", error);
      return `Lat: ${coordinate[0].toFixed(5)}, Lon: ${coordinate[1].toFixed(5)}`;
    }
};
