import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  getUserSession,
  getUserSessionStatus,
  homePageStats,
} from "@/utils/functions";
import { useProducts } from "@/contexts/ProductContext"; // Adjust the path as needed
import React from "react";

export default function HomeScreen() {
  const [depositProductsCount, setDepositProductsCount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [admin, setAdmin] = useState(false);

  const squareData = [
    { title: "طلب جديد", color: "#4CAF50", value: "+", adminOnly: false }, // Green
    {
      title: "صندوق الودائع",
      color: "#2196F3",
      value: "45 منتج",
      adminOnly: false,
    }, // Blue
    {
      title: "عدد المنتجات المودوعة",
      color: "#FF9800",
      value: depositProductsCount,
      adminOnly: false,
    }, // Orange
    {
      title: "الرصيد الحالي",
      color: "#9C27B0",
      value: currentBalance + " TL",
      adminOnly: false,
    }, // Purple
    {
      adminOnly: true,
      title: "مراجعة الطلبات",
      color: "red",
      value: "خاص بالإدارة",
    },
    {
      adminOnly: true,
      title: "إدارة الودائع",
      color: "green",
      value: "خاص بالإدارة",
    },
  ];

  const { products, dollarPrice } = useProducts();

  useEffect(() => {
    const getStats = async () => {
      const status = await getUserSessionStatus();
      setAdmin(status);
      const Id = await getUserSession();

      if (Id) {
        const stats = await homePageStats(Id, dollarPrice, products);
        if (stats) {
          setDepositProductsCount(stats.depositProductsCount);
          setCurrentBalance(stats.balance);
        }
      } else {
        console.log("there is no user id");
      }
    };
    getStats();
  }, []);

  const handleSquarePress = (route: number) => {
    console.log(route);
    if (route == 0) {
      router.replace("/order");
    } else if (route == 1) {
      router.replace("/deposit");
      // } else if (route == 2) {
      // router.replace('/login');
      // } else {
      // router.replace('/login');
    } else if (route == 4) {
      router.replace("/admin");
    } else if (route == 5) {
      router.replace("/depositManagement");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ flex: 1, textAlign: "center" }}>
            أهلا وسهلا
          </ThemedText>
        </ThemedView>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 15,
          }}
        >
          {squareData.map((item, index) => {
            if (item.adminOnly && !admin) return null;
            return (
              <View
                key={index}
                style={[styles.square, { backgroundColor: item.color }]}
              >
                <Pressable onPress={() => handleSquarePress(index)}>
                  <View style={{ alignItems: "center" }}>
                    <ThemedText style={styles.squareText}>
                      {item.title}
                    </ThemedText>
                    <ThemedText
                      type="subtitle"
                      style={{ color: "white", opacity: 0.75, marginTop: 10 }}
                    >
                      {item.value}
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  squaresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  square: {
    width: "47%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  squareText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});
