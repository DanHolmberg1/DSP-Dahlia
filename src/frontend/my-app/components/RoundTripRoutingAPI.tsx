import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

const ORS_API_KEY = '5b3ce3597851110001cf6248ada064c2831b4ee5b5d4165c1ccaf9b3';
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
export const getRoundTripRoute = async (start: {latitude: number, longitude:number} | null, len: number, seed: number, p: number) => {
    if (start == null) {
        console.error("Something went wrong with the coordinates.");
        return;
    }
    try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
            method: "POST",
            headers: {
                Authorization: ORS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                coordinates: [[start.longitude, start.latitude]], // Start/end coordinate
                options: { 
                    round_trip: { // Round-trip: start and end points are the same
                        length: len,  // Length of the route (in meters)
                        seed: seed,   // Random seed for the route calculation
                        points: p // Number of points for the round trip
                    }
                }
            }),  
        });
     
        const data = await response.json();
        if(data.routes && data.routes.length > 0 && data.routes[0].geometry) {
            console.log("data:", data);
            return data;
        }else {
            console.error("route data is invalid")
        }
    } catch (error) {
        console.error("API error:", error);
    }
};




