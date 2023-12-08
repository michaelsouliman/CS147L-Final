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
          <View style={styles.header}>
            <Text style={styles.headerText}>Here's Your Match!</Text>
          </View>
          <View style={styles.restaurantInfoContainer}>
            <View style={styles.restaurantNameContainer}>
              <Text style={styles.restaurantName}>{restaurantInfo.name}</Text>
            </View>
            <View style={styles.restaurantRatingContainer}>
              <Text style={styles.restaurantRating}>
                {restaurantInfo.rating}/5 ({restaurantInfo.review_count})
                {"    "}
                {restaurantInfo.price}
              </Text>
            </View>
            <View style={styles.restaurantCategoriesContainer}>
              <Text style={styles.restaurantCategories}>
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
            <View style={styles.restaurantAddressContainer}>
              <Text style={styles.restaurantAddress}>
                {restaurantInfo.address}
              </Text>
            </View>
            <View style={styles.restaurantImageContainer}>
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
    width: "100%",
  },
  restaurantInfoContainer: {
    margin: 10,
    top: 20,
    backgroundColor: "#508991",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.65,
    borderRadius: 20,
    padding: 10,
    flexDirection: "column",
  },
  restaurantNameContainer: {
    flex: 2.8,
    left: 10,
  },
  restaurantName: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  restaurantRatingContainer: {
    flex: 0.6,
    bottom: 2,
    left: 10,
  },
  restaurantCategoriesContainer: {
    flex: 1.2,
    bottom: 2,
    left: 10,
  },
  restaurantDistanceContainer: {
    flex: 0.6,
    bottom: 2,
    left: 10,
  },
  restaurantAddressContainer: {
    flex: 0.6,
    bottom: 2,
    left: 10,
  },
  restaurantRating: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  restaurantCategories: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    width: "80%",
    flexWrap: "wrap",
  },
  restaurantDistance: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  restaurantAddress: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  restaurantImageContainer: {
    width: "100%",
    height: "50%",
    flex: 6,
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
    padding: 10,
  },
  restaurantImage: {
    width: "90%",
    height: "100%",
  },
  restaurantImageContainer: {
    width: "100%",
    height: "50%",
    flex: 6,
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
    padding: 10,
  },
  restaurantImage: {
    width: "90%",
    height: "100%",
  },
  header: {
    height: "10%",
    width: "100%",
    backgroundColor: "#508991",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    width: "90%",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
