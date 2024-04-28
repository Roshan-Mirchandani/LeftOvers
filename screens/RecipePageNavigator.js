import { createStackNavigator } from "@react-navigation/stack";
import RecipeList from "./RecipeList";
import RecipeDetails from "./RecipeDetails";

const Stack = createStackNavigator();
function RecipePageNavigator(route) {
  const loggedInUserID = route.route.params.loggedInUserID;

  return (
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
        initialParams={{ loggedInUserID: loggedInUserID }}
      />
    </Stack.Navigator>
  );
}

export default RecipePageNavigator;
