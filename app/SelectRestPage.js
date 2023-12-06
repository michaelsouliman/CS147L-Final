import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button, Dimensions } from "react-native";
import { supabase } from "./index";

// Pulled from https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

export default function SelectRestPage() {
  const params = useLocalSearchParams();
  const [restList, setRestList] = useState([]);
  const [displayed, setDisplayed] = useState(
    <Text> Fetching Yelp Restaurants...</Text>
  );

  const handleRestUploaded = (payload) => {
    setRestList(payload.new.rest);
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
          filter: "group_code=eq." + params.group_code,
        },
        handleRestUploaded
      )
      .subscribe();
  }, []);

  useEffect(() => {
    if (restList != null && restList.length > 0) {
      setDisplayed(<Text> got rest data from backend</Text>);
    }
  }, [restList]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {displayed}
    </View>
  );
}
