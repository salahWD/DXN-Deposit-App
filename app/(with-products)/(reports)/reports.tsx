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
import { ThemedText } from "@/components/ThemedText";
import { useProducts } from "@/contexts/ProductContext";
import { DepositProduct } from "@/utils/types";

export default function Reports() {
  const [error, setError] = useState("");
  const [totalDept, setTotalDept] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [deptsDetails, setDeptsDetails] = useState<
    { id: string; deptAmount: number }[]
  >([]);
  const [productsDetails, setProductsDetails] = useState<
    { id: string; products: DepositProduct[] }[]
  >([]);

  const { isAdmin, isLoading } = useAdminCheck();
  const { products } = useProducts();

  useEffect(() => {
    const getStats = async () => {
      const {
        totalDeptAmount,
        totalProducts,
        totalPoints,
        deptsDetails,
        productsDetails,
      } = await getReportStats(products);
      setTotalDept(totalDeptAmount);
      setTotalProducts(totalProducts);
      setTotalPoints(totalPoints);
      setDeptsDetails(deptsDetails);
      setProductsDetails(productsDetails);
      setLoaded(true);
    };
    getStats();
  }, [isLoading]);

  const handleRoute = (path: string, data: Record<string, any>) => () => {
    if (!isAdmin) {
      setError("ليس لديك صلاحية للوصول إلى هذه الصفحة");
      return;
    }
    const query = new URLSearchParams({
      data: JSON.stringify(data),
    }).toString();
    router.push(`${path}?${query}`);
  };

  const backAction = () => {
    router.replace("/home");
    return true;
  };

  BackHandler.addEventListener("hardwareBackPress", backAction);

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox title="التقارير" />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
          <View style={[styles.square, { backgroundColor: "brown" }]}>
            <TouchableOpacity
              disabled={!loaded}
              onPress={handleRoute("/depts", deptsDetails)}
            >
              <View style={{ alignItems: "center" }}>
                <ThemedText style={styles.squareText}>كل الديون</ThemedText>
                <ThemedText type="subtitle" style={styles.squareValue}>
                  {totalDept ? Math.round(totalDept) + " TL" : "لا يوجد دين"}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.square, { backgroundColor: "orange" }]}>
            <TouchableOpacity
              disabled={!loaded}
              onPress={handleRoute("/depositProducts", productsDetails)}
            >
              <View style={{ alignItems: "center" }}>
                <ThemedText style={styles.squareText}>
                  كل المنتجات المتبقية
                </ThemedText>
                <ThemedText type="subtitle" style={styles.squareValue}>
                  {totalProducts ? totalProducts : "لا منتجات متبقية"}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.square, { backgroundColor: "darkblue" }]}>
            <TouchableOpacity
              disabled={!loaded}
              onPress={handleRoute("/points", {})}
            >
              <View style={{ alignItems: "center" }}>
                <ThemedText style={styles.squareText}>
                  كل النقاط المعلقة
                </ThemedText>
                <ThemedText type="subtitle" style={styles.squareValue}>
                  {totalPoints ? totalPoints : "لا نقاط معلقة"}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          {/* <ThemedView style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151" }}>
              المبلغ المطلوب (TL)
            </Text>
          </ThemedView> */}
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
