import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

const ORS_API_KEY = '';

export const getRoundTripRoute = async (start: {latitude: number, longitude:number}, len: number, seed: number, p: number) => {
    try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
            method: "POST",
            headers: {
                Authorization: ORS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                coordinates: [[start.longitude, start.latitude]], // Start coordinate
                options: { 
                    round_trip: { // Correctly placed under options
                        length: len,  // Length of the route (in meters)
                        seed: seed,   // Random seed for the route calculation
                        points: p // Number of points for the round trip
                    }
                }
            }),
            
        });
     
        const data = await response.json();
        //console.log("here",data);
        if(data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        return data.routes[0].geometry;//.map((coord: [number, number]) => ({
        //     latitude: coord[1],
        //     longitude: coord[0],
        // }));
    } else {
        console.error("route data is invalid")
    }

    }   catch (error) {
        console.error("API error:", error);
    }
};




