import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import RecipeList from "./RecipeList";
import RecipeDetails from "./RecipeDetails";

const Stack = createStackNavigator();
function RecipePageNavigator(props) {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="RecipeList"
          component={RecipeList}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecipeDetails"
          component={RecipeDetails}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RecipePageNavigator;
