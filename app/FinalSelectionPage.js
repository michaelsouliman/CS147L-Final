// This page will show the final selection that all members in the session have
// said yes to.
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
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
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [displayed, setDisplayed] = useState(<Text> Fetching Match...</Text>);

  const fetchRestaurantInfo = async (id, apiKey) => {
    const url = "https://api.yelp.com/v3/businesses/" + id;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    try {
      const response = await fetch(`${url}`, { headers });
      const data = await response.json();
      console.log(data);

      const formatted = {
        name: data.name,
        address: data.location.address1,
        rating: data.rating,
        review_count: data.review_count,
        categories: data.categories
          .map((category) => category.title)
          .join(", "),
        coordinates: data.coordinates,
        image_url: data.image_url,
        price: data.price,
      };
      console.log(formatted);
      setRestaurantInfo(formatted);
    } catch (error) {
      console.error("Error fetching restaurant info:", error);
    }
  };

  const apiKey =
    "TKzqI3YDF2Mbk7TnHPhuCiSST4s3TxbFQWAY-Nx2erwoan6oRYQ2far1PKVLuW5OabF_9zxe2D6fqnXVV-aBlchZQjwUngt9MQVJpHuu5JCJ1rwE_v3p8Jzo0IqHYXYx";

  useEffect(() => {
    if (restaurantInfo !== null && restaurantInfo !== undefined) {
      setDisplayed(
        <View style={styles.container}>
          <View style={styles.restaurantInfoContainer}>
            <View style={styles.restaurantNameContainer}>
              <Text style={styles.restaurantName}>{restaurantInfo.name}</Text>
            </View>
            <View style={styles.restaurantRatingContainer}>
              <Text style={styles.restaurantRating}>
                {restaurantInfo.rating}/5 ({restaurantInfo.review_count})
              </Text>
            </View>
            <View style={styles.restaurantCategoriesContainer}>
              <Text style={styles.restaurantRating}>
                {restaurantInfo.categories}
              </Text>
            </View>
            <View style={styles.restaurantDistanceContainer}>
              <Text style={styles.restaurantDistance}>
                {distance(
                  params.latitude,
                  params.longitude,
                  restaurantInfo.coordinates.latitude,
                  restaurantInfo.coordinates.longitude,
                  "K"
                ).toFixed(1)}{" "}
                kilometers away
              </Text>
            </View>
            <View style={styles.restaurantDistanceContainer}>
              <Text style={styles.restaurantDistance}>
                {restaurantInfo.address}
              </Text>
            </View>
            <View style={styles.restaurantDistanceContainer}>
              <Image
                style={styles.restaurantImage}
                source={{ uri: restaurantInfo.image_url }}
              />
            </View>
          </View>
        </View>
      );
    }
  }, [restaurantInfo]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await supabase
        .from("groups")
        .select("*")
        .textSearch("group_code", params.group_code);

      let id = response.data[0].all_liked;
      console.log(id);
      fetchRestaurantInfo(id, apiKey);
    };
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {displayed}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#74a1b5",
  },
  restaurantInfoContainer: {
    margin: 10,
    top: 20,
    backgroundColor: "orange",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.65,
    borderRadius: 20,
    padding: 5,
  },
  userInputButtons: {
    top: 20,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  userLikeButton: {
    backgroundColor: "green",
    width: "40%",
    right: 10,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  userDislikeButton: {
    backgroundColor: "red",
    width: "40%",
    left: 10,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    width: "70%",
    aspectRatio: 1,
  },
  restaurantImage: {
    width: "100%",
    height: "70%",
  },
});
