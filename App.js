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

import Buttons from "./screens/Buttons";

export default function App() {
  return (
    <NavigationContainer>
      <Buttons />
    </NavigationContainer>
  );
}
