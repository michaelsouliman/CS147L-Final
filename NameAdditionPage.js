import React from "react";
import { View, Text, TextInput } from "react-native";

const NameAdditionPage = (group_name) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        placeholder="Group Code"
        value={groupCode}
        onChangeText={(text) => setGroupCode(text)}
      />
      {/* Add your preference selection UI components here */}
    </View>
  );
};

export default NameAdditionPage;
