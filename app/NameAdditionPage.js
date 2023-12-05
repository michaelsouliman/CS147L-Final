// This is the page users see after joining a group. They will see everyone else
// that is in the group and will add themselves (making sure they have a unique
// name from everyone else). They will then be taken to the SelectRestPage when
// the group leader starts the session (by subscribing to a column in Supabase
// that tells the app if the group that the user is actively in is live).

import { useLocalSearchParams, Stack, router } from "expo-router";
import React from "react";
import { View, Text, TextInput } from "react-native";

const NameAdditionPage = () => {
  const params = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: params.group_name,
        }}
      />
      <Text> To add name addition functionality here.</Text>
      {/* Add your preference selection UI components here */}
    </View>
  );
};

export default NameAdditionPage;
