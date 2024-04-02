import React from "react";
import {
  Text,
  TextInput,
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import db from "./database.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import Buttons from "./Buttons.js";

function WelcomePage(props) {
  //login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //modals
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  //register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  //messages
  const [alreadyRegisteredMessage, setAlreadyRegisteredMessage] =
    useState(false);
  const [noUserRegisteredMessage, setNoUserRegisteredMessage] = useState(false);
  const [incorrectLoginDetailsMessage, setIncorrectLoginDetailsMessage] =
    useState(false);
  const [fillInBlanksMessage, setFillInBlanksMessage] = useState(false);

  // login state
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInUserID, setLoggedInUserID] = useState("");

  const registerUser = async () => {
    setAlreadyRegisteredMessage(false);
    setFillInBlanksMessage(false);
    if (firstName != "" && lastName != "" && email != "" && password != "") {
      try {
        const ucr = collection(db, "Users");
        const q = query(ucr, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        const emailExists = !querySnapshot.empty;
        if (!emailExists) {
          await addDoc(ucr, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
          });
          setRegisterModalVisible(false);
        } else {
          setAlreadyRegisteredMessage(true);
        }
      } catch (error) {
        console.log("Error registering user ", error);
      }
    } else {
      setFillInBlanksMessage(true);
    }
  };

  const loginUser = async () => {
    setIncorrectLoginDetailsMessage(false); //reset error messages before another login attempt
    setNoUserRegisteredMessage(false);
    try {
      const ucr = collection(db, "Users");
      const q = query(ucr, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty == true) {
        console.log("No user is registered with this email");
        setNoUserRegisteredMessage(true);
      } else {
        const userData = querySnapshot.docs[0].data();
        if (userData.password == password) {
          setLoggedInUserID(querySnapshot.docs[0].id);
          setLoggedIn(true);
          console.log("Welcome", querySnapshot.docs[0].id);
        } else {
          console.log("Password or email is incorrect");
          setIncorrectLoginDetailsMessage(true);
        }
      }
    } catch (error) {
      console.log("Error logging in this user ", error);
    }
  };

  return (
    <SafeAreaView style={styles.wholeContainer}>
      {loggedIn == true ? (
        <Buttons loggedInUserID={loggedInUserID} />
      ) : (
        <View style={styles.screenContainer}>
          <Modal
            animationType="slide"
            visible={registerModalVisible}
            transparent={true}
            onRequestClose={() => {
              setRegisterModalVisible(!registerModalVisible);
            }}
          >
            <View style={styles.registerModal}>
              <Text style={styles.registerText}>First Name</Text>
              <TextInput
                style={styles.registertextInput}
                onChangeText={setFirstName}
                value={firstName}
              ></TextInput>
              <Text style={styles.registerText}>Last Name</Text>
              <TextInput
                style={styles.registertextInput}
                onChangeText={setLastName}
                value={lastName}
              ></TextInput>
              <Text style={styles.registerText}>Email</Text>
              <TextInput
                style={styles.registertextInput}
                onChangeText={setEmail}
                value={email}
              ></TextInput>
              <Text style={styles.registerText}>Password</Text>
              <TextInput
                style={styles.registertextInput}
                onChangeText={setPassword}
                value={password}
              ></TextInput>
              <TouchableOpacity onPress={() => registerUser()}>
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
              {alreadyRegisteredMessage == true ? (
                <Text style={styles.errorText}>
                  This email is already registered
                </Text>
              ) : null}
              {fillInBlanksMessage == true ? (
                <Text style={styles.errorText}>
                  Fill in all the blanks to register
                </Text>
              ) : null}
            </View>
          </Modal>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.bigText, { fontWeight: "bold" }]}>
              Welcome to LeftOvers!
            </Text>
            <Text style={styles.bigText}>Log in to continue :</Text>
            <Text style={styles.text}>Email</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setEmail}
              value={email}
            ></TextInput>
            <Text style={styles.text}>Password</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
            ></TextInput>
            <Text></Text>
            <TouchableOpacity onPress={() => loginUser()}>
              <Text style={styles.text}>Log in</Text>
            </TouchableOpacity>
            <Text></Text>
            <TouchableOpacity onPress={() => setRegisterModalVisible(true)}>
              <Text style={styles.text}>Register</Text>
              <Text></Text>
            </TouchableOpacity>
            {noUserRegisteredMessage == true ? (
              <Text style={styles.errorText}>
                There is no user registered with this email
              </Text>
            ) : null}
            {incorrectLoginDetailsMessage == true ? (
              <Text style={styles.errorText}>
                Your password or email is incorrect
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wholeContainer: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    backgroundColor: "#F5E2C8",
  },
  screenContainer: {
    backgroundColor: "#729B79",
    flex: 1,
  },
  welcomeContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "30%",
  },
  bigText: {
    color: "#F5E2C8",
    fontSize: 30,
  },
  text: {
    color: "#F5E2C8",
    fontSize: 18,
  },
  textInput: {
    borderColor: "#F5E2C8",
    borderWidth: 1,
    color: "#F5E2C8",
    width: "80%",
    height: 30,
    paddingLeft: 10,
  },
  errorText: {
    color: "#4F404C",
    fontSize: 18,
    fontWeight: "bold",
  },

  registerModal: {
    height: 300,
    width: "94%",
    borderWidth: 4,
    borderColor: "#4F404C",
    marginTop: "25%",
    marginLeft: "3%",
    marginRight: "3%",
    backgroundColor: "#F5E2C8",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 18,
    color: "#445F48",
  },
  registertextInput: {
    borderColor: "#445F48",
    borderWidth: 1,
    color: "#445F48",
    width: "80%",
    height: 30,
    paddingLeft: 10,
  },
});

export default WelcomePage;
