import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { Link } from "expo-router";

const supabase = createClient(
  "https://xndmxditrxwspvqrbbfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZG14ZGl0cnh3c3B2cXJiYmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0Mzk1MTQsImV4cCI6MjAxNzAxNTUxNH0.WiRJfOr5mGG1TQLkmjVWBpPRxQZYLs6dfntaUIkEw1w"
);

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <Text style={styles.headerText}>We Choose</Text>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Link
            href={{
              pathname: "/CreateGroupScreen",
              params: {
                title: "Create Group",
              },
            }}
            asChild
          >
            <Text style={styles.buttonText}>Create a New Session</Text>
          </Link>
        </View>

        <View style={styles.buttonWrapper}>
          <Link
            href={{
              pathname: "/JoinSessionScreen",
              params: {
                title: "Join Session",
              },
            }}
            asChild
          >
            <Text style={styles.buttonText}>Join an Existing Session</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

export { supabase };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#74a1b5",
    padding: 30,
  },
  headerSpacer: {
    height: "5%",
  },
  header: {
    height: "10%",
    width: "100%",
    backgroundColor: "#508991",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonWrapper: {
    backgroundColor: "#cde0c9",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
    margin: 40,
  },
  buttonText: {
    fontSize: 18,
    color: "#333",
  },
});
