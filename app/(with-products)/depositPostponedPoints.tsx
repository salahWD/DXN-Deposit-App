import { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import DepositProductListing from "@/components/DepositProductListing";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { router, useLocalSearchParams } from "expo-router";
import { AdminAddPoints } from "@/utils/functions";
import { DepositProduct, Order, Product } from "@/utils/types";
import React from "react";
import HeaderBox from "@/components/HeaderBox";
import useAdminCheck from "@/contexts/useAdminCheck";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function DepositPostponedPointsScreen() {
  const { userId } = useLocalSearchParams();
  const { userId: adminId } = useAdminCheck();

  const [orderProducts, setOrderProducts] = useState<Order[]>([]); // Array of {id, title, count}
  const [resetKey, setResetKey] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [depositProducts, setDepositProducts] = useState<DepositProduct[]>([]);

  useEffect(() => {
    const getDepositProducts = async () => {
      if (!userId) {
        console.log("Error: no user ID is found");
        return;
      }

      try {
        const depositRef = doc(db, "deposits", userId);
        const snapshot = await getDoc(depositRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setDepositProducts(data.products || []);
        } else {
          setDepositProducts([]);
        }
      } catch (error) {
        console.error("Error fetching deposit:", error);
      }
    };

    getDepositProducts();
  }, [userId]);

  const handleChangedOrder = (product: Product, count: number) => {
    setOrderProducts((prev) => {
      const existingProduct = prev.find((p) => p.id === product.id);
      if (existingProduct) {
        if (count === 0) {
          // Remove product if count is 0
          return prev.filter((p) => p.id !== product.id);
        }
        // Update count for existing product
        return prev.map((p) => (p.id === product.id ? { ...p, count } : p));
      }
      if (count > 0) {
        // Add new product if count > 0
        return [...prev, { id: product.id, title: product.title.ar, count }];
      }
      return prev;
    });
  };

  const handleSavePoints = async () => {
    if (isButtonLoading) return;
    setIsButtonLoading(true);

    if (userId && typeof userId == "string") {
      const res = await AdminAddPoints(adminId, userId, orderProducts);
      if (res) {
        router.replace("/home");
      }
      setOrderProducts([]);
      setResetKey((prev) => prev + 1);
      setIsButtonLoading(false);
    } else {
      console.log("no user id please select a valid user");
      router.replace("/");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <HeaderBox title="النقاط المؤجلة" />

      <ThemedView style={styles.container}>
        <DepositProductListing
          updateOrder={handleChangedOrder}
          resetKey={resetKey}
          availableProducts={depositProducts}
        />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <View>
          <TouchableOpacity onPress={handleSavePoints}>
            <View
              style={{
                width: "100%",
                gap: 8,
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#4FFFB0",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="cart-outline" style={{ fontSize: 25 }} />
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                حفظ النقاط
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 16,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
});
