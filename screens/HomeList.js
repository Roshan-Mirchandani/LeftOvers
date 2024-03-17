import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Calendar } from "react-native-calendars";
import firebase from "firebase/app";
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

function HomeList(props) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [delModalVisible, setDelModalVisible] = useState(false);
  const [addItemText, setAddItemText] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [docBeingEditted, setDocBeingEditted] = useState([]); // used to find which row is being editted so can be used as placeholders

  const fetchData = async () => {
    //called everytime the list needs to be rerendered
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, "1");
      const ufcr = collection(udr, "UserFood");
      const querySnapshot = await getDocs(query(ufcr, orderBy("Name")));
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

  const formatDate = (date) => {
    dateArray = date.split("-");
    dateComplete = "";
    for (var i = 2; i > 0; i--) {
      dateComplete += dateArray[i] + "-";
    }
    dateComplete += dateArray[i];
    setExpiryDate(dateComplete);
  };

  const addItemtoDatabase = async () => {
    try {
      if (
        addItemText != null &&
        addItemQuantity != null &&
        expiryDate != null &&
        unit != null
      ) {
        const ucr = collection(db, "Users");
        const udr = doc(ucr, "1");
        const ufcr = collection(udr, "UserFood");
        await addDoc(ufcr, {
          Date: expiryDate,
          Name: addItemText,
          Quantity: addItemQuantity,
          Unit: unit,
        });
      }
      setAddItemText("");
      setAddItemQuantity("");
      setExpiryDate("");
      setUnit("");
      setAddModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  useEffect(() => {
    const assignSelectedRow = () => {
      if (selectedRow != null) {
        for (var i = 0; i < documents.length; i++) {
          if (documents[i].id == selectedRow) {
            setDocBeingEditted(documents[i]);
          }
        }
      }
    };
    // useEffect used to update whenever a new row is clicked on for EDITING or DELETING
    assignSelectedRow();
  }, [selectedRow]);

  const editItem = async () => {
    let updatedValues = {}; // used to allow for autofill, updating states was taking too long so made a new variable locally
    try {
      if (addItemText == "") {
        updatedValues.Name = docBeingEditted.Name;
      } else {
        updatedValues.Name = setAddItemText;
      }
      if (addItemQuantity == "") {
        updatedValues.Quantity = docBeingEditted.Quantity;
      } else {
        updatedValues.Quantity = addItemQuantity;
      }
      if (unit == "") {
        updatedValues.Unit = docBeingEditted.Unit;
      } else {
        updatedValues.Unit = unit;
      }
      if (expiryDate == "") {
        updatedValues.Date = docBeingEditted.Date;
      } else {
        updatedValues.Date = expiryDate;
      }
      const ucr = collection(db, "Users");
      const udr = doc(ucr, "1");
      const ufcr = collection(udr, "UserFood");
      const ufdr = doc(ufcr, selectedRow);
      await setDoc(ufdr, updatedValues);
      setAddItemText("");
      setAddItemQuantity("");
      setExpiryDate("");
      setUnit("");
      setEditModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const deleteItem = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, "1");
      const ufcr = collection(udr, "UserFood");
      const ufdr = doc(ufcr, selectedRow);
      await deleteDoc(ufdr);
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
    setDelModalVisible(false);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.wholeContainer}>
      <Modal
        animationType="slide"
        visible={addModalVisible}
        transparent={true}
        onRequestClose={() => {
          setAddModalVisible(!addModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Name</Text>
          <TextInput onChangeText={setAddItemText} value={addItemText} />
          <Text>Quantity</Text>
          <TextInput
            onChangeText={setAddItemQuantity}
            value={addItemQuantity}
          />
          <Text>Unit</Text>
          <TextInput onChangeText={setUnit} value={unit} />
          <Text>Expiry Date:</Text>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Text>{expiryDate === "" ? "DD-MM-YYYY" : expiryDate}</Text>
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
                  formatDate(day.dateString);
                  setCalendarVisible(false);
                }}
              />
            </View>
          </Modal>
          <TouchableOpacity onPress={() => addItemtoDatabase()}>
            <Text>Add Item</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*---------EDIT MODAL------------*/}

      {/*Minor bug in this modal, when editing the same row two times in a row,
       the placeholder values are stuck to the original values even though there has been a change,
       gets updated only when another row is clicked and then the original one is clicked again*/}
      <Modal
        animationType="slide"
        visible={editModalVisible}
        transparent={true}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Name</Text>
          <TextInput
            onChangeText={setAddItemText}
            value={addItemText}
            placeholder={docBeingEditted.Name}
          />

          <Text>Quantity</Text>
          <TextInput
            onChangeText={setAddItemQuantity}
            value={addItemQuantity}
            placeholder={docBeingEditted.Quantity}
          />

          <Text>Unit</Text>
          <TextInput
            onChangeText={setUnit}
            value={unit}
            placeholder={docBeingEditted.Unit}
          />

          <Text>Expiry Date:</Text>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Text>{expiryDate != "" ? expiryDate : docBeingEditted.Date}</Text>
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
                  formatDate(day.dateString);
                  setCalendarVisible(false);
                }}
              />
            </View>
          </Modal>
          <TouchableOpacity onPress={() => editItem()}>
            <Text>Change Item</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*--------------DELETE MODAL-----------------*/}
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
          <Text>{docBeingEditted.Name}</Text>
          <Text>
            {docBeingEditted.Quantity}
            {docBeingEditted.Unit}
          </Text>
          <Text>{docBeingEditted.Date}</Text>
          <TouchableOpacity onPress={() => deleteItem()}>
            <Text>PRESS TO CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*------RENDER LIST----- */}
      <View style={styles.listContainer}>
        {documents.map((document) => (
          <TouchableOpacity
            key={document.id}
            onPress={() => setSelectedRow(document.id)}
          >
            <Text>
              {document.Name} {document.Quantity}
              {document.Unit !== "-" ? document.Unit : ""}:{document.Date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setAddModalVisible(true)}>
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            selectedRow != null
              ? setEditModalVisible(true)
              : console.log("no row selected")
          }
        >
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            selectedRow != null
              ? setDelModalVisible(true)
              : console.log("no row selected")
          }
        >
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
    height: 300,
    width: "94%",
    borderColor: "orange",
    borderWidth: 3,
    marginTop: "25%",
    marginLeft: "3%",
    marginRight: "3%",
    backgroundColor: "white",
  },
});

export default HomeList;
