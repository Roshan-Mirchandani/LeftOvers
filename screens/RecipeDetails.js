import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import "firebase/firestore";
import db from "./database.js";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

function RecipeDetails({ route }) {
  const { recipe } = route.params;
  const navigation = useNavigation();
  const loggedInUserID = route.params.loggedInUserID;

  const [saved, setSaved] = useState(false);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [allUserRatingInfo, setAllUserRatingInfo] = useState(null);
  const [currentUserAlreadyRated, setCurrentUserAlreadyRated] = useState(false);
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false); //used as a switch

  //stars state
  const [newStarNumber, setNewStarNumber] = useState(null); // for first time ratings
  const [starNumber, setStarNumber] = useState(null); // for already rated stars
  const [fullStarNumber, setFullStarNumber] = useState(null);
  const [emptyStarNumber, setEmptyStarNumber] = useState(null);

  const saveRecipe = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const ufrc = collection(udr, "FavoriteRecipes");
      if (saved == false) {
        await addDoc(ufrc, {
          Name: recipe.label,
          uri: recipe.uri,
        });
        setSaved(true);
      } else {
        const querySnapshot = await getDocs(
          query(ufrc, where("uri", "==", recipe.uri))
        );
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
        setSaved(false);
      }
    } catch (error) {
      console.log("Error in saving recipe:", error);
    }
  };

  const checkSaved = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const ufrc = collection(udr, "FavoriteRecipes");

      const querySnapshot = await getDocs(
        query(ufrc, where("uri", "==", recipe.uri))
      );

      if (!querySnapshot.empty) {
        setSaved(true);
      }
    } catch (error) {
      console.log("Error in saving recipe:", error);
    }
  };

  useEffect(() => {
    checkSaved();
  }, []);

  const openLink = (url) => {
    Linking.openURL(url);
  };
  //this gets recipe rating info: Averaging rating, total rating, uri
  const fetchRecipeRatings = async () => {
    try {
      const rcr = collection(db, "RatingsAndReviews");
      const q = query(rcr, where("uri", "==", recipe.uri));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setRatingInfo(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.log("Error fetching recipe rating info:", error);
    }
  };
  useEffect(() => {
    fetchRecipeRatings();
  }, [hasBeenUpdated]);

  const recipeRatings = () => {
    let ratingButtons;
    if (currentUserAlreadyRated == false) {
      ratingButtons = Array(5)
        .fill()
        .map((_, index) => (
          <TouchableOpacity
            key={`unclicked_${index}`}
            onPress={() => setNewStarNumber(index + 1)}
          >
            <Image
              source={require("../assets/unclicked_star.png")}
              style={{ height: 25, width: 25 }}
            />
          </TouchableOpacity>
        ));
    } else {
      ratingButtons = [
        ...Array(starNumber)
          .fill()
          .map((_, index2) => (
            <TouchableOpacity
              key={`clicked_${index2}`}
              onPress={() => setFullStarNumber(index2 + 1)}
            >
              <Image
                source={require("../assets/clicked_star.png")}
                style={{ height: 25, width: 25 }}
              />
            </TouchableOpacity>
          )),
        ...Array(5 - starNumber)
          .fill()
          .map((_, index3) => (
            <TouchableOpacity
              key={`unclicked_${index3}`}
              onPress={() => setEmptyStarNumber(index3 + 1)}
            >
              <Image
                source={require("../assets/unclicked_star.png")}
                style={{ height: 25, width: 25 }}
              />
            </TouchableOpacity>
          )),
      ];
    }
    return ratingButtons;
  };
  //this gets the user information on recipes, i.e. who rated what and how much
  const recipeRatingUsersInfo = async () => {
    try {
      const rcr = collection(db, "RatingsAndReviews");
      const q = query(rcr, where("uri", "==", recipe.uri));
      querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const ucr = collection(docRef, "Users");
        const udr = await getDocs(ucr);
        if (!udr.empty) {
          const userData = udr.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAllUserRatingInfo(userData);
        }
      }
    } catch (error) {
      console.log("Error in getting user info on this recipe");
    }
  };

  useEffect(() => {
    recipeRatingUsersInfo();
  }, []);

  const currentUserRated = () => {
    // this runs as soon as the recipeDetails page is opened because of hook above it
    if (allUserRatingInfo != null) {
      for (var i = 0; i < allUserRatingInfo.length; i++) {
        if (allUserRatingInfo[i].id == loggedInUserID) {
          setStarNumber(allUserRatingInfo[i].rating);
          setCurrentUserAlreadyRated(true);
        }
      }
    }
  };

  useEffect(() => {
    currentUserRated();
  }, [allUserRatingInfo]);

  const updateRating = async () => {
    try {
      const rcr = collection(db, "RatingsAndReviews"); //ref to collection
      const q = query(rcr, where("uri", "==", recipe.uri));
      let querySnapshot = await getDocs(q); //gets all docs
      //first case when user hasnt seen recipe and is the first rating
      if (currentUserAlreadyRated == false) {
        setCurrentUserAlreadyRated(true);
        if (querySnapshot.empty) {
          await addDoc(rcr, {
            //adds missing recipe doc
            AverageRating: newStarNumber,
            TotalRatings: 1,
            uri: recipe.uri,
          });
          querySnapshot = await getDocs(q); // then gets that new recipe doc
          const newDocRef = querySnapshot.docs[0].ref; // gets reference to that doc
          const ucr = collection(newDocRef, "Users"); // gets reference to user collection in that doc
          const udr = doc(ucr, loggedInUserID); // makes a new reference that doesnt exist yet with a specific ID
          await setDoc(udr, {
            //and then updates that doc
            rating: newStarNumber,
          });
          //second case will be user hasnt seen it but it is already in the database
        } else {
          const recipeRef = querySnapshot.docs[0].ref; // referencing the recipe doc
          const ucr = collection(recipeRef, "Users"); // referencing the collection in that doc
          const userDocsSnapshot = await getDocs(ucr); //getting collective data of collection
          const userDocs = userDocsSnapshot.docs;
          let ratings = [];
          userDocs.forEach((doc) => {
            ratings.push(doc.data().rating); //adds all ratings to compute average
          });
          ratings.push(newStarNumber);
          const average = averageRating(ratings);
          newUserRef = doc(ucr, loggedInUserID); //add the user doc
          //then update the user doc
          await setDoc(newUserRef, {
            rating: newStarNumber,
          });
          // update the recipe doc
          await setDoc(recipeRef, {
            AverageRating: average,
            TotalRatings: ratings.length,
            uri: recipe.uri,
          });
        }
        setStarNumber(newStarNumber);
        recipeRatings();
        setHasBeenUpdated(!hasBeenUpdated); //to trigger hook for rating info
      } //final case is user changing his rating
      else {
        updatedStarNumber = changeRating();
        setFullStarNumber(null);
        setEmptyStarNumber(null);
        if (updatedStarNumber != null) {
          setStarNumber(updatedStarNumber);
        } // for other methods like recipeRatings()
        const recipeRef = querySnapshot.docs[0].ref; // referencing the recipe doc
        const ucr = collection(recipeRef, "Users"); // referencing the collection in that doc
        const udr = doc(ucr, loggedInUserID);
        await setDoc(udr, {
          //change the doc before getting new average
          rating: updatedStarNumber,
        });
        const userDocsSnapshot = await getDocs(ucr); //getting collective data of collection
        const userDocs = userDocsSnapshot.docs;
        let ratings = [];
        userDocs.forEach((doc) => {
          ratings.push(doc.data().rating); //adds all ratings to compute average
        });
        const average = averageRating(ratings);
        await setDoc(recipeRef, {
          AverageRating: average,
          TotalRatings: ratings.length,
          uri: recipe.uri,
        });
        recipeRatings();
        setHasBeenUpdated(!hasBeenUpdated); //to trigger hook for rating info
      }
    } catch (error) {
      console.log("Error updating this recipes rating:", error);
    }
  };

  useEffect(() => {
    if (
      newStarNumber != null ||
      fullStarNumber != null ||
      emptyStarNumber != null
    ) {
      updateRating();
    }
  }, [newStarNumber, fullStarNumber, emptyStarNumber]);

  const averageRating = (array) => {
    let total = 0;
    for (i = 0; i < array.length; i++) {
      total += array[i];
    }
    average = total / array.length;
    return average;
  };

  const changeRating = () => {
    //used to find the new star rating for an old value
    if (fullStarNumber != null) {
      //if the update has lowered in rating, just set star number to that
      return fullStarNumber;
    } else if (emptyStarNumber != null) {
      //if update has raised in rating, add the empty star to the current number
      return starNumber + emptyStarNumber;
    }
    setFullStarNumber(null);
    setEmptyStarNumber(null);
  };
  return (
    <ScrollView style={styles.wholeContainer}>
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>⇦</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#445F48",
        }}
      >
        <Image source={{ uri: recipe.image }} style={styles.images} />
      </View>
      <Text></Text>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <View style={{ flex: 5 }}>
          <Text style={styles.titleText}>{recipe.label}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => saveRecipe(recipe.uri)}>
            {saved ? (
              <Text style={styles.savingRecipeButton}>✔</Text>
            ) : (
              <Text style={styles.savingRecipeButton}>+</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Text></Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {recipeRatings()}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Text style={styles.quickInfoText}>
          {ratingInfo != null
            ? "Average Rating: " +
              parseFloat(ratingInfo.AverageRating.toFixed(1)) +
              "/5"
            : "No ratings so far"}
        </Text>
        <Text style={styles.quickInfoText}>
          {ratingInfo != null ? ratingInfo.TotalRatings : null}
          {ratingInfo != null
            ? ratingInfo.TotalRatings == 1
              ? " rating"
              : " ratings"
            : "Be the first to rate it!"}
        </Text>
      </View>
      <View style={styles.quickInfoContainer}>
        <View style={styles.row}>
          <Text style={styles.quickInfoText}>
            Carbs:{Math.round(recipe.totalNutrients.CHOCDF.quantity * 10) / 10}g
            <Text style={styles.quickInfoText}> |</Text>
          </Text>
          <Text style={styles.quickInfoText}>
            Protein:
            {Math.round(recipe.totalNutrients.PROCNT.quantity * 10) / 10}g
          </Text>
          <Text style={styles.quickInfoText}>|</Text>
          <Text style={styles.quickInfoText}>
            Fat: {Math.round(recipe.totalNutrients.FAT.quantity * 10) / 10}g
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.quickInfoText}>
            Calories : {Math.round(recipe.calories)}
          </Text>
          <Text style={styles.quickInfoText}>|</Text>
          <Text style={styles.quickInfoText}> Servings : {recipe.yield}</Text>
        </View>
      </View>
      <Text></Text>
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientTitle}>Ingredient List:</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.ingredientsText}>
            • {ingredient.text}
          </Text>
        ))}
      </View>
      <View>
        <Text></Text>
        <TouchableOpacity onPress={() => openLink(recipe.url)}>
          <Text style={styles.link}>Click here for instructions!</Text>
        </TouchableOpacity>
      </View>
      <Text></Text>
      <Text></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    backgroundColor: "#F5E2C8",
    paddingBottom: 30,
  },
  images: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#445F48",
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#445F48",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  quickInfoContainer: {
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#445F48",
    padding: 10,
    backgroundColor: "#F9EDDD",
  },
  quickInfoText: {
    fontSize: 16,
    color: "#445F48",
  },
  ingredientTitle: {
    fontSize: 18,
    color: "#445F48",
    fontWeight: "bold",
  },
  ingredientsContainer: {
    paddingLeft: 10,
  },
  ingredientsText: {
    fontSize: 16,
  },
  link: {
    backgroundColor: "#445F48",
    borderRadius: 10,
    color: "#F5E2C8",
    fontSize: 17,
    padding: 5,
    textAlign: "center",
    width: "90%",
    alignSelf: "center",
  },
  backButton: {
    fontSize: 35,
    paddingLeft: 10,
  },
  savingRecipeButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#445F48",
    height: 40,
    width: 40,
    fontSize: 30,
    textAlign: "center",
  },
});

export default RecipeDetails;
