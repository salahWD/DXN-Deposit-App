import { useState } from "react";
import { StyleSheet, View, Pressable, Text, Modal } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import DepositProductListing from "@/components/DepositProductListing";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { router, useLocalSearchParams } from "expo-router";
import { AdminAddPoints, submitPointsOrder } from "@/utils/functions";
import { Order, Product } from "@/utils/types";
import React from "react";
import OrderForm from "@/components/OrderForm";
import HeaderBox from "@/components/HeaderBox";

export default function DepositPostponedPointsScreen() {
  const { userId } = useLocalSearchParams();
  console.log(userId, "userId in DepositPostponedPointsScreen");
  const [orderProducts, setOrderProducts] = useState<Order[]>([]); // Array of {id, title, count}
  const [resetKey, setResetKey] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sendRequestLoading, setSendRequestLoading] = useState(false);

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

  const handleAddPoints = async (orderMemberId: string) => {
    if (userId && typeof userId == "string") {
      if (!sendRequestLoading) {
        setSendRequestLoading(true);
        const res = await AdminAddPoints(
          userId,
          userId,
          orderMemberId,
          orderProducts
        );
        setOrderProducts([]);
        setResetKey((prev) => prev + 1);
        if (res) {
          setSendRequestLoading(false);
          router.replace("/home");
        }
      }
    } else {
      console.log("no user id please select a valid user");
      router.replace("/");
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <HeaderBox title="النقاط المؤجلة" />

      <ThemedView style={styles.container}>
        <DepositProductListing
          userId={userId as string}
          updateOrder={handleChangedOrder}
          resetKey={resetKey}
        />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <View>
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
                  onSubmit={(value) => {
                    console.log("Form submitted with value:", value);
                    handleAddPoints(value);
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
