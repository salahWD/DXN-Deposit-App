import { useState } from "react";
import { depositSubmitTransaction } from "@/utils/functions";
import useAdminCheck from "@/contexts/useAdminCheck";
import { router, useLocalSearchParams } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";

import React from "react";
import HeaderBox from "@/components/HeaderBox";

export default function MakeTransactionScreen() {
  const { userId, currentDeptAmount } = useLocalSearchParams();
  const { userId: adminId } = useAdminCheck();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError("يرجى إدخال مبلغ صالح");
      return;
    }

    setLoading(true);
    setError("");
    const makeTransactionOrder = async () => {
      const res = await depositSubmitTransaction(
        userId as string,
        adminId,
        parseFloat(amount),
        note || ""
      );
      if (res) {
        alert("تم تعديل الرصيد!");
        router.replace("/home");
      } else {
        console.log("خطأ في تعديل الرصيد");
      }
    };
    makeTransactionOrder();
  };

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox title="إضافة مبلغ" />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
          <ThemedView style={{ gap: 12 }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                marginBottom: 8,
                fontWeight: "600",
                color: "#374151",
              }}
            >
              الرصيد الحالي ( {currentDeptAmount}TL )
            </Text>
            <Text
              style={{
                textAlign: "right",
                fontSize: 16,
                fontWeight: "600",
                color: "#374151",
              }}
            >
              المبلغ المطلوب (TL)
            </Text>
            <TextInput
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#D1D5DB",
                borderWidth: 1,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 14,
                fontSize: 16,
                color: "#111827",
              }}
              keyboardType="numeric"
              placeholder="أدخل المبلغ"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#D1D5DB",
                borderWidth: 1,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 14,
                fontSize: 16,
                color: "#111827",
              }}
              placeholder="الملاحظات (اختياري)"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              style={{
                backgroundColor: "#06b6d4",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {loading ? "جاري التحميل..." : "إرسال"}
              </Text>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  recievedBtn: {
    marginLeft: 6,
  },
  squaresContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  container: { height: "100%", width: "100%" },
  content: {
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
  list: { flex: 1 },
  productItem: {
    padding: 12,
    paddingRight: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productTitle: { fontSize: 16, flex: 1 },
  statusLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  error: { color: "red", marginBottom: 16 },
  dangerAlert: {
    marginVertical: 6,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingTop: 10,
    textAlign: "center",
    borderColor: "#F88379",
    backgroundColor: "#F8837960",
  },
  card: {
    overflow: "hidden",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContainer: {
    padding: 18,
  },
  cardTint: {
    width: "100%",
    height: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280", // gray-500
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827", // text-gray-900
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginHorizontal: 4,
  },
  period: {
    fontSize: 18,
    color: "#6b7280",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  disabledText: {
    textDecorationLine: "line-through",
    color: "#9ca3af", // gray-400
  },
  button: {
    backgroundColor: "#06b6d4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
