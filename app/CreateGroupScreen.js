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
    <View>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.title,
        }}
      />
      <Text>Create a Group</Text>
      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
        style={styles.groupNameInput}
      />
      <TextInput
        placeholder="Your Name"
        value={leaderName}
        onChangeText={(text) => setLeaderName(text)}
        style={styles.leaderNameInput}
      ></TextInput>
      <Pressable style={styles.createGroupButton} onPress={createGroup}>
        <Text style={styles.createGroupButtonText}>Create Group</Text>
      </Pressable>
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
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").height * 0.8,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
export default CreateGroupScreen;
