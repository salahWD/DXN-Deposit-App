import { useEffect, useState } from "react";
import {
  getUserSession,
  fetchUserDepositAndOrders,
  markProductsAsReceived,
} from "@/utils/functions";
import { DepositProduct } from "@/utils/types";
import useAdminCheck from "@/contexts/useAdminCheck";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, FlatList, View, Pressable, Text } from "react-native";

import React from "react";
import HeaderBox from "@/components/HeaderBox";

const getStatusLabel = (product: DepositProduct) => {
  const { received } = product;
  if (received == undefined) return { label: "طلب معلّق", color: "gray" };
  if (!received) return { label: "لم تُستَلَم", color: "red" };
  return { label: "نقاط مؤجلة", color: "orange" };
};

export { getStatusLabel };

export default function DepositScreen() {
  const [products, setProducts] = useState<DepositProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAdminCheck();

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        fetchUserDepositAndOrders(userId, setProducts, setError, setLoading);
      };
      loadData();
    } else {
      return;
    }
  }, [userId]);

  const handleMarkAsReceived = async (index?: number) => {
    try {
      let updatedProducts: DepositProduct[] = [];

      if (index !== undefined) {
        updatedProducts = products.map((prod, i) =>
          i === index ? { ...prod, received: true } : prod
        );
      } else {
        updatedProducts = products
          .map((product) => {
            if (product.received === undefined || product.received)
              return product;
            return { ...product, received: true };
          })
          .filter((p): p is DepositProduct => p !== undefined);
      }

      setProducts(updatedProducts);

      await markProductsAsReceived(
        userId,
        updatedProducts.filter(
          (p) => p?.received != undefined && (p.received || !p.received)
        )
      );
    } catch (error) {
      console.error("Failed to mark products as received:", error);
      // Optional: show error message to user
    }
  };

  const renderProduct = ({ item, index }: { item: DepositProduct }) => {
    const { label, color } = getStatusLabel(item);
    return (
      <View style={styles.productItem}>
        <Text style={styles.productTitle}>
          {item.title} (x{item.count})
        </Text>
        <Text style={[styles.statusLabel, { color }]}>{label}</Text>
        {item?.received != undefined && !item.received && (
          <Pressable onPress={() => handleMarkAsReceived(index)}>
            <View style={styles.recievedBtn}>
              <Icon
                name="check-bold"
                style={{
                  fontSize: 20,
                  padding: 5,
                  backgroundColor: "#3ef2a1",
                  color: "#505050",
                  borderRadius: 8,
                }}
              />
            </View>
          </Pressable>
        )}
        {item?.received != undefined && item.received && (
          <View style={styles.recievedBtn}>
            <Icon
              name="check-bold"
              style={{
                fontSize: 20,
                padding: 5,
                backgroundColor: "#E9ECEF",
                color: "#505050",
                borderRadius: 8,
              }}
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.squaresContainer}>
        <View style={styles.container}>
          <HeaderBox title="صندوق الودائع" />
          <ThemedView style={styles.content}>
            <Text>جارٍ التحميل...</Text>
          </ThemedView>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox title="صندوق الودائع" />
        {error && (
          <ThemedView style={styles.content}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        {products.length === 0 ? (
          <ThemedView style={{ ...styles.content, flex: 1 }}>
            <Text style={styles.dangerAlert}>لا يوجد طلبات</Text>
          </ThemedView>
        ) : (
          <FlatList
            data={products}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={renderProduct}
            keyExtractor={(item, index) => index.toString()}
            style={styles.list}
          />
        )}
        <ThemedView style={{ ...styles.content, paddingTop: 12, flex: "none" }}>
          <Pressable onPress={() => handleMarkAsReceived()}>
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
                إستلام كل المنتجات
              </Text>
            </View>
          </Pressable>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
