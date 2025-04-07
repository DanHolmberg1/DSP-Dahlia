// TripWithStopsScreenSingleFile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import polyline from "polyline";
import { getRouteWithStops } from "./RoundTripLocations";
import { getClosestLocation } from "./FindClosestLocation";


const categories = ["Café", "Library", "Restaurant", "Museum", "Toilet", "Store", "Other"];

export default function TripWithStopsScreen() {
  type LatLng = { latitude: number; longitude: number };

  const [stops, setStops] = useState<LatLng[]>([]);
  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [address, setAddress] = useState("");
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [showPickStop, setPickStop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);


  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        onPress={(e) => {
          const coord = e.nativeEvent.coordinate;
          if (!startLocation) {
            setStartLocation(coord);
          } else {
            setStops((prev) => [...prev, coord]);
          }
        }}
      >
        {startLocation && <Marker coordinate={startLocation} title="Start" />}
        {stops.map((stop, index) => (
          <Marker key={index} coordinate={stop} title={`Stop ${index + 1}`} />
        ))}
        {route.length > 0 && <Polyline coordinates={route} strokeWidth={3} strokeColor="blue" />}
      </MapView>

      <View style={styles.card}>
        <Text style={styles.title}>Trip with stops</Text>
        <Text>
          Starting point: <Text style={{ fontWeight: "bold" }}>Press on map</Text>
        </Text>
        <View style ={styles.row}>
            <View style={styles.column}>
            <TouchableOpacity style={styles.button} onPress={() => alert("Tap on the map to add next stop")}> 
                <Text style={styles.buttonText}>Add stop on map</Text>
            </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowAddressInput(true)}
                    >
                    <Text style={styles.buttonText}>Add address</Text>
                </TouchableOpacity>

            <TouchableOpacity style={styles.button} 
                onPress={() => setPickStop(true)}>
                <Text style={styles.buttonText}>Pick stop</Text>
            </TouchableOpacity>
            </View>

            <View style={{flex: 1,
                        flexDirection: "column",
                        }}>
            <Text style={{marginLeft: 40, marginTop: 5}}>Route stops:</Text>
            <View style={styles.routeStops}>
                <Text style={{ color: "black" }}>1. First stop</Text>
                <Text style={{ color: "black" }}>2. Second stop</Text>
                <Text style={{ color: "black" }}>3. Third stop</Text>
                <Text style={{ color: "black" }}>4. Fourth stop</Text>
            </View>
            </View>
        </View>

        {showAddressInput && (
        <>
            <TextInput
            placeholder="Write an address..."
            style={styles.inputRoute}
            value={address}
            onChangeText={setAddress}
            />
            <Button
            title="Confirm address"
            onPress={() => {
                console.log("Address added:", address);
                // Här kan du lägga till logik för geokodning etc.
                setShowAddressInput(false); // göm rutan efteråt
            }}
            />
        </>
        )}

        {showPickStop && (
            <View>
            <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={styles.picker}
            mode="dropdown"
          >
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
          <Button
            title="Confirm stop"
            onPress={async () => {
              if (!startLocation) {
                alert("Choose a start location first");
                return;
              }

              {/**TODO: Fixa så att valda location läggs till i listan bredvid & så att den inte är invalid */}
              const nearest = await getClosestLocation(startLocation, selectedCategory);
              if (nearest && nearest.lat != null && nearest.lon != null) {
                const latlng: LatLng = {
                  latitude: nearest.lat,
                  longitude: nearest.lon
                };
                setStops(prev => [...prev, latlng]);
              } else {
                alert("No valid location found.");
              }

              setPickStop(false);
            }}
          />

          </View>
          
        )}

        <Button
          title="Generate route"
          onPress={async () => {
            if (!startLocation) return alert("Choose a start location");
            const result = await getRouteWithStops(startLocation, stops, 20000);
            if (result) {
              const decoded = polyline.decode(result.geometry);
              const formatted = decoded.map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
              setRoute(formatted);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginVertical: 10
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  button: {
    backgroundColor: "#263267",
    padding: 10,
    borderRadius: 8
  },
  buttonText: {
    color: "white"
  },
  inputRoute: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginTop: 10,
    borderRadius: 8
  },
  picker: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 8,
    height: 50,
    marginBottom: 20
  },
  routeStops: {
    backgroundColor: 'rgba(224, 225, 229, 0.96)',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginLeft: 40
  }
});