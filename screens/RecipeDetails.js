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
} from "firebase/firestore";
function RecipeDetails({ route }) {
  const { recipe } = route.params;
  const navigation = useNavigation();
  const loggedInUserID = route.params.loggedInUserID;

  const [saved, setSaved] = useState(false);

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
        console.log(querySnapshot.ref);
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
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Text>Average Rating: 4.6/5</Text>
        <Text>4 ratings</Text>
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
          <Text style={styles.link}>instructions : {recipe.url}</Text>
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
    padding: 4,
  },
  backButton: {
    fontSize: 35,
    Color: "#445F48",
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
