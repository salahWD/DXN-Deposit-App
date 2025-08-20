import { deleteDeposit, fetchDeposits, homePageStats } from "@/utils/functions"; // Adjust path to your functions.ts
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { router } from "expo-router";
import { useEffect, useState } from "react";

import { Deposit } from "@/utils/types";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useProducts } from "@/contexts/ProductContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import React from "react";


const DepositManagementScreen = () => {
  const { products } = useProducts();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const unsubscribe = fetchDeposits((depositsData) => {
      setDeposits(depositsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (expandedUserId && !userStats[expandedUserId]) {
        const stats = await homePageStats(expandedUserId, products);
        console.log(stats);
        setUserStats((prev) => ({ ...prev, [expandedUserId]: stats }));
      }
    };
    loadStats();
  }, [expandedUserId]);

  useEffect(() => {
    console.log(userStats, "userStats");
  }, [userStats]);

  const navigateToPage = (page: string, data: Record<string, any>) => {
    const query = new URLSearchParams(data).toString();
    router.push(`${page}?${query}`);
  };

  const handleGoBack = () => {
    router.navigate("/home");
  };

  const renderDeposit = ({ item: deposit }: { item: Deposit }) => {
    const isExpanded = expandedUserId === deposit.userId;
    const stats = userStats[deposit.userId];

    return (
      <SafeAreaView style={styles.depositItem}>
        <TouchableOpacity
          onPress={() => setExpandedUserId(isExpanded ? null : deposit.userId)}
        >
          <Text style={styles.userId}>المستخدم: {deposit.userId}</Text>
        </TouchableOpacity>

        {isExpanded && stats && (
          <View style={styles.expandedContainer}>
            <View style={styles.expandedContent}>
              <View style={[styles.square, { backgroundColor: "#9C27B0" }]}>
                <TouchableOpacity
                  onPress={() =>
                    navigateToPage("/depositPostponedPoints", {
                      userId: deposit.userId,
                    })
                  }
                >
                  <View style={{ alignItems: "center" }}>
                    <ThemedText style={styles.squareText}>
                      النقاط المؤجلة
                    </ThemedText>
                    <ThemedText type="subtitle" style={styles.squareValue}>
                      {stats.postponedPoints}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.square, { backgroundColor: "#FF9800" }]}>
                <TouchableOpacity
                  onPress={() =>
                    navigateToPage("/depositProducts", { userId: deposit.userId })
                  }
                >
                  <View style={{ alignItems: "center" }}>
                    <ThemedText style={styles.squareText}>
                      المنتجات الباقية
                    </ThemedText>
                    <ThemedText type="subtitle" style={styles.squareValue}>
                      {stats.depositProductsCount}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.square, { backgroundColor: "#2196F3" }]}>
                <TouchableOpacity
                  onPress={() =>
                    navigateToPage("/depositTransactions", {
                      userId: deposit.userId,
                      currentDeptAmount: stats.depositAmount,
                    })
                  }
                >
                  <View style={{ alignItems: "center" }}>
                    <ThemedText style={styles.squareText}>
                      الرصيد المالي
                    </ThemedText>
                    <ThemedText type="subtitle" style={styles.squareValue}>
                      {stats.depositAmount}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "تأكيد الحذف",
                  "هل أنت متأكد أنك تريد حذف هذا الصندوق؟",
                  [
                    {
                      text: "إلغاء",
                      style: "cancel",
                    },
                    {
                      text: "نعم، احذف",
                      style: "destructive",
                      onPress: () => deleteDeposit(deposit.userId),
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <View style={[styles.square, { backgroundColor: "#f32821ff", width: "100%", minHeight: 42 }]}>
                <View style={{ alignItems: "center", flexDirection: "row", gap: 4 }}>
                  <ThemedText style={styles.squareText}>
                    حذف الصندوق
                  </ThemedText>
                  <Icon
                    name="trash-can-outline"
                    style={{
                      fontSize: 24,
                      color: "white"
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isExpanded && !stats && <Text>جارٍ التحميل...</Text>}
      </SafeAreaView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <Pressable onPress={handleGoBack}>
            <Icon
              name="chevron-left"
              style={{
                fontSize: 25,
                backgroundColor: "#E9ECEF",
                borderRadius: 8,
                padding: 8,
              }}
            />
          </Pressable>
          <ThemedText type="title" style={{ flex: 1, textAlign: "right" }}>
            إدارة الصناديق
          </ThemedText>
        </ThemedView>
        <FlatList
          data={deposits}
          renderItem={renderDeposit}
          keyExtractor={(item) => item.userId.toString()}
          ListEmptyComponent={<Text>No deposits found</Text>}
        />
      </ThemedView>
    </ThemedView>
  );
};

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
    justifyContent: "space-between",
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row-reverse",
    gap: 4,
  },
  controlsBtns: {
    flexDirection: "row",
    gap: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  deleteProductBtn: {
    borderRadius: 4,
    backgroundColor: "#ff6e6e",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  button: {
    backgroundColor: "#E9ECEF",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  depositItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  userId: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  expandedContainer: {
    justifyContent: "space-between",
  },
  expandedContent: {
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  square: {
    width: "32%",
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 8,
    padding: 8,
  },
  squareText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  squareValue: { color: "white", opacity: 0.75, marginTop: 10, fontSize: 12 },
});

export default DepositManagementScreen;
