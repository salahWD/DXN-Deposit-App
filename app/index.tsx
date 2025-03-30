import { useFonts } from 'expo-font';
import { getUserSession } from "@/utils/functions";

import { KeyboardAvoidingView, ScrollView, StyleSheet, View, Text, TextInput, Button, Pressable, } from 'react-native';

import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';
import CryptoJS from 'crypto-js';


console.log("index - page")


export default function IndexScreen() {
  
  const [isRegister, setIsRegister] = useState(false);
  const [memberCode, setMemberCode] = useState("");
  const [password, setPassword] = useState("");
  
  const [isMounted, setIsMounted] = useState(false);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  useEffect(() => {
    if (isMounted && loaded) {
      async function checkUserState() {
        const Id = await getUserSession();
        console.log(Id);
        if (Id) {
          console.log('User is logged in:', Id);
          router.replace('/home');
        } else {
          console.log('User should login');
        }
      }

      checkUserState();
    }
  }, [isMounted, loaded]);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  function verifyPassword(inputPassword: string, storedHashedPassword: string) {
    const hashedInputPassword = CryptoJS.SHA256(inputPassword).toString();
    return hashedInputPassword === storedHashedPassword;
  }

  async function registerUser() {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const userDocRef = doc(db, 'deposits', memberCode);

    const isRegisteredUser = await getDoc(doc(db, 'deposits', memberCode));

    console.log("is this user registered before ? ==>", isRegisteredUser.exists())

    if (isRegisteredUser.exists()) {
      alert("رقم العضوية هذا مسجل بالفعل, جرّب تسجيل الدخول")
    }else {
      
      await setDoc(userDocRef, {
        password: hashedPassword,
        createdAt: new Date(),
      });
  
      saveUserSession(memberCode);
      console.log('User registered successfully');
      router.replace('/home');
    }
  }

  async function loginUser() {
    const userDocRef = doc(db, 'deposits', memberCode);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isPasswordCorrect = verifyPassword(password, userData.password);

      if (isPasswordCorrect) {
        console.log('Login successful');
        saveUserSession(memberCode);
        router.replace('/home');
        // Save user session data here
      } else {
        console.error('Invalid password');
      }
    } else {
      console.error('No user found with this email');
    }
  }

  async function saveUserSession(id: string) {
    await AsyncStorage.setItem('member_code', id);
  }

  return (
    <ScrollView contentContainerStyle={{ alignItems: "center", justifyContent: "center", paddingVertical: 35, minHeight: "100%" }}>
      <KeyboardAvoidingView style={{ alignItems: "center", justifyContent: "center", width: "100%", flex: 1 }}>
        <Text style={{ fontSize: 35 }}>{isRegister ?  'إنشاء حساب': 'تسجيل الدخول' }</Text>
        <View style={styles.form}>
          <View style={styles.formRow}>
            <Text style={styles.label}>رقم العضوية</Text>
            <TextInput
              keyboardType='numeric'
              style={styles.input}
              onChangeText={setMemberCode}
              value={memberCode}
              placeholder="رقم عضوية دي اكس ان"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              placeholder="كلمة المرور"
            />
          </View>
          <View style={{ marginBottom: 8, }}>
            <Button title={isRegister ?  'إنشاء حساب': 'تسجيل الدخول' } onPress={() => {
              if (isRegister) {
                registerUser()
              }else {
                loginUser()
              }
            }} />
          </View>
          <View style={{ marginBottom: 8, }}>
            <Pressable onPress={() => {
              setIsRegister(!isRegister)
            }}>
              <Text style={{ textAlign: "center",  }}>
                {!isRegister ?  'إنشاء حساب': 'تسجيل الدخول' }
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
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