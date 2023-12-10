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
    backgroundColor: "#74a1b5",
    padding: 20,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 10,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    fontSize: 18,
    width: "80%",
    marginVertical: 10,
    backgroundColor: "white",
  },
  button: {
    padding: 10,
    backgroundColor: "#cde0c9",
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#333",
  },
});
export default JoinSessionScreen;
