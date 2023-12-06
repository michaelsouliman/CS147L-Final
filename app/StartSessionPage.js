// This is a page the group leader will see where they can set the center
// location and the radius for restaurant querying. Once everyone has joined,
// they can start the session and then everyone will go to the SelectRestPage.

import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";
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
        pathname: "/SelectRestPageLeader",
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
    <View>
      <Text>Group Members:</Text>
      <Text>{params.group_code}</Text>
      {groupMembers.map((member, index) => (
        <Text key={index}>{member.name}</Text>
      ))}
      <Text>{params.group_code}</Text>
      <Button title="Start Session" onPress={handleSessionStart}></Button>
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

export default GroupMembersComponent;
