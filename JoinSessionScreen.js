import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { supabase } from "./App";

const JoinSessionScreen = ({ navigation }) => {
  const [groupCode, setGroupCode] = useState("");

  const joinSession = async () => {
    try {
      console.log(groupCode);
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .textSearch("group_code", groupCode);

      if (error) {
        throw error;
      }

      if (data.length > 0) {
        navigation.navigate("NameAdditionPage", {
          group_name: data.group_name,
          group_members: data.group_members,
        });
      } else {
        Alert.alert("Invalid Group Code", "Please enter a valid group code.");
      }
    } catch (error) {
      console.error("Error joining session:", error.message);
    }
  };

  return (
    <View>
      <Text>Join a Session</Text>
      <TextInput
        placeholder="Group Code"
        value={groupCode}
        onChangeText={(text) => setGroupCode(text)}
      />
      <Button title="Join Session" onPress={joinSession} />
    </View>
  );
};

export default JoinSessionScreen;
