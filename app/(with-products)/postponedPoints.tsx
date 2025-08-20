import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import HeaderBox from "@/components/HeaderBox";
import OrderForm from "@/components/OrderForm";
import ProductListing from "@/components/ProductListing";
import { ThemedView } from "@/components/ThemedView";
import { useProducts } from "@/contexts/ProductContext";
import useAdminCheck from "@/contexts/useAdminCheck";
import { submitPointsOrder } from "@/utils/functions";
import { Product } from "@/utils/types";

export default function PostponedPointsScreen() {
  const { products: productsData } = useProducts();
  const { userId } = useAdminCheck();

  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sendRequestLoading, setSendRequestLoading] = useState(false);

  // Derived: orderProducts based on selectedProducts
  const orderProducts = useMemo(() => {
    return Object.entries(selectedProducts).map(([id, count]) => {
      const product = productsData.find((p) => p.id == id);
      return {
        id: Number(id),
        title: product?.title?.ar || "",
        count,
      };
    });
  }, [selectedProducts, productsData]);

  useEffect(() => {
    console.log("=========== orderProducts ==========");
    console.log(orderProducts);
  }, [orderProducts]);

  // Derived: totalPoints based on selectedProducts
  useEffect(() => {
    const total = Object.entries(selectedProducts).reduce((sum, [id, count]) => {
      const product = productsData.find((p) => p.id == id);
      return product ? sum + product.points * count : sum;
    }, 0);
    setTotalPoints(total);
    console.log("calculating total points", total);
  }, [selectedProducts, productsData]);

  // Handles product quantity changes
  const handleChangedOrder = useCallback((product: Product, count: number) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev };
      if (count > 0) {
        updated[product.id] = count;
      } else {
        delete updated[product.id];
      }
      return updated;
    });
  }, []);

  // Submits the order
  const handleSubmitOrder = async (orderMemberId: string, memberName: string) => {
    if (!userId) {
      console.log("you have no user id please login first");
      router.replace("/");
      return;
    }

    if (sendRequestLoading) return;

    setSendRequestLoading(true);
    console.log("=========== orderProducts ==========");
    console.log(orderProducts);

    const res = await submitPointsOrder(userId, orderMemberId, memberName, orderProducts);
    if (res) {
      setSelectedProducts({});
      setResetKey((prev) => prev + 1);
      router.replace("/home");
    }
    setSendRequestLoading(false);
  };

  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  return (
    <ThemedView style={styles.container}>
      <HeaderBox title="النقاط المؤجلة" />

      <ThemedView style={styles.container}>
        <ProductListing updateOrder={handleChangedOrder} resetKey={resetKey} />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <Pressable onPress={handleOpenModal}>
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
                  تنزيل نقاط مؤجلة
                </Text>
              </View>
            </Pressable>
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
              <Text>{totalPoints}</Text>
            </View>
          </View>

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCloseModal}
            hardwareAccelerated={true}
            presentationStyle="overFullScreen"
            statusBarTranslucent={true}
            supportedOrientations={["portrait", "landscape"]}
            onDismiss={handleCloseModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <OrderForm
                  onSubmit={(memberId, memberName) => {
                    console.log("Form submitted with value:", memberId, "and name: ", memberName);
                    handleSubmitOrder(memberId, memberName);
                    handleCloseModal();
                  }}
                />
              </View>
            </View>
          </Modal>
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
