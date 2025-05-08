import { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Text,
  Modal,
} from "react-native";
import React from "react";

import { ThemedView } from "@/components/ThemedView";
import ProductListing from "@/components/ProductListing";
import HeaderBox from "@/components/HeaderBox";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { router } from "expo-router";
import { depositAddProductsOrder } from "@/utils/functions";
import { Order, Product } from "@/utils/types";
import useAdminCheck from "@/contexts/useAdminCheck";

export default function OrderScreen() {
  const [orderProducts, setOrderProducts] = useState<Order[]>([]); // Array of {id, title, count}
  const [resetKey, setResetKey] = useState(0);

  const { userId } = useAdminCheck();

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
    console.log("order - handleChangedOrder - changed the OrderProducts state");
  };

  const handleSubmitOrder = async () => {
    if (userId) {
      const res = await depositAddProductsOrder(userId, orderProducts);
      setOrderProducts([]);
      setResetKey((prev) => prev + 1);
      if (res) {
        router.replace("/home");
      }
    } else {
      console.log("you have no user id please login first");
      router.replace("/");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <HeaderBox title="طلب نقاط مؤجلة" />

      <ThemedView style={styles.container}>
        <ProductListing updateOrder={handleChangedOrder} resetKey={resetKey} />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <View>
          <Pressable onPress={handleSubmitOrder}>
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
                إتمام الطلب
              </Text>
            </View>
          </Pressable>
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
