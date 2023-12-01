import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { supabase } from "./App";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");

  const createGroup = async () => {
    try {
      let groupCode = generateString(6);
      const { data, error } = await supabase
        .from("groups")
        .insert([{ group_name: groupName, group_code: groupCode }]);

      if (error) {
        throw error;
      }

      console.log("Group created!");

      // Redirect to session screen or handle navigation as needed
    } catch (error) {
      console.error("Error creating group:", error.message);
    }
  };

  return (
    <View>
      <Text>Create a Group</Text>
      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
      />
      <Button title="Create Group" onPress={createGroup} />
    </View>
  );
};

export default CreateGroupScreen;
