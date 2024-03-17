import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6TRdECxHim0fDiBqRCewfNDJNGilE8Yg",
  authDomain: "leftovers-ac419.firebaseapp.com",
  projectId: "leftovers-ac419",
  storageBucket: "leftovers-ac419.appspot.com",
  messagingSenderId: "642630134374",
  appId: "1:642630134374:web:94823d8c7f29e705f4dba7",
  measurementId: "G-4QYKZZM0QS",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;

//https://stackoverflow.com/questions/59050195/uncaught-typeerror-cannot-read-property-initializeapp-of-undefined
