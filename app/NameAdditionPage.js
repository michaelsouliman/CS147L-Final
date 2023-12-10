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
  Alert,
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.group_name,
          headerBackTitle: "Login",
        }}
      />
      <TextInput
        placeholder="Your Name"
        value={name}
        onChangeText={(text) => setName(text)}
        style={styles.input}
      ></TextInput>
      <Pressable style={styles.button} onPress={joinGroup}>
        <Text style={styles.buttonText}>Join Group</Text>
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

export default NameAdditionPage;
