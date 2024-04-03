import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import db from "./database.js";
import "firebase/firestore";
import { doc, getDoc, collection } from "firebase/firestore";
function Settings(route) {
  //userID
  const loggedInUserID = route.route.params.loggedInUserID;

  //user data
  const [userData, setUserData] = useState(null);

  const fetchData = async () => {
    let user_data = [];
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const data = await getDoc(udr);

      user_data.push({ id: loggedInUserID, ...data.data() });
      setUserData(user_data);
    } catch (error) {
      console.log("Error getting user info:", error);
    }
  };

  const logOut = () => {
    route.route.params.logOutUser(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.wholeContainer}>
      {userData != null ? (
        <View>
          <Text>First Name :{userData[0].firstName}</Text>
          <Text>Last Name :{userData[0].lastName}</Text>
          <Text>Email :{userData[0].email}</Text>
        </View>
      ) : null}
      <TouchableOpacity
        onPress={() => {
          logOut();
        }}
      >
        <Text>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    backgroundColor: "#F5E2C8",
  },
});
export default Settings;
