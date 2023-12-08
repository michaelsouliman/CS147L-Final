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
import { Icon } from "react-native-elements";
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
  const [curRest, setCurRest] = useState(null);
  const [foundMatch, setFoundMatch] = useState(false);

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
        rating: restaurant.rating,
        review_count: restaurant.review_count,
        categories: restaurant.categories
          .map((category) => category.title)
          .join(", "),
        coordinates: restaurant.coordinates,
        image_url: restaurant.image_url,
        price: restaurant.price,
      }));
      setRestList(formatted);
      setCurRest(0);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleFoundMatch = (payload) => {
    if (!payload.new.found_all_liked) {
      return;
    }
    setFoundMatch(payload.new.found_all_liked);
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
    if (foundMatch) {
      router.replace({
        pathname: "/FinalSelectionPage",
        params: {
          group_code: params.group_code,
          latitude: params.latitude,
          longitude: params.longitude,
        },
      });
    }
  }, [foundMatch]);

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
        handleFoundMatch
      )
      .subscribe();
  }, []);

  useEffect(() => {
    if (curRest >= 0 && restList[curRest] != undefined) {
      setDisplayed(
        <View style={styles.container}>
          <View style={styles.restaurantInfoContainer}>
            <View style={styles.restaurantNameContainer}>
              <Text style={styles.restaurantName}>
                {restList[curRest].name}
              </Text>
            </View>
            <View style={styles.restaurantRatingContainer}>
              <Text style={styles.restaurantRating}>
                {restList[curRest].rating}/5 ({restList[curRest].review_count})
                {"    "}
                {restList[curRest].price}
              </Text>
            </View>
            <View style={styles.restaurantCategoriesContainer}>
              <Text style={styles.restaurantCategories}>
                {restList[curRest].categories}
              </Text>
            </View>
            <View style={styles.restaurantDistanceContainer}>
              <Text style={styles.restaurantDistance}>
                {distance(
                  params.latitude,
                  params.longitude,
                  restList[curRest].coordinates.latitude,
                  restList[curRest].coordinates.longitude,
                  "K"
                ).toFixed(1)}{" "}
                kilometers away
              </Text>
            </View>
            <View style={styles.restaurantAddressContainer}>
              <Text style={styles.restaurantAddress}>
                {restList[curRest].address}
              </Text>
            </View>
            <View style={styles.restaurantImageContainer}>
              <Image
                style={styles.restaurantImage}
                source={{ uri: restList[curRest].image_url }}
              />
            </View>
          </View>
          <View style={styles.userInputButtons}>
            <View style={styles.userLikeButton}>
              <Pressable
                onPress={handleUserLike}
                style={styles.buttonPressable}
              >
                <Icon style={styles.buttonIcon} size={90} name="check" />
              </Pressable>
            </View>
            <View style={styles.userDislikeButton}>
              <Pressable
                onPress={handleUserDislike}
                style={styles.buttonPressable}
              >
                <Icon style={styles.buttonIcon} size={90} name="close" />
              </Pressable>
            </View>
          </View>
        </View>
      );
    }
  }, [curRest]);

  const handleUserLike = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .textSearch("group_code", params.group_code);

      if (error) {
        throw error;
      }

      const user_info = data[0].group_members[params.id];
      user_info.liked.push(restList[curRest].id);

      let updatedMembers = data[0].group_members;
      updatedMembers.splice(params.id, 1, user_info);

      const { error: updateError } = await supabase
        .from("groups")
        .update({ group_members: updatedMembers })
        .textSearch("group_code", params.group_code);

      if (updateError) {
        throw updateError;
      }

      console.log("Added user preference!");
      setCurRest(curRest + 1);
    } catch (error) {
      console.error("Error: " + error.message);
    }
  };

  const handleUserDislike = () => {
    setCurRest(curRest + 1);
  };
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
});
