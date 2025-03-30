import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

import axios from 'axios';

const ORS_API_KEY = 'DIN_API_NYCKEL_HÄR';
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking';

type Coordinate = [number, number]; // [lon, lat]

async function getRouteWithStops(start: Coordinate, stops: Coordinate[]): Promise<void> {
  // Bygg koordinatlistan: start → stopp1 → ... → stoppN → tillbaka till start
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
      console.error("❌ Ingen rutt hittades.");
      return;
    }

    const route = data.routes[0];
    console.log("✅ Rutt hittad!");
    console.log("📏 Distans (meter):", route.summary.distance);
    console.log("⏱️ Varaktighet (sek):", route.summary.duration);
    console.log("📍 Antal steg:", route.segments[0].steps.length);
    console.log("🧭 Första instruktionen:", route.segments[0].steps[0].instruction);

    // Logga alla steg
    console.log("\n=== 🧭 Steg-för-steg-instruktioner ===");
    route.segments[0].steps.forEach((step: any, index: number) => {
      console.log(`${index + 1}. ${step.instruction} (${step.distance.toFixed(1)} m)`);
    });

    // Om du vill se rå GeoJSON/polyline
    // console.log("📦 GeoJSON geometry:", route.geometry);

  } catch (error: any) {
    console.error("💥 API-fel:", error.response?.data || error.message);
  }
}
