import React from "react";
import { Button, View, Text } from "react-native";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { Link } from "expo-router";

const supabase = createClient(
  "https://xndmxditrxwspvqrbbfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZG14ZGl0cnh3c3B2cXJiYmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0Mzk1MTQsImV4cCI6MjAxNzAxNTUxNH0.WiRJfOr5mGG1TQLkmjVWBpPRxQZYLs6dfntaUIkEw1w"
);

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Link
        href={{
          pathname: "/CreateGroupScreen",
          params: {
            title: "Create Group",
          },
        }}
        asChild
      >
        <Text>Create a New Session</Text>
      </Link>
      <Link
        href={{
          pathname: "/JoinSessionScreen",
          params: {
            title: "Join Session",
          },
        }}
        asChild
      >
        <Text>Join an Existing Session</Text>
      </Link>
    </View>
  );
}

export { supabase };
