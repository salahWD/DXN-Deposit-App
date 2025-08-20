import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import HeaderBox from "@/components/HeaderBox";
import ProductListing from "@/components/ProductListing";
import { ThemedView } from "@/components/ThemedView";
import { useProducts } from "@/contexts/ProductContext";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import useAdminCheck from "@/contexts/useAdminCheck";
import { depositAddProductsOrder, productPrice } from "@/utils/functions";
import { Product } from "@/utils/types";
import { router } from "expo-router";


export default function OrderScreen() {
  const { products, dollarPrice } = useProducts();
  const [orderProducts, setOrderProducts] = useState<{ id: number; title: string; count: number }[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);

  const { userId } = useAdminCheck();

  // Calculate total points and total price
  const { totalPoints, totalPrice } = useMemo(() => {
    let points = 0;
    let price = 0;

    orderProducts.forEach((orderedProduct) => {
      const product = products.find((p) => p.id === orderedProduct.id);
      if (product) {
        points += product.points * orderedProduct.count;
        price += productPrice(dollarPrice, product.price * orderedProduct.count);
      }
    });

    return { totalPoints: points, totalPrice: price };
  }, [orderProducts, products]);

  const handleChangedOrder = (product: Product, count: number) => {
    setOrderProducts((prev) => {
      const existingProduct = prev.find((p) => p.id === product.id);
      if (existingProduct) {
        if (count === 0) {
          return prev.filter((p) => p.id !== product.id);
        }
        return prev.map((p) => (p.id === product.id ? { ...p, count } : p));
      }
      if (count > 0) {
        return [...prev, { id: product.id, title: product.title.ar, count }];
      }
      return prev;
    });
    console.log("order - handleChangedOrder - changed the OrderProducts state");
  };

  const handleSubmitOrder = async () => {
    if (buttonLoading) return;
    setButtonLoading(true);
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
    setButtonLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <HeaderBox title="طلب نقاط مؤجلة" />

      <ThemedView style={styles.container}>
        <ProductListing updateOrder={handleChangedOrder} resetKey={resetKey} />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <TouchableOpacity onPress={handleSubmitOrder}>
            <View
              style={{
                gap: 4,
                padding: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                backgroundColor: "#4FFFB0",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!buttonLoading && (
                <>
                  <Icon name="cart-outline" style={{ fontSize: 25 }} />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    إتمام الطلب
                  </Text>
                </>
              )}
              {buttonLoading && (
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  جاري التحميل ...
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              minWidth: 60,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#4FFFB0",
            }}
          >
            <Text>النقاط</Text>
            <Text>{totalPoints}</Text>
          </View>
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              minWidth: 60,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#4FFFB0",
            }}
          >
            <Text>السعر</Text>
            <Text>{totalPrice}</Text>
          </View>
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
