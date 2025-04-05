// components/RouteMap.tsx

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import api_key from '../secrets.env'

const ORS_API_KEY = api_key;


type Coordinate = [number, number]; // [lon, lat]

export const getRouteWithStops = async (start: { latitude: number, longitude: number }, stops: { latitude: number, longitude: number }[], radius: number) => {
  // Bygg koordinatlistan: start → stopp1 → ... → stoppN → tillbaka till start
  // const coordinates: Coordinate[] = [start, ...stops, start];
  const coordinates = [[start.longitude, start.latitude], ...stops.map(stop => [stop.longitude, stop.latitude])];

  try {
    const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: coordinates,
        radiuses: Array(coordinates.length).fill(radius)  // Start/end coordinate
        // options: { 
        //     round_trip: { // Round-trip: start and end points are the same
        //         length: len,  // Length of the route (in meters)
        //         seed: seed,   // Random seed for the route calculation
        //         points: p // Number of points for the round trip
        //     }
        // }
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
