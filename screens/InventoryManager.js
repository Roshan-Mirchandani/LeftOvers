import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";

const Tab = createMaterialTopTabNavigator();
import HomeList from "./HomeList";
import ShoppingList from "./ShoppingList";

function InventoryManager(props) {
  return (
    <SafeAreaView style={styles.wholeContainer}>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeList} />
        <Tab.Screen name="Shopping" component={ShoppingList} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wholeContainer: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
  },
});
export default InventoryManager;
