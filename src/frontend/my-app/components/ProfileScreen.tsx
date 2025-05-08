import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker'; // För bild

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Hantera bildval
  const handleImagePick = async (useCamera: boolean) => {
    setShowImageOptions(false);
    
    try {
      const permission = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Behörighet krävs", "Vi behöver åtkomst till din kamera/galleri");
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

      if (!result.canceled) {
        // Här sparar du den valda bilden (t.ex. i state eller till backend)
        console.log("Vald bild URI:", result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Fel", "Kunde inte välja bild");
    }
  };

  return (
    <View style={styles.container}>
      {/* Mörk overlay när bildalternativ visas */}
      {showImageOptions && (
        <Pressable 
          style={styles.overlay}
          onPress={() => setShowImageOptions(false)}
        />
      )}

      {/* Profilcirkel */}
      <TouchableOpacity onPress={() => setShowImageOptions(true)}>
        <View style={styles.profileCircle} />
      </TouchableOpacity>

      <Text style={styles.instructionText}>Klicka för att ändra</Text>
      <Text style={styles.nameText}>Namn</Text>

      {/* Informationsboxar */}
      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.infoBox}>
          <Text style={styles.infoLabel}>Namn</Text>
          <Text style={styles.infoValue}>Klicka för att uppdatera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBox}>
          <Text style={styles.infoLabel}>Födelsedatum</Text>
          <Text style={styles.infoValue}>Välj datum</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBox}>
          <Text style={styles.infoLabel}>Kön</Text>
          <Text style={styles.infoValue}>Välj kön</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBox}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>example@email.com</Text>
        </TouchableOpacity>
      </View>

      {/* Bildval-modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.imageOptionsContainer}>
          <TouchableOpacity 
            style={styles.imageOptionButton}
            onPress={() => handleImagePick(false)}
          >
            <Text style={styles.imageOptionText}>Ladda upp bild</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.imageOptionButton}
            onPress={() => handleImagePick(true)}
          >
            <Text style={styles.imageOptionText}>Ta en ny bild</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.imageOptionButton, { borderBottomWidth: 0 }]}
            onPress={() => setShowImageOptions(false)}
          >
            <Text style={[styles.imageOptionText, { color: 'red' }]}>Avbryt</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Knapprad längst ner */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Tillbaka</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={() => {
            Alert.alert("Sparad", "Din profil är uppdaterad");
            navigation.goBack();
          }}
        >
          <Text style={styles.saveButtonText}>Spara</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  profileCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "black",
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  infoContainer: {
    width: "85%",
    marginBottom: 30,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  imageOptionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    zIndex: 2,
  },
  imageOptionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#FF8C00", // hex för orange= "#FFA500", gul= "#FFFF00", grön= "#008000", blå= "#0000FF", röd= "#FF0000"
  },
  saveButton: {
    backgroundColor: "#3B82F6",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
});

export default ProfileScreen;