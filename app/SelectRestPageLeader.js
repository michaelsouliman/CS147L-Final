import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Dimensions,
  Pressable,
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
      console.error("Error: " + error.message);
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
    const waitForUpload = async () => {
      if (restList !== null && restList.length > 0) {
        await uploadRestuarants();
        setCurRest(0);
      }
    };
    waitForUpload();
  }, [restList]);

  useEffect(() => {
    if (foundMatch) {
      router.replace({
        pathname: "/FinalSelectionPage",
        params: {
          group_code: params.group_code,
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
            <Text>{restList[curRest].id}</Text>
          </View>
          <View style={styles.userInputButtons}>
            <View style={styles.userLikeButton}>
              <Pressable
                onPress={handleUserLike}
                style={styles.buttonPressable}
              >
                <Text style={styles.buttonText}>Like</Text>
              </Pressable>
            </View>
            <View style={styles.userDislikeButton}>
              <Pressable
                onPress={handleUserDislike}
                style={styles.buttonPressable}
              >
                <Text style={styles.buttonText}> Dislike</Text>
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
  },
  restaurantInfoContainer: {
    margin: 10,
    backgroundColor: "orange",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
  userInputButtons: {
    margin: 10,
    backgroundColor: "orange",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.2,
    flexDirection: "row",
  },
  userLikeButton: {
    backgroundColor: "green",
    width: "40%",
  },
  userDislikeButton: { backgroundColor: "red", width: "40%" },
  buttonText: {},
  buttonPressable: {
    width: "100%",
    height: "100%",
  },
});
