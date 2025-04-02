import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

const ORS_API_KEY = '5b3ce3597851110001cf6248b1f7555fe5853475313cd0743d282c959806e66bce50ba0c6b28aa69';


export const getStartEndTrip = async(start: {latitude: number, longitude:number} | null, end: {latitude: number, longitude:number} | null, seed: number, p: number, radius:number) => {
    if (start == null || end == null) {
        console.log("something went wrong with start/end coordinates");
        return;
    }
    const coordinates = [[start.longitude, start.latitude], [end.longitude, end.latitude]];

    try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
            method: "POST",
            headers: {
                Authorization: ORS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                coordinates: [[start.longitude, start.latitude], [end.longitude, end.latitude]],
                radiuses: Array(coordinates.length).fill(radius) // Start/end coordinate
            }),  
        });
     
        const data = await response.json();
        console.log("stop data:", data);
        if(data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        return data.routes[0];
        } else {
        console.error("route data is invalid here")
       }
    } catch (error) {
        console.error("API error:", error);
    }
};

