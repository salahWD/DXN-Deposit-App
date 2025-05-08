import { getUserSession } from "@/utils/functions";

import { StyleSheet } from "react-native";

import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";
import CryptoJS from "crypto-js";
import LoginPage from "@/components/LoginPage";
import React from "react";
import DepositScreen from "./(with-products)/deposit";
import HomeScreen from "./(with-products)/home";
import DeptAmount from "./(with-products)/deptAmount";
import PostponedPointsScreen from "./(with-products)/postponedPoints";
import OrderScreen from "./(with-products)/order";
import MakeTransactionScreen from "./(with-products)/makeTransaction";
import useAdminCheck from "@/contexts/useAdminCheck";

export default function IndexScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isAdmin, userId } = useAdminCheck();

  useEffect(() => {
    if (userId) {
      saveUserSession(userId, !!isAdmin);
      router.replace("/home");
    }
  }, [isAdmin, userId]);

  function verifyPassword(inputPassword: string, storedHashedPassword: string) {
    const hashedInputPassword = CryptoJS.SHA256(inputPassword).toString();
    return hashedInputPassword === storedHashedPassword;
  }

  async function registerUser() {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const userDocRef = doc(db, "deposits", username);

    const isRegisteredUser = await getDoc(doc(db, "deposits", username));

    if (isRegisteredUser.exists()) {
      alert("رقم العضوية هذا مسجل بالفعل, جرّب تسجيل الدخول");
    } else {
      await setDoc(userDocRef, {
        password: hashedPassword,
        createdAt: new Date(),
      });

      saveUserSession(username);
      console.log("User registered successfully");
      router.replace("/home");
    }
  }

  async function loginUser() {
    const userDocRef = doc(db, "deposits", username);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isPasswordCorrect = verifyPassword(password, userData.password);

      if (isPasswordCorrect) {
        console.log("Login successful");
        saveUserSession(username);
        router.replace("/home");
        // Save user session data here
      } else {
        console.error("Invalid password");
      }
    } else {
      console.error("No user found with this email");
    }
  }

  async function saveUserSession(id: string, isAdmin: boolean = false) {
    try {
      await AsyncStorage.setItem("userId", id);
      await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdmin));
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  const testStatus = 3 + 4;

  if (testStatus == 1) {
    return <PostponedPointsScreen />;
  } else if (testStatus == 2) {
    return <DeptAmount />;
  } else if (testStatus == 3) {
    return <OrderScreen />;
  } else if (testStatus == 4) {
    return <DepositScreen />;
  } else if (testStatus == 5) {
    return <MakeTransactionScreen />;
  } else if (testStatus == 6) {
    return <HomeScreen />;
  } else {
    return (
      <LoginPage
        login={loginUser}
        register={registerUser}
        updateUsername={setUsername}
        updatePassword={setPassword}
      />
    );
  }
}
