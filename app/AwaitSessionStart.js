// Page after name addition that shows current group members and message saying that you are waiting for the group leader to start the session
// needs to subscribe to start session column for their group row
import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";
import { supabase } from "./index";

const GroupMembersComponent = () => {
  const params = useLocalSearchParams();
  const [groupMembers, setGroupMembers] = useState([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const groupCode = params.group_code;

  const handleRecordUpdated = (payload) => {
    setGroupMembers(payload.new.group_members);
    setSessionStarted(payload.new.session_active);
  };

  const handleLeaveGroup = async () => {
    try {
      let { data, error } = await supabase
        .from("groups")
        .select("*")
        .textSearch("group_code", groupCode)
        .single();

      if (error) {
        throw error;
      }

      // Remove the member with the given id
      const updatedGroupMembers = data.group_members.filter(
        (member) => member.id.toString() !== params.id
      );

      // Update the ids of the remaining members
      updatedGroupMembers.forEach((member, index) => {
        member.id = index;
      });

      // Update the group members in the database
      const { error: updateError } = await supabase
        .from("groups")
        .update({ group_members: updatedGroupMembers })
        .textSearch("group_code", groupCode);

      if (updateError) {
        throw updateError;
      }

      console.log("Successfully left group!");

      router.push({
        pathname: "/JoinSessionScreen",
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
    if (sessionStarted == true) {
      router.push({
        pathname: "/SelectRestPage",
        params: {
          group_code: params.group_code,
          id: params.id,
        },
      });
    }
  }, [sessionStarted]);

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
      {groupMembers.map((member, index) => (
        <Text key={index}>{member.name}</Text>
      ))}

      <Button title="Leave Group" onPress={handleLeaveGroup}></Button>
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
