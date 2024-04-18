import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RecipeDetails from "./RecipeDetails";
import Settings from "./Settings";
const Stack = createStackNavigator();

function SettingsFavoritesNavigator(route) {
  const loggedInUserID = route.route.params.loggedInUserID;
  const logOutUser = route.route.params.logOutUser;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
        initialParams={{
          loggedInUserID: loggedInUserID,
          logOutUser: logOutUser,
        }}
      />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetails}
        options={{ headerShown: false }}
        initialParams={{ loggedInUserID: loggedInUserID }}
      />
    </Stack.Navigator>
  );
}

export default SettingsFavoritesNavigator;
