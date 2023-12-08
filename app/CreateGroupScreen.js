import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const params = useLocalSearchParams();

  const createGroup = async () => {
    if (groupName != "" && leaderName != "") {
      let groupCode = generateString(6);
      console.log("Group created internally, not yet added to DB");
      router.push({
        pathname: "/LocationSelectionPage",
        params: {
          group_code: groupCode,
          group_name: groupName,
          leader_name: leaderName,
        },
      });
    } else {
      if (groupName == "") {
        Alert.alert(
          "Invalid Group Name, Please make sure you specify the group name"
        );
      }
      if (leaderName == "") {
        Alert.alert("Invalid Personal Name, Please input your name");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.title,
        }}
      />
      <Text style={styles.text}>Create a Group</Text>
      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Your Name"
        value={leaderName}
        onChangeText={(text) => setLeaderName(text)}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={createGroup}>
        <Text style={styles.buttonText}>Create Group</Text>
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

export default CreateGroupScreen;
