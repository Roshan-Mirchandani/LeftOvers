import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

function RecipeDetails({ route }) {
  const { recipe } = route.params;
  console.log("r", recipe.url);
  return (
    <SafeAreaView style={styles.wholeContainer}>
      <View>
        <TouchableOpacity>
          <Text>Back button</Text>
        </TouchableOpacity>
        <Text>{recipe.label}</Text>
      </View>
      <View>
        <Image source={{ uri: recipe.image }} style={styles.images} />
      </View>
      <View>
        <Text> Calories : {Math.round(recipe.calories)}</Text>
      </View>
      <View>
        <Text> Servings : {recipe.yield}</Text>
      </View>
      <View>
        <Text>
          Carbs : {Math.round(recipe.totalNutrients.CHOCDF.quantity * 10) / 10}g
        </Text>
      </View>
      <View>
        <Text>
          {" "}
          Protein :{" "}
          {Math.round(recipe.totalNutrients.PROCNT.quantity * 10) / 10}g
        </Text>
      </View>
      <View>
        <Text>
          {" "}
          Fat : {Math.round(recipe.totalNutrients.FAT.quantity * 10) / 10}g
        </Text>
      </View>
      <View>
        <Text>{recipe.ingredientLines}</Text>
      </View>
      <View>
        <Text>instructions : {recipe.url}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wholeContainer: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
  },
  images: {
    width: 150,
    height: 150,
  },
});

export default RecipeDetails;

/* <Button title="Go Back" onPress={() => navigation.goBack()} /> */
