import React from "react";
import { Image, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import InventoryManager from "./InventoryManager";
import RecipeGenerator from "./RecipeGenerator";
import Settings from "./Settings";

const Tab = createBottomTabNavigator();

function Buttons(props) {
  return (
    <View style={styles.button_container}>
      <Tab.Navigator initialRouteName="Inventory Manager">
        <Tab.Screen
          name="Recipe Generator"
          component={RecipeGenerator}
          options={{ headerShown: false }}
        />

        <Tab.Screen
          name="Inventory Manager"
          component={InventoryManager}
          options={{ headerShown: false }}
        />

        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  testing: {
    justifyContent: "center",
  },
  button_container: {
    flex: 1,
  },
});

export default Buttons;

/*<Tab.Navigator>
        <Tab.Screen component={RecipeGenerator}>
          <TouchableOpacity style={styles.button}>
            <Image
              source={require("../assets/icons/search.png")}
              style={styles.image}
            />
          </TouchableOpacity>
        </Tab.Screen>

        <Tab.Screen component={InventoryManager}>
          <TouchableOpacity
            style={styles.button}
            onPress={console.log("Inventory")}
          >
            <Text>Invent</Text>
          </TouchableOpacity>
        </Tab.Screen>

        <Tab.Screen component={Settings}>
          <TouchableOpacity style={styles.button}>
            <Text>Settings</Text>
          </TouchableOpacity>
        </Tab.Screen>
      </Tab.Navigator> */

/*
      this was the og button css before i switched to navigation bottom tab

  },

  button: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "red",
    borderLeftWidth: 3,
  },

  image: {
    width: 40,
    height: 40,
  },
      */
