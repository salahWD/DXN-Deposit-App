import { useState } from "react";
import { getReportStats } from "@/utils/functions";
import useAdminCheck from "@/contexts/useAdminCheck";
import { router } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Pressable,
  BackHandler,
} from "react-native";

import React, { useEffect } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useProducts } from "@/contexts/ProductContext";

export default function Reports() {
  const [error, setError] = useState("");
  // const [totalDept, setTotalDept] = useState(0);
  // const [totalProducts, setTotalProducts] = useState(0);
  // const [totalPoints, setTotalPoints] = useState(0);

  const { isLoading } = useAdminCheck();
  const { products } = useProducts();

  const backAction = () => {
    router.replace("/(reports)");
    return true;
  };

  BackHandler.addEventListener("hardwareBackPress", backAction);

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
          <ThemedView style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151" }}>
              المبلغ المطلوب (TL)
            </Text>
          </ThemedView>
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
});
