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

  const fetchRestaurants = async (latitude, longitude, radius, apiKey) => {
    const url = "https://api.yelp.com/v3/businesses/search";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
    const fetchURL = `?latitude=${latitude}&longitude=${longitude}&radius=${radius}&categories=restaurants&limit=50`;

    try {
      const response = await fetch(`${url}${fetchURL}`, { headers });
      const data = await response.json();

      const formatted = data.businesses.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.location.address1,
        phone: restaurant.phone,
        rating: restaurant.rating,
        review_count: restaurant.review_count,
        categories: restaurant.categories
          .map((category) => category.title)
          .join(", "),
        coordinates: restaurant.coordinates,
        image_url: restaurant.image_url,
      }));
      setRestList(formatted);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const uploadRestuarants = async () => {
    try {
      const { error: updateError } = await supabase
        .from("groups")
        .update({ rest: restList })
        .textSearch("group_code", params.group_code);

      if (updateError) {
        throw updateError;
      }

      console.log("Successfully uploaded restaurants!");
    } catch (error) {
      console.log("Error: " + error.message);
    }
  };

  const apiKey =
    "TKzqI3YDF2Mbk7TnHPhuCiSST4s3TxbFQWAY-Nx2erwoan6oRYQ2far1PKVLuW5OabF_9zxe2D6fqnXVV-aBlchZQjwUngt9MQVJpHuu5JCJ1rwE_v3p8Jzo0IqHYXYx";
  const latitude = params.latitude;
  const longitude = params.longitude;
  const radius = params.radius;

  if (restList.length == 0) {
    fetchRestaurants(latitude, longitude, radius, apiKey);
  }

  useEffect(() => {
    if (restList.length > 0) {
      setDisplayed(<Text> new rest data </Text>);
      uploadRestuarants();
    }
  }, [restList]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {displayed}
    </View>
  );
}
