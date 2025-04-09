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

console.log("index - page");

export default function IndexScreen() {
  const [memberCode, setMemberCode] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkUserState() {
      try {
        const Id = await getUserSession();
        if (Id) {
          const userDocRef = doc(db, "deposits", Id);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData?.isAdmin == true) {
              await saveUserSession(Id, true);
              router.replace("/admin");
            } else {
              router.replace("/home");
            }
          }
        }
      } catch (error) {
        console.error("Error in checkUserState:", error);
      }
    }

    checkUserState();
  }, []);

  function verifyPassword(inputPassword: string, storedHashedPassword: string) {
    const hashedInputPassword = CryptoJS.SHA256(inputPassword).toString();
    return hashedInputPassword === storedHashedPassword;
  }

  async function registerUser() {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const userDocRef = doc(db, "deposits", memberCode);

    const isRegisteredUser = await getDoc(doc(db, "deposits", memberCode));

    console.log(
      "is this user registered before ? ==>",
      isRegisteredUser.exists()
    );

    if (isRegisteredUser.exists()) {
      alert("رقم العضوية هذا مسجل بالفعل, جرّب تسجيل الدخول");
    } else {
      await setDoc(userDocRef, {
        password: hashedPassword,
        createdAt: new Date(),
      });

      saveUserSession(memberCode);
      console.log("User registered successfully");
      router.replace("/home");
    }
  }

  async function loginUser() {
    const userDocRef = doc(db, "deposits", memberCode);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isPasswordCorrect = verifyPassword(password, userData.password);

      if (isPasswordCorrect) {
        console.log("Login successful");
        saveUserSession(memberCode);
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
      await AsyncStorage.setItem("member_code", id);
      await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdmin));
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  return (
    <LoginPage
      login={loginUser}
      register={registerUser}
      updateMemberCode={setMemberCode}
      updatePassword={setPassword}
    />
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 45,
  },
  formRow: {
    marginBottom: 12,
    borderBottomColor: "#999",
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    color: "#666",
  },
  input: {
    paddingVertical: 6,
    fontSize: 16,
  },
});
