import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  MultipleSelectList,
  SelectList,
} from "react-native-dropdown-select-list";
import firebase from "firebase/app";
import "firebase/firestore";
import db from "./database.js";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  setDoc,
  orderBy,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import * as Notifications from "expo-notifications";

function HomeList(route) {
  //userID
  const loggedInUserID = route.route.params.loggedInUserID;

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

  //Data fetchers from backend
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
  const [editRemoveReady, setEditRemoveReady] = useState([]);

  //Notification states
  const [expoPushToken, setExpoPushToken] = useState("");
  const [lastCheckedDate1, setLastCheckedDate1] = useState("");
  const [lastCheckedDate2, setLastCheckedDate2] = useState("");
  const [reminderTime, setReminderTime] = useState(null);

  const fetchData = async () => {
    //called everytime the list needs to be rerendered in LIST VIEW
    try {
      const ucr = collection(db, "Users"); //ucr is User Collection Reference
      const udr = doc(ucr, loggedInUserID); //udr is User Document Reference
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
      const udr = doc(ucr, loggedInUserID);
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
        const udr = doc(ucr, loggedInUserID);
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
      const udr = doc(ucr, loggedInUserID);
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
      const udr = doc(ucr, loggedInUserID);
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
        const udr = doc(ucr, loggedInUserID);
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
      const udr = doc(ucr, loggedInUserID);
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
  const createOptionsForAddFolder = () => {
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
    if (documents != []) {
      /* over here*/
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
    }
  };

  // useEffect(() => {
  //   createOptionsForEditFolder();
  // }, [editFolderModalVisible]);

  const editFolder = async (addArray, remArray) => {
    const ucr = collection(db, "Users");
    const udr = doc(ucr, loggedInUserID);
    const ufscr = collection(udr, "FolderSystem");
    const ufsdr = doc(ufscr, selectedRow);
    const data = await getDoc(ufsdr);
    current_array = data.data().Items;
    folder_Name = data.data().Name;
    console.log(current_array);
    for (var j = 0; j < folderDocuments.length; j++) {
      if (folderDocuments[j].id == selectedRow) {
        console.log(1);
        for (const item of addArray) {
          if (!current_array.some((existingItem) => existingItem === item)) {
            console.log(2);
            current_array.push(item);
          }
        }
        current_array = current_array.filter(
          (item) => !remArray.some((removedItem) => removedItem === item)
        );
      }
    }
    await setDoc(ufsdr, { Name: folder_Name, Items: current_array });
    setEditFolderModalVisible(false);
    fetchFolderData();
  };

  const isDatePassed = (date) => {
    const currentDate = new Date();
    const rowDate = new Date(date);
    return rowDate < currentDate;
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowSound: true,
            allowBadge: true,
          },
        });
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    } catch (error) {
      console.log("Error while registering for push notifications:", error);
    }
  };

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  const sendNotification = async (message) => {
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate",
          Host: "exp.host",
        },
        body: JSON.stringify(message),
      });
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  useEffect(() => {
    sendExpiryNotification();
    sendWarningNotification();
    const interval = setInterval(() => {
      sendExpiryNotification();
      sendWarningNotification();
    }, 1000 * 60 * 60); // 1 min in milliseconds * 60  i.e. checks every hour for a new day

    return () => clearInterval(interval);
  }, []);

  const sendExpiryNotification = () => {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0];
    //ignored if it has been checked on same day
    if (currentDateString !== lastCheckedDate1) {
      if (documents.length != 0) {
        // to prevent updating lastcheckeddate for no reason
        setLastCheckedDate1(currentDateString); //if a new day then set it so it doesnt run again same day
        for (i = 0; i < documents.length; i++) {
          itemDate = new Date(documents[i].Date);
          if (itemDate < currentDate) {
            const message = {
              to: expoPushToken,
              sound: "default",
              title: "You have an expired ingredient!",
              body: `Your ${
                documents[i].Name
              }, has gone bad, its expiry date was the ${formatDate(
                documents[i].Date
              )}`,
            };
            sendNotification(message);
          }
        }
      }
    }
  };

  const sendWarningNotification = () => {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0];
    //ignored if it has been checked on same day
    if (currentDateString !== lastCheckedDate2) {
      if (documents.length != 0) {
        // to prevent updating lastcheckeddate for no reason
        setLastCheckedDate2(currentDateString); //if a new day then set it so it doesnt run again same day
        for (i = 0; i < documents.length; i++) {
          itemDate = new Date(documents[i].Date);
          if (isCloseToExpiry(currentDate, new Date(documents[i].Date))) {
            const message = {
              to: expoPushToken,
              sound: "default",
              title: "Dont forget about this ingredient!",
              body: `Your ${
                documents[i].Name
              }, will go bad soon, its expiry date is the ${formatDate(
                documents[i].Date
              )}`,
            };
            sendNotification(message);
          }
        }
      }
    }
  };

  const isCloseToExpiry = (currentDate, expiryDate) => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const differenceInDays = Math.ceil(
      (expiryDate - currentDate) / millisecondsPerDay
    );
    if (differenceInDays < reminderTime && differenceInDays > 0) {
      return true;
    } else {
      return false;
    }
  };
  useEffect(() => {
    const getReminderTime = async () => {
      try {
        const ucr = collection(db, "Users");
        const udr = doc(ucr, loggedInUserID);
        time = (await getDoc(udr)).data().ReminderTime;
        setReminderTime(time);
      } catch (error) {
        console.log("Error getting users reminder time:", error);
      }
    };
    getReminderTime();
  }, []);

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
        <View style={styles.modal}>
          <Text style={styles.modalText}>Name</Text>
          <TextInput
            onChangeText={setAddItemText}
            value={addItemText}
            style={styles.modalTextInput}
          />
          <Text style={styles.modalText}>Quantity</Text>
          <TextInput
            onChangeText={setAddItemQuantity}
            value={addItemQuantity}
            style={styles.modalTextInput}
          />
          <Text style={styles.modalText}>Unit</Text>
          <TextInput
            onChangeText={setUnit}
            value={unit}
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
          <TouchableOpacity onPress={() => addItemtoDatabase()}>
            <Text style={styles.modalButton}>Add Item</Text>
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
            placeholder={docBeingEdited.Quantity}
            placeholderTextColor={"#F6E3CB"}
            style={styles.modalTextInput}
          />

          <Text style={styles.modalText}>Unit</Text>
          <TextInput
            onChangeText={setUnit}
            value={unit}
            placeholder={docBeingEdited.Unit}
            placeholderTextColor={"#F6E3CB"}
            style={styles.modalTextInput}
          />

          <Text style={styles.modalText}>Expiry Date:</Text>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Text style={styles.modalText}>
              {expiryDate != ""
                ? formatDate(expiryDate)
                : docBeingEdited != []
                ? formatDate(docBeingEdited.Date)
                : null}
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
          <TouchableOpacity onPress={() => editItem()}>
            <Text style={styles.modalButton}>Change Item</Text>
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
        <View style={styles.modal}>
          <Text style={[styles.modalText, { paddingTop: 50 }]}>
            Are you sure you want to delete the following record?
          </Text>
          <Text></Text>
          <Text style={styles.modalText}>{docBeingEdited.Name}</Text>
          <Text style={styles.modalText}>
            {docBeingEdited.Quantity}
            {docBeingEdited.Unit}
          </Text>
          <Text style={styles.modalText}>{docBeingEdited.Date}</Text>
          <Text></Text>
          <TouchableOpacity onPress={() => deleteItem()}>
            <Text style={styles.modalButton}>PRESS TO CONFIRM</Text>
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
        <View style={[styles.modal, { height: 500 }]}>
          <Text style={styles.modalText}>Name of Folder:</Text>
          <TextInput
            onChangeText={setFolderName}
            value={folderName}
            style={styles.modalTextInput}
          ></TextInput>
          <Text style={styles.modalText}>Add Food from Stock</Text>
          <MultipleSelectList
            setSelected={(key) => setAddToFolder(key)}
            data={optionsForAdding}
            save="key"
            boxStyles={styles.boxStyles}
            inputStyles={styles.inputStyles}
            dropdownStyles={styles.dropdownStyles}
            dropdownItemStyles={styles.dropdownItemStyles}
            dropdownTextStyles={styles.dropdownTextStyles}
          />
          <TouchableOpacity onPress={() => addFolder(addToFolder)}>
            <Text style={styles.modalButton}>Create Folder</Text>
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
        <View style={[styles.modal, { height: 500 }]}>
          <Text style={styles.modalText}>Name</Text>
          <TextInput
            onChangeText={setFolderName}
            value={folderName}
            placeholder={docBeingEdited.Name}
            placeholderTextColor={"#F6E3CB"}
            style={styles.modalTextInput}
          />
          <Text style={styles.modalText}>Current Items in folder:</Text>
          <View style={{ flexDirection: "row" }}>
            {docBeingEdited.Items != null
              ? docBeingEdited.Items.map((item, index) => (
                  <View key={index}>
                    <Text style={[styles.modalText, { fontSize: 16 }]}>
                      {item.Name}
                    </Text>
                  </View>
                ))
              : null}
          </View>
          <Text style={styles.modalText}>Add</Text>
          <MultipleSelectList
            setSelected={(key) => setEditAddReady(key)}
            data={editAddOptions}
            save="key"
            searchPlaceholder="Adding"
            boxStyles={styles.boxStyles}
            inputStyles={styles.inputStyles}
            dropdownStyles={[styles.dropdownStyles, { height: 200 }]}
            dropdownItemStyles={styles.dropdownItemStyles}
            dropdownTextStyles={styles.dropdownTextStyles}
          />
          <Text style={styles.modalText}>Remove</Text>
          <MultipleSelectList
            setSelected={(key) => setEditRemoveReady(key)}
            data={editRemoveOptions}
            save="key"
            searchPlaceholder="Removing"
            boxStyles={styles.boxStyles}
            inputStyles={styles.inputStyles}
            dropdownStyles={[styles.dropdownStyles, { height: 150 }]}
            dropdownItemStyles={styles.dropdownItemStyles}
            dropdownTextStyles={styles.dropdownTextStyles}
          />
          <TouchableOpacity
            onPress={() => editFolder(editAddReady, editRemoveReady)}
          >
            <Text style={styles.modalButton}>Confirm Changes</Text>
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
        <View style={styles.modal}>
          <Text style={[styles.modalText, { paddingTop: 50 }]}>
            Are you sure you want to delete the following Folder and all its
            content?
          </Text>
          <Text></Text>
          <Text style={styles.modalText}>{docBeingEdited.Name}</Text>
          <View style={{ flexDirection: "row" }}>
            {docBeingEdited.Items != null
              ? docBeingEdited.Items.map((item, index) => (
                  <View key={index}>
                    <Text style={[styles.modalText, { fontSize: 16 }]}>
                      {item.Name}
                    </Text>
                  </View>
                ))
              : null}
          </View>
          <Text></Text>
          <TouchableOpacity onPress={() => deleteFolder()}>
            <Text style={styles.modalButton}>PRESS TO CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/*------RENDER LIST----- */}
      <View style={styles.listContainer}>
        <View style={{ flexDirection: "row", paddingRight: 8 }}>
          <View style={{ flex: 1 }}>
            <SelectList
              setSelected={(val) => setListOrFolder(val)}
              data={[
                { key: "List", value: "List" },
                { key: "Folder", value: "Folder" },
              ]}
              save="value"
              search={false}
              defaultOption={{ key: "List", value: "List" }}
            />
          </View>
          {listOrFolder == "List" ? (
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <SelectList
                setSelected={(value) => setSortBy(value)}
                data={[
                  { key: "Alphabetical", value: "Alphabetical" },
                  { key: "Date", value: "Date" },
                ]}
                save="value"
                search={false}
                defaultOption={{ key: "Alphabetical", value: "Alphabetical" }}
              />
            </View>
          ) : null}
        </View>
        <Text></Text>
        <Text></Text>
        <ScrollView style={styles.list}>
          {
            //-----------List View
            listOrFolder == "List"
              ? documents.map((document) => (
                  <View key={document.id}>
                    <TouchableOpacity
                      onPress={() => setSelectedRow(document.id)}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={[
                            styles.listText1,
                            isDatePassed(document.Date) && styles.expiredText,
                            selectedRow === document.id && styles.selectedRow,
                          ]}
                        >
                          {document.Name} {document.Quantity}
                          {document.Unit !== "-" ? document.Unit : ""}:
                        </Text>
                        <Text style={styles.listText2}>
                          {formatDate(document.Date)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              : //------------Folder View
                folderDocuments.map((document, index) => (
                  <View key={folderDocuments.id}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedRow(folderDocuments[index].id);
                        }}
                      >
                        <Text
                          style={[
                            styles.folderTitle,
                            selectedRow === document.id && styles.selectedRow,
                          ]}
                        >
                          {document.Name}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          changeOpenStateOfFolder(index);
                        }}
                      >
                        <Text
                          style={[
                            styles.folderTitle,
                            selectedRow === document.id && styles.selectedRow,
                            { textDecorationLine: "none" },
                          ]}
                        >
                          ˅
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {document.Items != null && openCloseFolder[index] == true
                      ? document.Items.map((item, index2) => (
                          <View key={index2} style={{ flexDirection: "row" }}>
                            <Text
                              style={[
                                [styles.listText1, { paddingLeft: 15 }],
                                isDatePassed(item.Date) && [
                                  styles.expiredText,
                                  { paddingLeft: 15 },
                                ],
                              ]}
                            >
                              {item.Name} {item.Quantity}
                              {item.Unit !== "-" ? item.Unit : ""}:
                            </Text>
                            <Text style={styles.listText2}>
                              {formatDate(item.Date)}{" "}
                            </Text>
                          </View>
                        ))
                      : null}
                  </View>
                ))
          }
        </ScrollView>
      </View>
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() =>
            listOrFolder == "List"
              ? setAddModalVisible(true)
              : setAddFolderModalVisible(true)
          }
        >
          <Text style={styles.navBarButtons}>Add</Text>
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
          <Text style={styles.navBarButtons}>Edit</Text>
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
          <Text style={styles.navBarButtons}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  },
  listText2: {
    fontSize: 18,
    color: "#4F404C",
    fontWeight: "700",
  },
  expiredText: {
    fontSize: 18,
    color: "red",
    textDecorationLine: "line-through",
  },
  selectedRow: {
    fontSize: 20,
    fontWeight: "bold",
  },
  folderTitle: {
    fontSize: 20,
    color: "#4F404C",
    textDecorationLine: "underline",
  },
  boxStyles: {
    marginHorizontal: 10,
    borderColor: "#F6E3CB",
    color: "#F6E3CB",
  },
  inputStyles: {
    borderColor: "#F6E3CB",
    color: "#F6E3CB",
  },

  dropdownStyles: {
    height: 350,
    marginHorizontal: 10,
    color: "#F6E3CB",
    borderColor: "#F6E3CB",
  },
  dropdownItemStyles: {
    color: "#F6E3CB",
  },

  dropdownTextStyles: {
    color: "#F6E3CB",
  },
});

export default HomeList;
