import { Image, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import InventoryManager from "./InventoryManager";
import SettingsFavoritesNavigator from "./SettingsFavoritesNavigator";
import RecipePageNavigator from "./RecipePageNavigator";

const Tab = createBottomTabNavigator();

function Buttons({ loggedInUserID, logOutUser }) {
  return (
    <View style={styles.button_container}>
      <Tab.Navigator
        tabBarHideOnKeyboard={true}
        initialRouteName="Inventory Manager"
        screenOptions={({ route }) => ({
          tabBarInactiveBackgroundColor: "#709976",
          tabBarActiveBackgroundColor: "#445f48",
          tabBarActiveTintColor: "#F9EDDD",
          tabBarInactiveTintColor: "#F9EDDD",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Recipe Page Navigator") {
              iconName = focused
                ? require("../assets/icons/loupe.png")
                : require("../assets/icons/loupe.png");
            }
            if (route.name === "Inventory Manager") {
              iconName = focused
                ? require("../assets/icons/fridge.png")
                : require("../assets/icons/fridge.png");
            }
            if (route.name === "Settings") {
              iconName = focused
                ? require("../assets/icons/settings.png")
                : require("../assets/icons/settings.png");
            }
            return <Image source={iconName} style={styles.icon} />;
          },
        })}
      >
        <Tab.Screen
          name="Recipe Page Navigator"
          component={RecipePageNavigator}
          options={{ headerShown: false }}
          initialParams={{ loggedInUserID: loggedInUserID }}
        />

        <Tab.Screen
          name="Inventory Manager"
          component={InventoryManager}
          options={{ headerShown: false }}
          initialParams={{ loggedInUserID: loggedInUserID }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsFavoritesNavigator}
          options={{ headerShown: false }}
          initialParams={{
            loggedInUserID: loggedInUserID,
            logOutUser: logOutUser,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  button_container: {
    flex: 1,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default Buttons;
