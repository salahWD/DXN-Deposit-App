import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { ThemedView } from "@/components/ThemedView";
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { depositSubmitTransaction } from "@/utils/functions";

import HeaderBox from "@/components/HeaderBox";
import useAdminCheck from "@/contexts/useAdminCheck";
import React, { useEffect } from "react";

export default function Reports() {
  const [error, setError] = useState("");
  const [debts, setDebts] = useState<any[]>([]);
  const [expandedDeposit, setExpandedDeposit] = useState<string | null>(null);
  const [totalDebts, setTotalDebts] = useState(0);
  const { userId: adminId } = useAdminCheck();
  const { data } = useLocalSearchParams();


  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");


  const handleSend = (userId: string) => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError("يرجى إدخال مبلغ صالح");
      return;
    }

    setLoading(true);
    setError("");
    const makeTransactionOrder = async () => {
      const res = await depositSubmitTransaction(
        userId,
        adminId,
        parseFloat(amount),
        note || "",
        true
      )
      if (res) {
        setLoading(false);
        alert("تم تقديم طلب السداد!");
        router.replace("/home");
      } else {
        console.log("خطأ في تقديم الطلب");
      }
    };
    makeTransactionOrder();
  };


  const handlePressed = (user: { deptAmount: number, id: string }) => {
    setExpandedDeposit(expandedDeposit === user.id ? null : user.id);
  };

  useEffect(() => {
    if (data) {
      console.log(data);
      try {
        const parsedData = JSON.parse(data as string);
        setDebts(parsedData);
        setTotalDebts(
          parsedData.reduce(
            (total: number, current: { deptAmount: number }) => {
              if (current.deptAmount < 0) return total;
              return total + current.deptAmount;
            },
            0
          ) || 0
        );
        console.log("Received debts:", parsedData);
      } catch (e) {
        console.error("Failed to parse passed data:", e);
      }
    }
  }, [data]);

  useEffect(() => {
    const backAction = () => {
      router.replace("/(reports)");
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, []);

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox
          title="كل الديون"
          handleGoBack={() => {
            router.replace("/(reports)");
          }}
        />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {debts.map((user, idx) => (
              <View key={idx}>
                <TouchableOpacity onPress={e => { handlePressed(user) }} >
                  <View style={{ marginBottom: 12 }}>
                    <View style={styles.card}>
                      <Text style={styles.title}>المستخدم: {user.id}</Text>
                      <Text style={styles.price}>
                        {user.deptAmount * -1}
                        <Text style={{ fontSize: 10 }}> TL</Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {user.id === expandedDeposit && (
                  <View style={{ marginBottom: 25 }}>
                    <ThemedView style={{ gap: 12 }}>
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
                        onPress={e => handleSend(user.id)}
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
                  </View>)}
              </View>
            ))}
            <View>
              <View
                style={{
                  ...styles.card,
                  paddingVertical: 16,
                  paddingHorizontal: 14,
                  backgroundColor: "#cfcfcf",
                }}
              >
                <Text style={styles.title}>الإجمالي:</Text>
                <Text style={styles.price}>
                  {totalDebts * -1}
                  <Text style={{ fontSize: 10 }}> TL</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  square: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 12,
    padding: 8,
  },
  squareText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  squareValue: { color: "white", opacity: 0.75, marginTop: 10, fontSize: 14 },

  card: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    alignItems: "center",
  },
  title: {
    marginLeft: 7,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    color: "#000",
  },
});
