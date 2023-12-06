import React, { useState, useEffect } from "react";
import {
  View,
  Dimensions,
  Button,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import * as Location from "expo-location";
import Modal from "react-native-modal";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { supabase } from "./index";

const MapWithRadius = () => {
  const [region, setRegion] = useState(null);
  const [center, setCenter] = useState(null);
  const [radius, setRadius] = useState(1000); // Default radius in meters
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [inputRadius, setInputRadius] = useState(""); // To store the radius input
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
    // Any other action you want to perform with the selected center and radius
  };

  const handleConfirmMap = async () => {
    try {
      const { data, error } = await supabase.from("groups").insert([
        {
          group_name: params.group_name,
          group_code: params.group_code,
          group_members: [
            { id: 0, name: params.leader_name, liked: [], disliked: [] },
          ],
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

      // Redirect to session screen or handle navigation as needed
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
      <Text>
        Drag around the marker to set your starting point and click on the
        radius circle to set a new radius
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
          <Text>Enter Radius (in meters):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputRadius}
            onChangeText={handleRadiusInputChange}
            placeholder="Enter radius"
          />
          <Button title="Confirm Radius" onPress={handleConfirmRadius} />
        </View>
      </Modal>
      <Button title="Confirm Map" onPress={handleConfirmMap}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    height: 40,
    width: 200,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default MapWithRadius;
