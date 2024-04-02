import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import "firebase/firestore";
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
import { Calendar } from "react-native-calendars";

function ShoppingList(route) {
  const loggedInUserID = route.route.params.loggedInUserID;
  //data fetchers
  const [documents, setDocuments] = useState([]);

  //modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [delModalVisible, setDelModalVisible] = useState(false);
  const [boughtModalVisible, setBoughtModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Food item fields
  const [addItemText, setAddItemText] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  //Shopping fields
  const [addShoppingItem, setAddShoppingItem] = useState("");

  //selecting rows
  const [selectedRow, setSelectedRow] = useState(null);
  const [docBeingEdited, setDocBeingEdited] = useState([]);

  const fetchData = async () => {
    try {
      const ucr = collection(db, "Users"); //ucr is User Collection Reference
      const udr = doc(ucr, loggedInUserID); //udr is User Document Reference
      const ufcr = collection(udr, "ShoppingList");
      let querySnapshot = null;
      querySnapshot = await getDocs(query(ufcr, orderBy("Name")));
      const fetchedDocuments = [];
      querySnapshot.forEach((doc) => {
        fetchedDocuments.push({ id: doc.id, ...doc.data() });
      });
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const addToList = async () => {
    try {
      if (addShoppingItem != "") {
        const ucr = collection(db, "Users");
        const udr = doc(ucr, loggedInUserID);
        const uscr = collection(udr, "ShoppingList");
        await addDoc(uscr, {
          Name: addShoppingItem,
        });
      }
      setAddShoppingItem("");
      setAddModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  const assignSelectedRow = () => {
    if (selectedRow != null) {
      for (var i = 0; i < documents.length; i++) {
        if (documents[i].id == selectedRow) {
          setDocBeingEdited(documents[i]);
        }
      }
    }
  };
  useEffect(() => {
    assignSelectedRow();
  }, [selectedRow]);

  const deleteItem = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const uscr = collection(udr, "ShoppingList");
      const usdr = doc(uscr, selectedRow);
      await deleteDoc(usdr);

      setDelModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const transferToHomeList = async () => {
    try {
      if (addItemQuantity != "" && expiryDate != "") {
        let itemName = "";
        if (addItemText == "") {
          itemName = docBeingEdited.Name;
          console.log(itemName);
        } else {
          itemName = addItemText;
          console.log(itemName);
        }
        const ucr = collection(db, "Users");
        const udr = doc(ucr, loggedInUserID);
        const ufcr = collection(udr, "UserFood");
        await addDoc(ufcr, {
          Date: expiryDate,
          Name: itemName,
          Quantity: addItemQuantity,
          Unit: unit,
        });
      }
      setAddItemText("");
      setAddItemQuantity("");
      setExpiryDate("");
      setUnit("");
      const ucr = collection(db, "Users");
      const udr = doc(ucr, loggedInUserID);
      const uscr = collection(udr, "ShoppingList");
      const usdr = doc(uscr, selectedRow);
      await deleteDoc(usdr);
      fetchData();
      setBoughtModalVisible(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const formatDate = (date) => {
    // changes date format to YYYY-MM-DD and vice versa
    if (date != null) {
      dateArray = date.split("-");
      dateComplete = "";
      for (var i = 2; i > 0; i--) {
        dateComplete += dateArray[i] + "-";
      }
      dateComplete += dateArray[i];
      return dateComplete;
    }
  };

  return (
    <SafeAreaView style={styles.wholeContainer}>
      {/*-------------ADD MODAL--------------*/}
      <Modal
        animationType="slide"
        visible={addModalVisible}
        transparent={true}
        onRequestClose={() => {
          setAddModalVisible(!addModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Add:</Text>
          <TextInput
            onChangeText={setAddShoppingItem}
            value={addShoppingItem}
          ></TextInput>
          <TouchableOpacity onPress={() => addToList()}>
            <Text>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*-------------DELETE MODAL--------------*/}
      <Modal
        animationType="slide"
        visible={delModalVisible}
        transparent={true}
        onRequestClose={() => {
          setDelModalVisible(!delModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Are you sure you want to delete the following record?</Text>
          <Text>{docBeingEdited.Name}</Text>
          <TouchableOpacity onPress={() => deleteItem()}>
            <Text>PRESS TO CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*------------BOUGHT------------------*/}
      <Modal
        animationType="slide"
        visible={boughtModalVisible}
        transparent={true}
        onRequestClose={() => {
          setBoughtModalVisible(!boughtModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Name</Text>
          <TextInput
            onChangeText={setAddItemText}
            value={addItemText}
            placeholder={docBeingEdited.Name}
          />
          <Text>Quantity</Text>
          <TextInput
            onChangeText={setAddItemQuantity}
            value={addItemQuantity}
          />
          <Text>Unit</Text>
          <TextInput onChangeText={setUnit} value={unit} />
          <Text>Expiry Date:</Text>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Text>
              {expiryDate === "" ? "DD-MM-YYYY" : formatDate(expiryDate)}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={calendarVisible}
            onRequestClose={() => {
              setCalendarVisible(!calendarVisible);
            }}
          >
            <View style={styles.addItem}>
              <Calendar
                onDayPress={(day) => {
                  setExpiryDate(day.dateString);
                  setCalendarVisible(false);
                }}
              />
            </View>
          </Modal>
          <TouchableOpacity onPress={() => transferToHomeList()}>
            <Text>Add Item</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*----------------------------------------------*/}
      <View style={styles.listContainer}>
        {documents.map((document) => (
          <View key={document.id}>
            <TouchableOpacity onPress={() => setSelectedRow(document.id)}>
              <Text>{document.Name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setAddModalVisible(true)}>
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setBoughtModalVisible(true)}>
          <Text>Bought</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDelModalVisible(true)}>
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
  addItem: {
    height: 100,
    width: "94%",
    borderColor: "orange",
    borderWidth: 3,
    marginTop: "45%",
    marginLeft: "3%",
    marginRight: "3%",
    backgroundColor: "white",
  },
});

export default ShoppingList;
