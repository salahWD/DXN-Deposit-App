import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface OrderFormProps {
  onSubmit: (memberId: string, memberName: string) => void;
}

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");

  useEffect(() => {
    const fetchLastOrderMemberId = async () => {
      const lastOrderMemberId = await AsyncStorage.getItem(
        "last_order_member_id"
      );
      const lastOrderMemberName = await AsyncStorage.getItem(
        "last_order_member_name"
      );
      if (lastOrderMemberId) {
        setMemberId(lastOrderMemberId);
      }
      if (lastOrderMemberName) {
        setMemberName(lastOrderMemberName);
      }
    };

    fetchLastOrderMemberId();
  }, []);

  const handleSubmit = async () => {
    if (memberId.trim()) {
      await AsyncStorage.setItem("last_order_member_id", memberId);
      await AsyncStorage.setItem("last_order_member_name", memberName);
      if (!memberId.trim() || !memberName.trim()) {
        alert("يرجى إدخال رقم العضوية واسم العضو");
        return;
      }
      onSubmit(memberId, memberName);
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
        <TextInput
          style={styles.input}
          value={memberName}
          onChangeText={setMemberName}
          placeholder="إسم العضو"
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
