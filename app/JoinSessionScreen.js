import { useLocalSearchParams, Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { supabase } from "./index";

const JoinSessionScreen = () => {
  const params = useLocalSearchParams();
  const [groupCode, setGroupCode] = useState("");

  const joinSession = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .textSearch("group_code", groupCode);

      if (error) {
        throw error;
      }

      if (data.length > 0) {
        router.push({
          pathname: "/NameAdditionPage",
          params: { group_code: groupCode, group_name: data[0].group_name },
        });
      } else {
        Alert.alert("Invalid Group Code", "Please enter a valid group code.");
      }
    } catch (error) {
      console.error("Error joining session:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Join Session",
        }}
      />
      <Text style={styles.text}>Join a Session</Text>
      <TextInput
        placeholder="Group Code"
        value={groupCode}
        onChangeText={(text) => setGroupCode(text)}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={joinSession}>
        <Text style={styles.buttonText}>Login To Session</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#74a1b5", // Background color
    padding: 20, // Add padding for spacing
  },
  text: {
    fontSize: 20, // Increase text size
    textAlign: "center", // Center align text
    marginVertical: 10, // Add vertical margin for spacing
    color: "white", // Optional: Change text color
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    fontSize: 18, // Increase font size
    width: "80%", // Width relative to container
    marginVertical: 10, // Add vertical margin
    backgroundColor: "white", // Optional: Change input background
  },
  button: {
    padding: 10,
    backgroundColor: "#cde0c9",
    alignItems: "center",
    justifyContent: "center",
    width: "60%", // Width relative to container
    borderRadius: 5,
    marginVertical: 10, // Add vertical margin
  },
  buttonText: {
    fontSize: 18, // Increase font size
    color: "#333",
  },
});
export default JoinSessionScreen;
