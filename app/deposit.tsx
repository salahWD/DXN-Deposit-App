import { useEffect, useState } from "react";
import { getUserSession } from "@/utils/functions";
import { DepositProduct } from "@/utils/types";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, FlatList, View, Pressable, Text } from "react-native";

import { getFirestore, doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { useRouter } from "expo-router";
import React from "react";

const getStatusLabel = (product: DepositProduct) => {
  const { paid, received, points } = product;
  if (paid && received && points) return { label: "تم كلياً", color: "green" };
  if (paid && received) return { label: "إستلمت ولم تنزل", color: "orange" };
  if (paid && points) return { label: "بقي استلام المنتج", color: "blue" };
  if (received && points) return { label: "نزلت ولم تدفع", color: "red" };
  if (paid) return { label: "دفعت فقط", color: "blue" };
  if (received) return { label: "منتج سلفة", color: "red" };
  if (points) return { label: "نقاط بدون دفع او استلام", color: "red" };
  return { label: "طلب معلق", color: "gray" };
};

export { getStatusLabel };

export default function DepositScreen() {
  const [products, setProducts] = useState<DepositProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    const checkAdminStatus = async () => {
      const userId = await getUserSession();

      if (userId) {
        const depositRef = doc(db, "deposits", userId);
        unsubscribe = onSnapshot(
          depositRef,
          (snapshot) => {
            const data = snapshot.data();
            if (data && data.products) {
              setProducts(data.products);
              setError(null);
            } else {
              setProducts([]);
              setError("لا توجد منتجات في وديعتك حاليًا");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching deposit:", error);
            setError("غير متصل بالإنترنت أو حدث خطأ. حاول لاحقًا.");
            setProducts([]);
            setLoading(false);
          }
        );
      } else {
        console.log("no user id please login");
        router.replace("/");
      }
    };
    checkAdminStatus();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoBack = () => {
    router.replace("/home");
  };

  const renderProduct = ({ item }: { item: DepositProduct }) => {
    const { label, color } = getStatusLabel(item);
    return (
      <View style={styles.productItem}>
        <Text style={styles.productTitle}>
          {item.title} (x{item.count})
        </Text>
        <Text style={[styles.statusLabel, { color }]}>{label}</Text>
      </View>
    );
  };

  const summary = () => {
    const toPay = products
      .filter((p) => !p.paid)
      .reduce((value, p) => (value += p.count), 0);
    const toReceive = products
      .filter((p) => p.paid && !p.received)
      .reduce((value, p) => (value += p.count), 0);
    const pointsPending = products
      .filter((p) => p.paid && p.received && !p.points)
      .reduce((value, p) => (value += p.count), 0);
    return (
      <View style={styles.summary}>
        <Text style={styles.summaryText}>عليك دفع سعر {toPay} منتجات</Text>
        <Text style={styles.summaryText}>
          لديك {toReceive} منتجات لإستلامها
        </Text>
        <Text style={styles.summaryText}>
          {pointsPending} منتجات لم تنزل نقاطها بعد
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>جارٍ التحميل...</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
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
              صندوق الودائع
            </ThemedText>
          </ThemedView>
          {error && <Text style={styles.error}>{error}</Text>}
          {summary()}
          {products.length === 0 ? (
            <Text style={styles.dangerAlert}>لا يوجد طلبات</Text>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item, index) => index.toString()}
              style={styles.list}
            />
          )}
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
  summary: {
    marginBottom: 16,
  },
  summaryText: {
    textAlign: "right",
  },
  list: { flex: 1 },
  productItem: {
    padding: 12,
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
