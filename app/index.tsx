import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";
import CryptoJS from "crypto-js";
import LoginPage from "@/components/LoginPage";
import React from "react";
import useAdminCheck from "@/contexts/useAdminCheck";

export default function IndexScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isAdmin, userId } = useAdminCheck();
  console.log(
    "from index, isAdmin => (",
    isAdmin,
    ") userId => (",
    userId,
    ")"
  );
  useEffect(() => {
    if (userId) {
      saveUserSession(userId);
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

  async function saveUserSession(id: string) {
    console.log("save user session ", id);
    try {
      await AsyncStorage.setItem("userId", id);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  return (
    <LoginPage
      login={loginUser}
      register={registerUser}
      updateUsername={setUsername}
      updatePassword={setPassword}
    />
  );
}
