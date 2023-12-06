// Page that displays restaurant information and allows users to
// say 'yes' or 'no' to them. To ensure that we are updating the correct
// user preferences, we need to pass in the group_code and the current member
// for that group_code. For each 'user' object, we'll keep 2 arrays, one for the
// positive choices and one for the negative choices.

import { useLocalSearchParams, router } from "expo-router";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";

// To display informaion, we are going to use the Yelp API to query restaurants
// from the radius the 'group_leader' set and then format that information.

export default function SelectRestPage() {
  const params = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text> Select Rest Page</Text>
    </View>
  );
}
