import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Text,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { getUserSession, homePageStats } from "@/utils/functions";
import { useProducts } from "@/contexts/ProductContext";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAdminCheck from "@/contexts/useAdminCheck";

import { Colors } from "@/constants/Colors";

export default function HomeScreen() {
  const [depositProductsCount, setDepositProductsCount] = useState(0);
  const [depositPoints, setDepositPoints] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  const userPages = [
    {
      id: 0,
      title: "النقاط المؤجلة",
      color: "#9C27B0",
      route: "/postponedPoints",
      value: depositPoints,
    },
    {
      id: 1,
      title: "المنتجات الباقية",
      color: "#FF9800",
      route: "/deposit",
      value: depositProductsCount,
    },
    {
      id: 2,
      title: "الرصيد المالي",
      color: "#2196F3",
      route: "/deptAmount",
      value: -1 * depositAmount + "TL",
    },
    {
      id: 3,
      title: "طلب جديد",
      color: "#4CAF50",
      route: "/order",
      value: "+",
    },
    {
      id: 4,
      title: "سداد مبلغ",
      color: "#2196F3",
      route: "/makeTransaction",
      value: (
        <Text
          style={{
            fontSize: 24,
            lineHeight: 24,
          }}
        >
          $
        </Text>
      ),
    },
    {
      id: 5,
      title: "معاملاتي",
      color: "#0B1D51",
      route: "/actions",
      value: "الأرشيف",
    },
  ];
  const adminPages = [
    {
      id: 0,
      title: "طلبات تنزيل النقاط",
      color: "#7b0c8e",
      route: "/PointsOrders",
      value: "خاص بالإدارة",
    },
    {
      id: 1,
      title: "طلبات المنتجات",
      color: "#e18600",
      route: "/admin",
      value: "خاص بالإدارة",
    },
    {
      id: 2,
      title: "طلبات السداد",
      color: "darkblue",
      route: "/TransactionsOrders",
      value: "خاص بالإدارة",
    },
    {
      id: 3,
      title: "التقارير",
      color: "darkgreen",
      route: "/(reports)",
      value: "خاص بالإدارة",
    },
    {
      id: 4,
      title: "إدارة الودائع",
      color: "green",
      route: "/depositManagement",
      value: "خاص بالإدارة",
    },
  ];

  const { products } = useProducts();

  const { isAdmin, userId, isLoading } = useAdminCheck();
  console.log("from home, isAdmin => (", isAdmin, ") userId => (", userId, ")");

  useEffect(() => {
    const getStats = async () => {
      if (!userId || !products || products.length === 0 || isLoading) return;

      try {
        const stats = await homePageStats(userId, products);
        if (stats) {
          setDepositProductsCount(stats.depositProductsCount);
          setDepositPoints(stats.postponedPoints);
          setDepositAmount(stats.depositAmount);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    getStats();
  }, [userId, products, isLoading]);

  const handleSquarePress = (route: string) => {
    console.log(route, "route");
    router.replace(route);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userId");
    router.replace("/");
  };

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{
        padding: 32,
        paddingTop: 50,
        paddingHorizontal: 28,
      }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{ fontSize: 24, flex: 1, textAlign: "center" }}
        >
          أهلا وسهلا ({"اسم المستخدم"})
        </ThemedText>
      </ThemedView>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {(!isAdmin ? userPages : adminPages).map((item, index) => (
          <View
            key={index}
            style={[styles.square, { backgroundColor: item.color }]}
          >
            <Pressable onPress={() => handleSquarePress(item.route)}>
              <View style={{ alignItems: "center" }}>
                <ThemedText style={styles.squareText}>{item.title}</ThemedText>
                <ThemedText type="subtitle" style={styles.squareValue}>
                  {item.value}
                </ThemedText>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={[styles.square, styles.logoutSquare]}>
        <TouchableOpacity
          onPress={() => logout()}
          style={styles.logoutSquareTouchable}
        >
          <View style={{ alignItems: "center" }}>
            <ThemedText style={styles.squareText}>تسجيل الخروج</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    minHeight: "100%",
    gap: 16,
    backgroundColor: Colors.background,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  square: {
    width: "32%",
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 12,
    padding: 8,
  },
  logoutSquare: {
    width: "100%",
    minHeight: 60,
    backgroundColor: "red",
    padding: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },
  logoutSquareTouchable: {
    width: "100%",
    height: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  squareText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  squareValue: { color: "white", opacity: 0.75, marginTop: 10, fontSize: 14 },
});
