import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";


/**
 * Function that makes an API call to OpenRouteService to get the desired route.
 * 
 * @param {number | null } start - Start and end coordinates for the route.
 * @param {number }len  - Lenght of route in meters.
 * @param {number} seed -  Value used to ensure reproducibility of the route generation process. 
 * It is essentially a number used to initialize a random number generator.
 * @param {number} p - This specifies how many points you want along the round trip route.
 * @returns -  This function returns the geometry object of the first route in the routes array from the data object. 
 * The geometry contains the geographic data representing the route's path, 
 * which is usually a series of coordinates (latitude and longitude). 
 * This data is typically used to render a route on a map.
 */
/*
export const getRoundTripRouteCircle = async (start: { longitude: number, latitude: number }[] | null, len: number, seed: number, p: number) => {
  console.log("hereeee");

  if (start == null) {
    console.error("Something went wrong with the coordinates.");
    return;
  }

  const coordinates = start.map(start => [start.longitude, start.latitude]);

  console.log("coordinate:", coordinates);

  try {
    const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: coordinates, // Start/end coordinate
        radiuses: Array(coordinates.length).fill(5000),

        // options: { 
        //     round_trip: { // Round-trip: start and end points are the same
        //         length: len,  // Length of the route (in meters)
        //         seed: seed,   // Random seed for the route calculation
        //         points: 6 // Number of points for the round trip
        //     }
        // }
      }),
    });

    console.log("Response Status:", response.status);


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return;
    }

    }
  } catch (error) {
    console.error("API error:", error);
  }
};

*/


export async function getRoundTripRoute(
  start: { longitude: number; latitude: number } | null,
  len: number,
  seed: number,
  userID: number
): Promise<JSON | null> {
  if (!start) {
    return null;
  }
  console.log("we should fetch");

  const res = await fetch(
    "http://172.20.10.8:8443/routeGenerateRoundWalk",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: { latitude: start.latitude, longitude: start.longitude },
        len,
        seed,
        userID,
      }),
    }
  );

  if (!res.ok) {
    // optional: custom handling
    throw new Error(`Fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}


