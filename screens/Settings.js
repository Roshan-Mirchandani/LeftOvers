import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import db from "./database.js";
import "firebase/firestore";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";

function Settings({ route, navigation }) {
  //userID
  const loggedInUserID = route.params.loggedInUserID;

  //user data
  const [userData, setUserData] = useState(null);
  //saved recipe arrays
  const [favRecipes, setFavRecipes] = useState([]);
  //editing profile
  const [editing, setEditing] = useState(false);

  //user fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [reminderTime, setReminderTime] = useState(null);

  const [updating, setUpdating] = useState(true); // switching between true and false for useEffect hook,doesnt mean anything
  const goToRecipeDetails = (item) => {
    console.log("item", item);
    navigation.navigate("RecipeDetails", { recipe: item.recipe });
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
  }, [updating]);

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
    route.params.logOutUser(false);
  };

  const updateDetails = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      let updatedValues = {};
      if (firstName != "") {
        updatedValues.firstName = firstName;
      } else {
        updatedValues.firstName = userData[0].firstName;
      }
      if (lastName != "") {
        updatedValues.lastName = lastName;
      } else {
        updatedValues.lastName = userData[0].lastName;
      }
      if (email != "") {
        updatedValues.email = email;
      } else {
        updatedValues.email = userData[0].email;
      }
      if (reminderTime != null) {
        updatedValues.ReminderTime = reminderTime;
      } else {
        updatedValues.ReminderTime = parseInt(userData[0].ReminderTime);
      }
      updatedValues.password = userData[0].password;
      //update the view in settings
      await setDoc(udr, updatedValues);
      setUpdating(!updating);
    } catch (error) {
      console.log("Error in changing profile info:", error);
    }
    setEditing(false);
  };

  const renderRecipeInfo = ({ item }) => {
    //console.log("item:", item);

    return (
      <View style={styles.box1}>
        <TouchableOpacity onPress={() => goToRecipeDetails(item)}>
          <Image source={{ uri: item.recipe.image }} style={styles.images} />
        </TouchableOpacity>
        <Text style={styles.boxText}>{item.recipe.label}</Text>
      </View>
    );
  };

  //if a new recipe is added to favorites
  const updateRecipes = () => {
    fetchRecipes();
  };

  return (
    <View style={styles.wholeContainer}>
      <View style={styles.profileContainer}>
        {userData != null ? (
          <View>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={[styles.profileText, { alignSelf: "flex-end" }]}>
                {editing == false ? "Edit" : "Cancel"}
              </Text>
            </TouchableOpacity>
            {editing == false ? (
              <View>
                <Text style={styles.profileText}>
                  First Name :{userData[0].firstName}
                </Text>
                <Text style={styles.profileText}>
                  Last Name :{userData[0].lastName}
                </Text>
                <Text style={styles.profileText}>
                  Email :{userData[0].email}
                </Text>
                <Text style={styles.profileText}>
                  Reminder Margin (days) :{userData[0].ReminderTime}
                </Text>
                <Text></Text>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: "row", paddingBottom: 3 }}>
                  <Text style={styles.profileText}>First Name :</Text>

                  <TextInput
                    placeholder={userData[0].firstName}
                    onChangeText={setFirstName}
                    value={firstName}
                    style={styles.profileTextInput}
                  ></TextInput>
                </View>
                <View style={{ flexDirection: "row", paddingVertical: 3 }}>
                  <Text style={styles.profileText}>Last Name :</Text>
                  <TextInput
                    placeholder={userData[0].lastName}
                    onChangeText={setLastName}
                    value={lastName}
                    style={styles.profileTextInput}
                  ></TextInput>
                </View>
                <View style={{ flexDirection: "row", paddingTop: 3 }}>
                  <Text style={styles.profileText}>Email :</Text>
                  <TextInput
                    placeholder={userData[0].email}
                    onChangeText={setEmail}
                    value={email}
                    style={styles.profileTextInput}
                  ></TextInput>
                </View>
                <View style={{ flexDirection: "row", paddingTop: 3 }}>
                  <Text style={styles.profileText}>
                    Reminder Margin (days):
                  </Text>
                  <TextInput
                    placeholder={userData[0].ReminderTime.toString()}
                    onChangeText={setReminderTime}
                    value={reminderTime}
                    style={styles.profileTextInput}
                  ></TextInput>
                </View>
                <Text></Text>
              </View>
            )}
          </View>
        ) : null}
        {editing == false ? (
          <View>
            <TouchableOpacity
              onPress={() => {
                logOut();
              }}
            >
              <Text style={styles.profileButton}>Log out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TouchableOpacity onPress={() => updateDetails()}>
              <Text style={styles.profileButton}>Update</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text></Text>
      <View style={styles.recipeContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.recipeTitle}>Favorited Recipes</Text>
          <TouchableOpacity onPress={() => updateRecipes()}>
            <Text style={[styles.profileButton]}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row" }}>
          {favRecipes.length !== 0 ? (
            <FlatList
              data={favRecipes}
              renderItem={renderRecipeInfo}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyFavRecipes}>
              <Text style={styles.emptyFavRecipesText}>
                You have no favorited recipes!
              </Text>
              <Text style={styles.emptyFavRecipesText}>
                Go to Recipe Page to find some
              </Text>
            </View>
          )}
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
    height: 300,
    borderRadius: 10,
    margin: "2%",
    padding: "2%",
    paddingTop: "4%",
    borderColor: "#445F48",
    borderWidth: 2,
  },
  profileText: {
    color: "#F6E3CB",
    fontSize: 20,
  },
  profileTextInput: {
    color: "#F6E3CB",
    fontSize: 20,
    borderRadius: 10,
    borderColor: "#F6E3CB",
    borderWidth: 2,
    padding: 2,
    paddingHorizontal: 5,
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
  emptyFavRecipes: {
    backgroundColor: "#445F48",
    borderRadius: 10,
    justifyContent: "center",
    alignContent: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyFavRecipesText: {
    fontSize: 20,
    color: "#F6E3CB",
  },
});
export default Settings;
