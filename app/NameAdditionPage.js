// This is the page users see after joining a group. They will see everyone else
// that is in the group and will add themselves (making sure they have a unique
// name from everyone else). They will then be taken to the SelectRestPage when
// the group leader starts the session (by subscribing to a column in Supabase
// that tells the app if the group that the user is actively in is live).

import { useLocalSearchParams, Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { supabase } from "./index";

const NameAdditionPage = () => {
  const params = useLocalSearchParams();
  const groupCode = params.group_code;
  const [name, setName] = useState("");

  const joinGroup = async () => {
    if (name != "") {
      try {
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .textSearch("group_code", groupCode);

        if (error) {
          throw error;
        }

        const new_member = {
          id: data[0].group_members.length,
          name: name,
          liked: [],
        };

        const updatedMembers = [...data[0].group_members, new_member];

        const { error: updateError } = await supabase
          .from("groups")
          .update({ group_members: updatedMembers })
          .textSearch("group_code", groupCode);

        if (updateError) {
          throw updateError;
        }

        console.log("Added new member!");

        router.push({
          pathname: "/AwaitSessionStart",
          params: {
            group_code: params.group_code,
            group_name: params.group_name,
            user_name: name,
            id: new_member.id,
          },
        });
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else {
      if (name == "") {
        Alert.alert(
          "Invalid Name, Please make sure you add your name to this session"
        );
      }
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.group_name,
        }}
      />
      <TextInput
        placeholder="Your Name"
        value={name}
        onChangeText={(text) => setName(text)}
        style={styles.nameInput}
      ></TextInput>
      <Pressable style={styles.createGroupButton} onPress={joinGroup}>
        <Text style={styles.createGroupButtonText}>Join Group</Text>
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

export default NameAdditionPage;
