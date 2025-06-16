import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Pressable,
  BackHandler,
  ScrollView,
} from "react-native";

import React, { useEffect } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useProducts } from "@/contexts/ProductContext";
import { ThemedText } from "@/components/ThemedText";

export default function Reports() {
  const [error, setError] = useState("");
  const [deposits, setDeposits] = useState<any[]>([]);
  // const [depositProducts, setDepositProducts] = useState(0);
  const { products } = useProducts();
  const { data } = useLocalSearchParams();

  useEffect(() => {
    if (data) {
      try {
        const parsedData = JSON.parse(data as string);
        setDeposits(parsedData);
        console.log("Received deposits:", parsedData);
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

    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  const handleFilterPress = (value) => {};

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox
          title="المنتجات المتبقية"
          handleGoBack={() => {
            router.replace("/(reports)");
          }}
        />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        <View
          style={{
            ...styles.content,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <View style={styles.square}>
            <Pressable onPress={() => handleFilterPress(true)}>
              <View style={{ alignItems: "center" }}>
                <ThemedText style={styles.squareText}>حسب المستخدم</ThemedText>
              </View>
            </Pressable>
          </View>
          <View style={styles.square}>
            <Pressable onPress={() => handleFilterPress(false)}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.squareText}>حسب المنتج</Text>
              </View>
            </Pressable>
          </View>
        </View>
        {/* <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 45 }}
        >
          {deposits.map((user, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <View style={styles.card}>
                <Text style={styles.title}>المستخدم: {user.id}</Text>
                <Text style={styles.price}>
                  {(user?.products && user.products.length) || 0}
                  <Text style={{ fontSize: 10 }}> منتج </Text>
                </Text>
              </View>
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
                {deposits.reduce((total, user) => {
                  if (!user?.products || user?.products?.length <= 0)
                    return total;
                  return total + user.products.length;
                }, 0)}
                <Text style={{ fontSize: 10 }}> منتج </Text>
              </Text>
            </View>
          </View>
        </ScrollView> */}
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
    flex: 1,
    padding: 32,
    paddingTop: 12,
    paddingBottom: 0,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "white",
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
