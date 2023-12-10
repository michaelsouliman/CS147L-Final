// Page after name addition that shows current group members and message saying that you are waiting for the group leader to start the session
// needs to subscribe to start session column for their group row
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
  const [sessionStarted, setSessionStarted] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
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

      const updatedGroupMembers = data.group_members.filter(
        (member) => member.id.toString() !== params.id
      );

      updatedGroupMembers.forEach((member, index) => {
        member.id = index;
      });

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
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude,
          radius: locationInfo.radius,
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
      setLocationInfo({
        latitude: response.data[0].latitude,
        longitude: response.data[0].longitude,
        radius: response.data[0].radius,
      });
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>Group Members:</Text>
      <ScrollView style={styles.membersList}>
        {groupMembers.map((member, index) => (
          <Text key={index} style={styles.member}>
            {member.name}
          </Text>
        ))}
      </ScrollView>
      <Pressable style={styles.button} onPress={handleLeaveGroup}>
        <Text style={styles.buttonText}>Leave Group</Text>
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
