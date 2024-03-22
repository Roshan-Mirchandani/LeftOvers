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
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import RNPickerSelect from "react-native-picker-select";
import { MultipleSelectList } from "react-native-dropdown-select-list";
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
  // Modal States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [delModalVisible, setDelModalVisible] = useState(false);
  const [addFolderModalVisible, setAddFolderModalVisible] = useState(false);
  const [delFolderModalVisible, setDelFolderModalVisible] = useState(false);
  const [editFolderModalVisible, setEditFolderModalVisible] = useState(false);

  // Food item fields
  const [addItemText, setAddItemText] = useState("");
  const [addItemQuantity, setAddItemQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  //Folder fields
  const [folderName, setFolderName] = useState("");

  //Data fecthers from backend
  const [documents, setDocuments] = useState([]);
  const [folderDocuments, setFolderDocuments] = useState([]);

  //used for seleccting rows
  const [selectedRow, setSelectedRow] = useState(null);
  const [docBeingEdited, setDocBeingEdited] = useState([]); // used to find which row is being Edited so can be used as placeholders

  //Rendering states
  const [sortBy, setSortBy] = useState("Alphabetical");
  const [listOrFolder, setListOrFolder] = useState("List");

  //Folder States
  const [openCloseFolder, setOpenCloseFolder] = useState([]);
  const [addToFolder, setAddToFolder] = useState([]);
  const [optionsForAdding, setOptionsForAdding] = useState([]);
  const [editAddOptions, setEditAddOptions] = useState([]); //this and the one below for options available to pick
  const [editRemoveOptions, setEditRemoveOptions] = useState([]);
  const [editAddReady, setEditAddReady] = useState([]); //this and one below to set to use in function to send to database
  const [editRemoveReady, setRemovetAddReady] = useState([]);

  const fetchData = async () => {
    //called everytime the list needs to be rerendered in LIST VIEW
    try {
      const ucr = collection(db, "Users"); //ucr is User Collection Reference
      const udr = doc(ucr, "1"); //udr is User Document Reference
      const ufcr = collection(udr, "UserFood"); // ufcr is User Food Collection Reference
      let querySnapshot = null;
      if (sortBy == "Alphabetical") {
        querySnapshot = await getDocs(query(ufcr, orderBy("Name")));
      } else if (sortBy == "Date") {
        querySnapshot = await getDocs(query(ufcr, orderBy("Date")));
      }
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
  }, [sortBy]);

  const fetchFolderData = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, "1");
      const ufscr = collection(udr, "FolderSystem");
      const querySnapshot = await getDocs(query(ufscr, orderBy("Name")));
      const fetchedDocuments = [];
      querySnapshot.forEach((doc) => {
        fetchedDocuments.push({ id: doc.id, ...doc.data() });
      });
      const ufcr = collection(udr, "UserFood");
      for (var i = 0; i < fetchedDocuments.length; i++) {
        if (fetchedDocuments[i].Items != null) {
          for (var j = 0; j < fetchedDocuments[i].Items.length; j++) {
            const ufdr = doc(ufcr, fetchedDocuments[i].Items[j]);
            const itemDoc = await getDoc(ufdr);
            const itemDocDataWithID = {
              id: fetchedDocuments[i].Items[j],
              ...itemDoc.data(),
            };
            fetchedDocuments[i].Items[j] = itemDocDataWithID;
          }
        }
        setFolderDocuments(fetchedDocuments);
      }
      const openState = Array.from({ length: fetchedDocuments.length }).fill(
        true
      );
      setOpenCloseFolder(openState);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchFolderData();
  }, [listOrFolder]);

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
    //this is used to set docBeingEdited to assign place holders
    const assignSelectedRow = () => {
      if (selectedRow != null) {
        if (listOrFolder == "List") {
          for (var i = 0; i < documents.length; i++) {
            if (documents[i].id == selectedRow) {
              setDocBeingEdited(documents[i]);
            }
          }
        } else {
          for (var j = 0; j < folderDocuments.length; j++) {
            if (folderDocuments[j].id == selectedRow) {
              setDocBeingEdited(folderDocuments[j]);
            }
          }
        }
        //console.log(docBeingEdited);
      }
    };
    // useEffect used to update whenever a new row is clicked on for EDITING or DELETING
    assignSelectedRow();
  }, [selectedRow]);

  const editItem = async () => {
    let updatedValues = {}; // used to allow for autofill, updating states was taking too long so made a new variable locally
    try {
      if (addItemText == "") {
        updatedValues.Name = docBeingEdited.Name;
      } else {
        updatedValues.Name = setAddItemText;
      }
      if (addItemQuantity == "") {
        updatedValues.Quantity = docBeingEdited.Quantity;
      } else {
        updatedValues.Quantity = addItemQuantity;
      }
      if (unit == "") {
        updatedValues.Unit = docBeingEdited.Unit;
      } else {
        updatedValues.Unit = unit;
      }
      if (expiryDate == "") {
        updatedValues.Date = docBeingEdited.Date;
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
  const changeOpenStateOfFolder = (index) => {
    setOpenCloseFolder((prevState) => {
      let temp = [...prevState];
      temp[index] = !temp[index];
      return temp;
    });
  };

  const addFolder = async (array) => {
    try {
      if (folderName != "") {
        const ucr = collection(db, "Users");
        const udr = doc(ucr, "1");
        const ufscr = collection(udr, "FolderSystem");
        await addDoc(ufscr, {
          Name: folderName,
          Items: array,
        });
        setAddFolderModalVisible(false);
        setFolderName("");
        fetchFolderData();
      }
    } catch (error) {
      console.error("Error making Folder: ", error);
    }
  };
  const deleteFolder = async () => {
    try {
      const ucr = collection(db, "Users");
      const udr = doc(ucr, "1");
      const ufscr = collection(udr, "FolderSystem");
      const ufsdr = doc(ufscr, selectedRow);
      await deleteDoc(ufsdr);
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
    setDelFolderModalVisible(false);
    fetchFolderData();
  };
  const createOptionsAddForFolder = () => {
    temp = [];
    for (var i = 0; i < documents.length; i++) {
      temp.push({ key: documents[i].id, value: documents[i].Name });
    }
    setOptionsForAdding(temp);
  };
  useEffect(() => {
    createOptionsForAddFolder();
  }, [addFolderModalVisible]);

  /*makes 2 arrays, one array which are all the options to add in a folder that arent already in,
  the second array that are options to remove from a folder*/
  const createOptionsForEditFolder = () => {
    let addArray = [];
    for (var i = 0; i < documents.length; i++) {
      let found = false;
      for (var j = 0; j < docBeingEdited.Items.length; j++) {
        if (documents[i].id == docBeingEdited.Items[j].id) {
          found = true;
          break;
        }
      }
      if (!found) {
        addArray.push({ key: documents[i].id, value: documents[i].Name });
      }
    }
    setEditAddOptions(addArray);
    let removeArray = [];
    for (const item1 of documents) {
      for (const item2 of docBeingEdited.Items) {
        if (item1.id == item2.id) {
          removeArray.push({ key: item1.id, value: item1.Name });
          break;
        }
      }
    }
    setEditRemoveOptions(removeArray);
  };

  useEffect(() => {
    createOptionsForEditFolder();
  }, [editFolderModalVisible]);

  const editFolderAdd = () => {
    // to do
  };

  const editFolderRemove = () => {
    // to do
  };

  {
    /*-----------------------returns--------------------------- */
  }
  return (
    <SafeAreaView style={styles.wholeContainer}>
      {/*-----------Add Modal----------*/}
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
            placeholder={docBeingEdited.Name}
          />

          <Text>Quantity</Text>
          <TextInput
            onChangeText={setAddItemQuantity}
            value={addItemQuantity}
            placeholder={docBeingEdited.Quantity}
          />

          <Text>Unit</Text>
          <TextInput
            onChangeText={setUnit}
            value={unit}
            placeholder={docBeingEdited.Unit}
          />

          <Text>Expiry Date:</Text>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Text>
              {expiryDate != ""
                ? formatDate(expiryDate)
                : docBeingEdited != []
                ? formatDate(docBeingEdited.Date)
                : null}
              ;
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
          <Text>{docBeingEdited.Name}</Text>
          <Text>
            {docBeingEdited.Quantity}
            {docBeingEdited.Unit}
          </Text>
          <Text>{docBeingEdited.Date}</Text>
          <TouchableOpacity onPress={() => deleteItem()}>
            <Text>PRESS TO CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*-------------------FOLDER ADD MODAL-------------------------*/}
      <Modal
        animationType="slide"
        visible={addFolderModalVisible}
        transparent={true}
        onRequestClose={() => {
          setAddFolderModalVisible(!addFolderModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Name of Folder:</Text>
          <TextInput
            onChangeText={setFolderName}
            value={folderName}
          ></TextInput>
          <Text>Add Food from Stock</Text>
          <MultipleSelectList
            setSelected={(key) => setAddToFolder(key)}
            data={optionsForAdding}
            save="key"
          />
          <TouchableOpacity onPress={() => addFolder(addToFolder)}>
            <Text>Create Folder</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*-------------------FOLDER EDIT MODAL---------------------*/}
      <Modal
        animationType="slide"
        visible={editFolderModalVisible}
        transparent={true}
        onRequestClose={() => {
          setEditFolderModalVisible(!editFolderModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>Name</Text>
          <TextInput
            onChangeText={setFolderName}
            value={folderName}
            placeholder={docBeingEdited.Name}
          />
          <Text>Current Items in folder:</Text>
          {docBeingEdited.Items != null
            ? docBeingEdited.Items.map((item, index) => (
                <View key={index}>
                  <Text>{item.Name}</Text>
                </View>
              ))
            : null}
          <Text>Add</Text>
          <MultipleSelectList
            setSelected={(key) => setAddToFolder(key)} // change function to do
            data={editAddOptions}
            save="key"
          />
          <Text>Remove</Text>
          <MultipleSelectList
            setSelected={(key) => setAddToFolder(key)} // change function to do
            data={editRemoveOptions}
            save="key"
          />
          <TouchableOpacity>
            <Text>Confirm Changes</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/*-------------------------- FOLDER DEL MODAL-------------------------------*/}
      <Modal
        animationType="slide"
        visible={delFolderModalVisible}
        transparent={true}
        onRequestClose={() => {
          setDelFolderModalVisible(!delFolderModalVisible);
        }}
      >
        <View style={styles.addItem}>
          <Text>
            Are you sure you want to delete the following Folder and all its
            content?
          </Text>
          <Text>{docBeingEdited.Name}</Text>
          <Text>(ITEMS IF YOU CAN BE ASKED)</Text>

          <TouchableOpacity onPress={() => deleteFolder()}>
            <Text>PRESS TO CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*------RENDER LIST----- */}
      <View style={styles.listContainer}>
        <View>
          <RNPickerSelect
            onValueChange={(value) => setSortBy(value)}
            placeholder={{ label: "Sort by:", value: "Alphabetical" }}
            items={[
              { label: "Alphabetical", value: "Alphabetical" },
              { label: "Date", value: "Date" },
            ]}
          />
          <RNPickerSelect
            onValueChange={(value) => setListOrFolder(value)}
            placeholder={{ label: "View:", value: "List" }}
            items={[
              { label: "List", value: "List" },
              { label: "Folder", value: "Folder" },
            ]}
          />
        </View>

        {
          //-----------List View
          listOrFolder == "List"
            ? documents.map((document) => (
                <View key={document.id}>
                  <TouchableOpacity onPress={() => setSelectedRow(document.id)}>
                    <Text>
                      {document.Name} {document.Quantity}
                      {document.Unit !== "-" ? document.Unit : ""}:
                      {formatDate(document.Date)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            : //------------Folder View
              folderDocuments.map((document, index) => (
                <View key={folderDocuments.id}>
                  <TouchableOpacity
                    onPress={() => {
                      changeOpenStateOfFolder(index),
                        setSelectedRow(folderDocuments[index].id);
                    }}
                  >
                    <Text>{document.Name}</Text>
                  </TouchableOpacity>
                  {document.Items != null && openCloseFolder[index] == true
                    ? document.Items.map((item, index2) => (
                        <View key={index2}>
                          <Text>
                            {item.Name} {item.Quantity}
                            {item.Unit !== "-" ? item.Unit : ""}:
                            {formatDate(item.Date)}{" "}
                          </Text>
                        </View>
                      ))
                    : null}
                </View>
              ))
        }
      </View>
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() =>
            listOrFolder == "List"
              ? setAddModalVisible(true)
              : setAddFolderModalVisible(true)
          }
        >
          <Text>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            selectedRow != null
              ? listOrFolder == "List"
                ? setEditModalVisible(true)
                : setEditFolderModalVisible(true)
              : console.log("no row selected")
          }
        >
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            selectedRow != null
              ? listOrFolder == "List"
                ? setDelModalVisible(true)
                : setDelFolderModalVisible(true)
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
