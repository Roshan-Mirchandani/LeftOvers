import React, { useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";

const Tab = createMaterialTopTabNavigator();
import HomeList from "./HomeList";
import ShoppingList from "./ShoppingList";

function InventoryManager(route) {
  const loggedInUserID = route.route.params.loggedInUserID;
  return (
    <SafeAreaView style={styles.wholeContainer}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#709976" },
          tabBarIndicatorStyle: { backgroundColor: "#445f48" },
          tabBarActiveTintColor: "#F9EDDD",
          tabBarInactiveTintColor: "#F9EDDD",
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeList}
          initialParams={{ loggedInUserID: loggedInUserID }}
        />
        <Tab.Screen
          name="Shopping"
          component={ShoppingList}
          initialParams={{ loggedInUserID: loggedInUserID }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
  },
});
export default InventoryManager;
