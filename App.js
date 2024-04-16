import { React } from "react";
import { NavigationContainer } from "@react-navigation/native";
import WelcomePage from "./screens/WelcomePage";

export default function App() {
  return (
    <NavigationContainer>
      <WelcomePage />
    </NavigationContainer>
  );
}
