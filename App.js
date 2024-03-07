import { React } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import InventoryManager from "./screens/InventoryManager";
import Buttons from "./screens/Buttons";
import RecipeGenerator from "./screens/RecipeGenerator";
import Settings from "./screens/Settings";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Buttons />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  button_container: {
    backgroundColor: "orange",

    bottom: 0,
  },

  full_container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  main_container: {
    flex: 7,
  },
});
