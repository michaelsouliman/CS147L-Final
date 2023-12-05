import { useLocalSearchParams, Stack, router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
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
    <View>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.title,
        }}
      />
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
