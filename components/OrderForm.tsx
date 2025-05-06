import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  TextInput,
  Button,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

interface OrderFormProps {
  onSubmit: (data: string) => void;
}

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [memberId, setMemberId] = useState("");

  useEffect(() => {
    const fetchLastOrderMemberId = async () => {
      const lastOrderMemberId = await AsyncStorage.getItem(
        "last_order_member_id"
      );
      if (lastOrderMemberId) {
        setMemberId(lastOrderMemberId);
      }
    };

    fetchLastOrderMemberId();
  }, []);

  const handleSubmit = async () => {
    if (memberId.trim()) {
      await AsyncStorage.setItem("last_order_member_id", memberId);
      onSubmit(memberId);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={memberId}
          onChangeText={setMemberId}
          placeholder="رقم العضوية"
        />
        <Button title="تنزيل النقاط" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "80%",
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
