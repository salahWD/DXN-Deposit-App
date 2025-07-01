import useAdminCheck from "@/contexts/useAdminCheck";
import {
  adminFetchUserDepositAndOrders,
  adminMarkProductsAsReceived,
} from "@/utils/functions";
import { DepositProduct, Product } from "@/utils/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import HeaderBox from "@/components/HeaderBox";

import DepositProductListing from "@/components/DepositProductListing";
import { useLocalSearchParams } from "expo-router";

export default function DepositScreen() {
  const [products, setProducts] = useState<DepositProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { userId } = useLocalSearchParams();
  const { userId: adminId } = useAdminCheck();
  const [availableProducts, setAvailableProducts] = useState<DepositProduct[]>(
    []
  );
  // const [selectedProducts, setSelectedProducts] = useState<{id: string, title: string, count: number}[]>(
  //   []
  // );
  const [buttonLoading, setButtonLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (userId && typeof userId == "string") {
      const loadData = async () => {
        adminFetchUserDepositAndOrders(
          userId,
          setProducts,
          setAvailableProducts,
          setError,
          setLoading
        );
      };
      loadData();
    } else {
      setError("لا يوجد معرف مستخدم");
      console.log("no userId found");
      return;
    }
  }, [userId]);

  const handleChangedOrder = (product: Product, count: number) => {
    // setSelectedProducts(availableProducts.map(p => ({id: p.id, title: p.title, count: p.count})));
    setAvailableProducts((prev) => {
      const existingProduct = prev.find((p) => p.id === product.id);
      if (existingProduct) {
        if (count === 0) {
          return prev.filter((p) => p.id !== product.id);
        }
        return prev.map((p) => (p.id === product.id ? { ...p, count } : p));
      }
      if (count > 0) {
        return [
          ...prev,
          {
            id: product.id,
            title: product.title.ar,
            count,
            received: false, // Force admin logic: always unreceived
            points: false, // default to false unless used for points screen
          },
        ];
      }
      return prev;
    });
  };

  const handleSaveDepositProducts = async () => {
    if (buttonLoading) return;
    setButtonLoading(true);

    if (userId && typeof userId == "string") {
      const res = await adminMarkProductsAsReceived(userId, adminId, availableProducts);
      if (res) {
        router.replace("/home");
      }
      setResetKey((prev) => prev + 1);
      setButtonLoading(false);
    } else {
      console.log("no user id please select a valid user");
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.squaresContainer}>
        <View style={styles.container}>
          <HeaderBox title="صندوق الودائع" />
          <ThemedView style={styles.content}>
            <Text>جاري التحميل...</Text>
          </ThemedView>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox title="صندوق الودائع" />

        {products.length === 0 ? (
          <ThemedView style={{ ...styles.content, flex: 1 }}>
            <Text style={styles.dangerAlert}>لا يوجد طلبات</Text>
          </ThemedView>
        ) : (
          <DepositProductListing
            updateOrder={handleChangedOrder}
            resetKey={resetKey}
            availableProducts={availableProducts}
          />
        )}

        <View style={{ ...styles.content, paddingTop: 12 }}>
          <TextInput
            style={styles.input}
            placeholder="ملاحظات (إجباري)"
            value={notes}
            onChangeText={setNotes}
          />
          <TouchableOpacity onPress={() => handleSaveDepositProducts()}>
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
              {!buttonLoading && (
                <>
                  <Icon name="cart-outline" style={{ fontSize: 25 }} />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    إستلام المنتجات
                  </Text>
                </>
              )}
              {buttonLoading && (
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  جاري التحميل...
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 4,
    width: "100%",
    borderRadius: 4,
  },
  dropdownButtonStyle: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 3,
    paddingTop: 3,
    paddingBottom: 3,
  },
  dropdownButtonTxtStyle: {
    textAlign: "center",
    marginHorizontal: "auto",
    fontSize: 12,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonArrowStyle: {
    fontSize: 16,
  },
  dropdownMenuStyle: {
    backgroundColor: "white",
    borderRadius: 6,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#151E26",
  },

  recievedBtn: {
    marginLeft: 6,
  },
  squaresContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  container: {
    height: "100%",
    width: "100%",
  },
  content: {
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
  list: { flex: 1 },
  productItem: {
    padding: 12,
    paddingRight: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productTitle: { fontSize: 16, flex: 1 },
  statusLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
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
});
