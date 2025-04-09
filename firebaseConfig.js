// firebaseConfig.js
import { initializeApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Initialize Firestore
export const FIREBASE_AUTH = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
