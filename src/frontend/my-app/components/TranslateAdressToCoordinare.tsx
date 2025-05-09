import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

type coordinate = [number, number];

export const translatedAdress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
      
      if (!response.ok) {
        console.error("Failed to fetch coordinates from Photon");
        return null;
      }
  
      const data = await response.json();
  
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return { latitude: lat, longitude: lon };
      } else {
        console.warn("No results found for address:", address);
        return null;
      }
    } catch (error) {
      console.error("Error translating address:", error);
      return null;
    }
  };