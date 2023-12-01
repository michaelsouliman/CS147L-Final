import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreateGroupScreen from "./CreateGroupScreen";
import JoinSessionScreen from "./JoinSessionScreen";
import NameAdditionPage from "./NameAdditionPage";
import { Button, View } from "react-native";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import NameAdditionPage from "./NameAdditionPage";

const Stack = createNativeStackNavigator();

const supabase = createClient(
  "https://xndmxditrxwspvqrbbfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZG14ZGl0cnh3c3B2cXJiYmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0Mzk1MTQsImV4cCI6MjAxNzAxNTUxNH0.WiRJfOr5mGG1TQLkmjVWBpPRxQZYLs6dfntaUIkEw1w"
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Group Session" }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={{ title: "Create a Group" }}
        />
        <Stack.Screen
          name="JoinSession"
          component={JoinSessionScreen}
          options={{ title: "Join a Session" }}
        />
        <Stack.Screen
          name="NameAdditionPage"
          component={NameAdditionPage}
          options={{ title: "Add Your Profile" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Create a New Group"
        onPress={() => navigation.navigate("CreateGroup")}
      />
      <Button
        title="Join an Existing Session"
        onPress={() => navigation.navigate("JoinSession")}
      />
    </View>
  );
};

export { supabase };
export default App;
