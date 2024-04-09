import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import db from "./database.js";
import "firebase/firestore";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

function Settings({ route, navigation }) {
  //userID
  const loggedInUserID = route.params.loggedInUserID;

  //user data
  const [userData, setUserData] = useState(null);
  //saved recipe arrays
  const [favRecipes, setFavRecipes] = useState([]);

  const goToRecipeDetails = (item) => {
    console.log(route.params);
    navigation.jumpTo("RecipeDetails"); // fix this shit
  };

  const fetchData = async () => {
    let user_data = [];
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const data = await getDoc(udr);

      user_data.push({ id: loggedInUserID, ...data.data() });
      setUserData(user_data);
    } catch (error) {
      console.log("Error getting user info:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adjustUri = (uri) => {
    uri = uri.replace("://", "%3A%2F%2F");
    uri = uri.replace("/", "%2F");
    uri = uri.replace("#", "%23");
    return uri;
  };

  const fetchRecipes = async () => {
    const recipes = [];
    const apiKey = "ace5596b42954a08f5296bb23f3d4ca9";
    const apiAppID = "903207ca";
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const ufrc = collection(udr, "FavoriteRecipes");
      const querySnapshot = await getDocs(ufrc);
      for (const doc of querySnapshot.docs) {
        let uri = doc.data().uri;
        uri = adjustUri(uri);
        const response = await fetch(
          `https://api.edamam.com/api/recipes/v2/by-uri?type=public&uri=${uri}&app_id=${apiAppID}&app_key=${apiKey}`
        );
        const data = await response.json();
        recipes.push(...data.hits);
      }
      setFavRecipes(recipes);
    } catch (error) {
      console.log("Error in fetching recipes:", error);
    }
  };
  useEffect(() => {
    fetchRecipes();
  }, []);
  const logOut = () => {
    route.route.params.logOutUser(false);
  };

  const renderRecipeInfo = ({ item }) => {
    return (
      <View style={styles.box1}>
        <TouchableOpacity onPress={() => goToRecipeDetails(item)}>
          <Image source={{ uri: item.recipe.image }} style={styles.images} />
        </TouchableOpacity>
        <Text style={styles.boxText}>{item.recipe.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.wholeContainer}>
      <View style={styles.profileContainer}>
        {userData != null ? (
          <View>
            <Text style={styles.profileText}>
              First Name :{userData[0].firstName}
            </Text>
            <Text style={styles.profileText}>
              Last Name :{userData[0].lastName}
            </Text>
            <Text style={styles.profileText}>Email :{userData[0].email}</Text>
            <Text></Text>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            logOut();
          }}
        >
          <Text style={styles.profileButton}>Log out</Text>
        </TouchableOpacity>
      </View>
      <Text></Text>
      <View style={styles.recipeContainer}>
        <Text style={styles.recipeTitle}>Favorited Recipes</Text>
        <View style={{ flexDirection: "row" }}>
          <FlatList
            data={favRecipes}
            renderItem={renderRecipeInfo}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    backgroundColor: "#F5E2C8",
  },
  profileContainer: {
    backgroundColor: "#709976",
    height: "35%",
    borderRadius: 10,
    margin: "2%",
    padding: "2%",
    paddingTop: "10%",
    borderColor: "#445F48",
    borderWidth: 2,
  },
  profileText: {
    color: "#F6E3CB",
    fontSize: 20,
  },
  profileButton: {
    borderRadius: 10,
    backgroundColor: "#445F48",
    color: "#F6E3CB",
    padding: 8,
    fontSize: 20,
    alignSelf: "center",
  },
  recipeContainer: {
    height: "50%",
    borderColor: "#445F48",
    borderWidth: 2,
    borderRadius: 10,
    margin: "2%",
    padding: "2%",
  },
  recipeTitle: {
    fontSize: 25,
    color: "#445F48",
    marginBottom: 30,
  },
  box1: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: "#445F48",
    borderRadius: 10,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#729B79",
  },
  boxText: {
    color: "#F5E2C8",
    fontSize: 14,
  },
  images: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderColor: "#F5E2C8",
    borderWidth: 3,
  },
});
export default Settings;
