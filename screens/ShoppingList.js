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
    <View style={styles.wholeContainer}>
      {/*-------------ADD MODAL--------------*/}
      <Modal
        animationType="slide"
        visible={addModalVisible}
        transparent={true}
        onRequestClose={() => {
          setAddModalVisible(!addModalVisible);
        }}
      >
        <View style={styles.modal}>
          <Text style={[styles.modalText, { paddingTop: 50 }]}>Add:</Text>
          <TextInput
            onChangeText={setAddShoppingItem}
            value={addShoppingItem}
            style={styles.modalTextInput}
          ></TextInput>
          <Text></Text>
          <TouchableOpacity onPress={() => addToList()}>
            <Text style={styles.modalButton}>Confirm</Text>
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
        <View style={styles.modal}>
          <Text style={[styles.modalText, { paddingTop: 50 }]}>
            Are you sure you want to delete the following record?
          </Text>
          <Text></Text>
          <Text style={styles.modalText}>{docBeingEdited.Name}</Text>
          <Text></Text>
          <TouchableOpacity onPress={() => deleteItem()}>
            <Text style={styles.modalButton}>PRESS TO CONFIRM</Text>
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
        <View style={styles.modal}>
          <Text style={styles.modalText}>Name</Text>
          <TextInput
            onChangeText={setAddItemText}
            value={addItemText}
            placeholder={docBeingEdited.Name}
            placeholderTextColor={"#F6E3CB"}
            style={styles.modalTextInput}
          />
          <Text style={styles.modalText}>Quantity</Text>
          <TextInput
            onChangeText={setAddItemQuantity}
            value={addItemQuantity}
            placeholderTextColor={"#F6E3CB"}
            style={styles.modalTextInput}
          />
          <Text style={styles.modalText}>Unit</Text>
          <TextInput
            onChangeText={setUnit}
            value={unit}
            placeholderTextColor={"#F6E3CB"}
            style={styles.modalTextInput}
          />
          <Text style={styles.modalText}>Expiry Date:</Text>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Text style={styles.modalText}>
              {expiryDate === "" ? "DD-MM-YYYY" : formatDate(expiryDate)}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={calendarVisible}
            onRequestClose={() => {
              setCalendarVisible(!calendarVisible);
            }}
          >
            <View style={styles.calendarModal}>
              <Calendar
                onDayPress={(day) => {
                  setExpiryDate(day.dateString);
                  setCalendarVisible(false);
                }}
              />
            </View>
          </Modal>
          <TouchableOpacity onPress={() => transferToHomeList()}>
            <Text style={styles.modalButton}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*----------------------------------------------*/}
      <View style={styles.listContainer}>
        <View style={styles.list}>
          {documents.map((document) => (
            <View key={document.id}>
              <TouchableOpacity onPress={() => setSelectedRow(document.id)}>
                <Text
                  style={[
                    styles.listText1,
                    selectedRow === document.id && styles.selectedRow,
                  ]}
                >
                  {document.Name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setAddModalVisible(true)}>
          <Text style={styles.navBarButtons}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setBoughtModalVisible(true)}>
          <Text style={styles.navBarButtons}>Bought</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDelModalVisible(true)}>
          <Text style={styles.navBarButtons}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    backgroundColor: "#F5E2C8",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 10,
    paddingTop: 13,
    borderRadius: 10,
    flex: 1,
    borderColor: "#709976",
    backgroundColor: "#445f48",
    borderWidth: 3,
  },
  listContainer: {
    flex: 12,
    margin: 20,
  },

  modal: {
    height: 300,
    width: "94%",
    marginTop: "25%",
    marginLeft: "3%",
    marginRight: "3%",
    backgroundColor: "#709976",
    borderRadius: 10,
  },
  modalText: {
    fontSize: 20,
    color: "#F6E3CB",
    paddingLeft: 10,
  },
  modalTextInput: {
    fontSize: 20,
    color: "#F6E3CB",
    paddingLeft: 10,
    borderWidth: 2,
    borderColor: "#F6E3CB",
    marginHorizontal: 10,
  },
  modalButton: {
    justifyContent: "center",
    alignSelf: "center",
    fontSize: 20,
    color: "#F6E3CB",
    backgroundColor: "#445f48",
    borderRadius: 10,
    padding: 8,
  },
  calendarModal: {
    height: 300,
    width: "94%",
    marginTop: "25%",
    marginLeft: "3%",
    marginRight: "3%",
  },
  navBarButtons: {
    color: "#F9EDDD",
    fontSize: 24,
  },
  list: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#445f48",
    padding: 10,
    flex: 1,
    backgroundColor: "#F9EDDD",
  },
  listText1: {
    fontSize: 18,
    color: "#445f48",
    alignSelf: "center",
  },

  selectedRow: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default ShoppingList;
