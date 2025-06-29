// firebaseConfig.js
import { initializeApp } from "@firebase/app";
// import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from "@firebase/firestore";
import {
  initializeAuth
} from "firebase/auth";


// Your web app's Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Initialize Firestore
export const FIREBASE_AUTH = initializeAuth(app/* , {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
} */);
