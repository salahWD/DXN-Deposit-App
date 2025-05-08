import { ScrollView, StyleSheet, View, Pressable, Text } from "react-native";
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

  const squareData = [
    {
      id: 0,
      title: "النقاط المؤجلة",
      color: "#9C27B0",
      value: depositPoints,
      adminOnly: false,
    },
    {
      id: 1,
      title: "المنتجات الباقية",
      color: "#FF9800",
      value: depositProductsCount,
      adminOnly: false,
    },
    {
      id: 2,
      title: "المبلغ المطلوب",
      color: "#2196F3",
      value: depositAmount + "TL",
      adminOnly: false,
    },
    {
      id: 3,
      title: "طلب جديد",
      color: "#4CAF50",
      value: "+",
      adminOnly: false,
    },
    {
      id: 4,
      title: "سداد مبلغ",
      color: "#2196F3",
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
      adminOnly: false,
    },
    {
      id: 5,
      adminOnly: true,
      title: "طلبات تنزيل النقاط",
      color: "#7b0c8e",
      value: "خاص بالإدارة",
    },
    {
      id: 6,
      adminOnly: true,
      title: "طلبات المنتجات",
      color: "#e18600",
      value: "خاص بالإدارة",
    },
    {
      id: 7,
      adminOnly: true,
      title: "طلبات السداد",
      color: "darkblue",
      value: "خاص بالإدارة",
    },
    {
      id: 8,
      adminOnly: true,
      title: "التقارير",
      color: "darkgreen",
      value: "خاص بالإدارة",
    },
    {
      id: 9,
      adminOnly: true,
      title: "إدارة الودائع",
      color: "green",
      value: "خاص بالإدارة",
    },
  ];

  const { products } = useProducts();

  const { isAdmin, userId, isLoading } = useAdminCheck();

  useEffect(() => {
    const getStats = async () => {
      if (userId) {
        const stats = await homePageStats(userId, products);
        if (stats) {
          setDepositProductsCount(stats.depositProductsCount);
          setDepositPoints(stats.postponedPoints);
          setDepositAmount(stats.depositAmount);
        }
      } else {
        console.log("there is no user id");
      }
    };
    getStats();
  }, [isLoading]);

  const handleSquarePress = (route: number) => {
    console.log(route, "route");
    if (route == 0) {
      router.replace("/postponedPoints");
    } else if (route == 1) {
      router.replace("/deposit");
    } else if (route == 2) {
      router.replace("/deptAmount");
    } else if (route == 3) {
      router.replace("/order");
    } else if (route == 4) {
      router.replace("/makeTransaction");
    } else if (route == 5) {
      router.replace("/PointsOrders");
    } else if (route == 6) {
      router.replace("/admin");
    } else if (route == 7) {
      router.replace("/TransactionsOrders");
    } else if (route == 8) {
      router.replace("/reports");
    } else if (route == 9) {
      router.replace("/depositManagement");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("isAdmin");
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
        {squareData.map((item, index) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <View
              key={index}
              style={[styles.square, { backgroundColor: item.color }]}
            >
              <Pressable onPress={() => handleSquarePress(item.id)}>
                <View style={{ alignItems: "center" }}>
                  <ThemedText style={styles.squareText}>
                    {item.title}
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.squareValue}>
                    {item.value}
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View
        style={[
          styles.square,
          { width: "100%", minHeight: 60, backgroundColor: "red" },
        ]}
      >
        <Pressable onPress={() => logout()}>
          <View style={{ alignItems: "center" }}>
            <ThemedText style={styles.squareText}>تسجيل الخروج</ThemedText>
          </View>
        </Pressable>
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
  squareText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  squareValue: { color: "white", opacity: 0.75, marginTop: 10, fontSize: 14 },
});
