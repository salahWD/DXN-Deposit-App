import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import LoginPage from "@/components/LoginPage";
import useAdminCheck from "@/contexts/useAdminCheck";
import CryptoJS from "crypto-js";
import { router } from "expo-router";
import React from "react";

export default function IndexScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isAdmin, userId } = useAdminCheck();

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
        // Save user session data here
        saveUserSession(username);
        router.replace("/home");
      } else {
        console.error("Invalid password");
      }
    } else {
      console.error("No user found with this email");
    }
  }

  async function saveUserSession(id: string) {
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
