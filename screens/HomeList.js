import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();

const sampleFoodData = [
  {
    id: 1,
    name: "Apple",
    quantity: 5,
    expiryDate: "2024-02-28",
  },
  {
    id: 2,
    name: "Banana",
    quantity: 3,
    expiryDate: "2024-02-25",
  },
  {
    id: 3,
    name: "Milk",
    quantity: 1,
    expiryDate: "2024-03-05",
  },
  // Add more food items as needed
];

const renderBasicList = (data) => {
  return data.map((item) => (
    <Text key={data.id}>
      {item.name} : {item.expiryDate}
    </Text>
  ));
};
function HomeList(props) {
  return (
    <SafeAreaView style={styles.wholeContainer}>
      <View style={styles.listContainer}>
        {renderBasicList(sampleFoodData)}
      </View>
      <View style={styles.navBar}>
        <TouchableOpacity>
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wholeContainer: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 30,
    paddingBottom: -10,
    flex: 1,
    borderColor: "pink",
    borderWidth: 2,
  },
  listContainer: {
    borderColor: "red",
    borderWidth: 2,
    flex: 12,
    margin: 20,
  },
});
export default HomeList;
