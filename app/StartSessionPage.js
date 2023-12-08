// This is a page the group leader will see where they can set the center
// location and the radius for restaurant querying. Once everyone has joined,
// they can start the session and then everyone will go to the SelectRestPage.

import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { supabase } from "./index";

const GroupMembersComponent = () => {
  const params = useLocalSearchParams();
  const [groupMembers, setGroupMembers] = useState([]);
  const groupCode = params.group_code;

  const handleRecordUpdated = (payload) => {
    setGroupMembers(payload.new.group_members);
  };

  const handleSessionStart = async () => {
    try {
      const { error: updateError } = await supabase
        .from("groups")
        .update({ session_active: true })
        .textSearch("group_code", groupCode);

      if (updateError) {
        throw updateError;
      }

      router.push({
        pathname: "/SelectRestPage",
        params: {
          group_code: params.group_code,
          id: params.id,
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius,
        },
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    supabase
      .channel("changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "groups",
          filter: "group_code=eq." + groupCode,
        },
        handleRecordUpdated
      )
      .subscribe();
  }, []);

  useEffect(() => {
    // Fetch data on initial load
    const fetchData = async () => {
      const response = await supabase
        .from("groups")
        .select("*")
        .textSearch("group_code", params.group_code);
      setGroupMembers(response.data[0].group_members);
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>Group Name: {params.group_name}</Text>

      <Text style={styles.groupCode}>Group Code: {params.group_code}</Text>
      <ScrollView style={styles.membersList}>
        {groupMembers.map((member, index) => (
          <Text key={index} style={styles.member}>
            {member.name}
          </Text>
        ))}
      </ScrollView>
      <Pressable style={styles.button} onPress={handleSessionStart}>
        <Text style={styles.buttonText}>Start Session</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#74a1b5",
  },
  groupName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 70,
  },
  groupCode: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  membersList: {
    width: "100%",
    marginBottom: 20,
  },
  member: {
    fontSize: 26,
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default GroupMembersComponent;
