import React, { useState, useEffect } from "react";
import {
  View,
  Dimensions,
  Button,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import * as Location from "expo-location";
import Modal from "react-native-modal";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { supabase } from "./index";

const MapWithRadius = () => {
  const [region, setRegion] = useState(null);
  const [center, setCenter] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [inputRadius, setInputRadius] = useState("");
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let latitude = location.coords.latitude;
      let longitude = location.coords.longitude;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setCenter({ latitude, longitude });
    })();
  }, []);

  const handleConfirmRadius = () => {
    setConfirmModalVisible(false);
  };

  const handleConfirmMap = async () => {
    try {
      const { data, error } = await supabase.from("groups").insert([
        {
          group_name: params.group_name,
          group_code: params.group_code,
          group_members: [{ id: 0, name: params.leader_name, liked: [] }],
          session_active: false,
          latitude: center.latitude,
          longitude: center.longitude,
          radius: radius,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log("Group created!");
      router.push({
        pathname: "/StartSessionPage",
        params: {
          group_code: params.group_code,
          group_name: params.group_name,
          id: "0",
          latitude: center.latitude,
          longitude: center.longitude,
          radius: radius,
        },
      });
    } catch (error) {
      console.error("Error creating group:", error.message);
    }
  };

  const handleRadiusInputChange = (text) => {
    if (!isNaN(text)) {
      setInputRadius(text);
      setRadius(parseInt(text, 10));
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.group_name,
        }}
      />
      <Text style={styles.text}>
        Please wait until the map shows up. Then, drag around the marker to set
        your starting point and click on the radius circle to set a new radius!
      </Text>
      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={(e) => {
            setCenter(e.nativeEvent.coordinate);
            setConfirmModalVisible(true);
          }}
        >
          {center && (
            <Marker
              coordinate={center}
              draggable
              onDragEnd={(e) => setCenter(e.nativeEvent.coordinate)}
            />
          )}
          {center && (
            <Circle
              center={center}
              radius={radius}
              fillColor="rgba(128,128,128,0.3)"
            />
          )}
        </MapView>
      )}

      <Modal isVisible={confirmModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.text}>Enter Radius (in meters):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputRadius}
            onChangeText={handleRadiusInputChange}
            placeholder="Enter radius"
          />
          <Pressable style={styles.button} onPress={handleConfirmRadius}>
            <Text style={styles.buttonText}>Confirm Radius</Text>
          </Pressable>
        </View>
      </Modal>

      <Pressable style={styles.button} onPress={handleConfirmMap}>
        <Text style={styles.buttonText}>Confirm Map</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#74a1b5",
  },
  text: {
    fontSize: 18, // Increase font size
    textAlign: "center", // Center text
    marginVertical: 10, // Add vertical spacing
    color: "black",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.65,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default MapWithRadius;
