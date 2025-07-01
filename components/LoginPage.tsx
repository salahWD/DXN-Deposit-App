import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import React, { useState } from "react";

console.log("index - page");

interface LoginPageProps {
  login: () => Promise<void>;
  register: () => Promise<void>;
  updateUsername: React.Dispatch<React.SetStateAction<string>>;
  updatePassword: React.Dispatch<React.SetStateAction<string>>;
}

export default function LoginPage({
  login,
  register,
  updateUsername,
  updatePassword,
}: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 35,
        minHeight: "100%",
        width: "100%",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          flex: 1,
        }}
      >
        <Text style={{ fontSize: 35 }}>
          {isRegister ? "إنشاء حساب" : "تسجيل الدخول"}
        </Text>
        <View style={styles.form}>
          <View style={styles.formRow}>
            <Text style={styles.label}>إسم المستخدم</Text>
            <TextInput
              style={styles.input}
              onChangeText={updateUsername}
              placeholder="أدخل إسم المستخدم"
              textContentType="username"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              textContentType="password"
              secureTextEntry={true}
              onChangeText={updatePassword}
              placeholder="كلمة المرور"
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Button
              title={isRegister ? "إنشاء حساب" : "تسجيل الدخول"}
              onPress={() => {
                Keyboard.dismiss();
                if (isRegister) {
                  register();
                } else {
                  login();
                }
              }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => {
                setIsRegister(!isRegister);
              }}
            >
              <Text style={{ textAlign: "center" }}>
                {!isRegister ? "إنشاء حساب" : "تسجيل الدخول"}
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
