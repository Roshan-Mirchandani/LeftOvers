import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  Linking,
  ScrollView,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

function RecipeDetails({ route }) {
  const { recipe } = route.params;

  const openLink = (url) => {
    Linking.openURL(url);
  };
  useEffect(() => {
    console.log(recipe.ingredients);
  }, []);
  return (
    <ScrollView style={styles.wholeContainer}>
      <View>
        <TouchableOpacity>
          <Text>Back button</Text>
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
      <View>
        <Text style={styles.titleText}>{recipe.label}</Text>
      </View>
      <Text></Text>
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
});

export default RecipeDetails;

/* <Button title="Go Back" onPress={() => navigation.goBack()} /> */
