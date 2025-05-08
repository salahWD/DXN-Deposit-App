import { useEffect, useState } from "react";
import { fetchUserAccountStatement } from "@/utils/functions";
import { Transaction } from "@/utils/types";
import useAdminCheck from "@/contexts/useAdminCheck";

import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Pressable,
  Text,
} from "react-native";

import React from "react";
import HeaderBox from "@/components/HeaderBox";

const FeatureItem = ({
  text,
  enabled = true,
}: {
  text: string;
  enabled?: boolean;
}) => (
  <View style={styles.featureItem}>
    <Text style={[styles.featureText, !enabled && styles.disabledText]}>
      {text}
    </Text>
  </View>
);

export default function DeptAmount() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAdminCheck();

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        fetchUserAccountStatement(
          userId,
          setTransactions,
          setError,
          setLoading
        );
      };
      loadData();
    } else {
      return;
    }
  }, [userId]);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <View style={styles.card}>
        <View
          style={{
            ...styles.cardTint,
            backgroundColor: item.amount > 0 ? "lightgreen" : "red",
          }}
        ></View>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>
            بواسطة: {item?.adminId ? item?.adminId : "انت"}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.amount}</Text>
            <Text style={styles.currency}>TL</Text>
          </View>

          <View style={styles.featureItem}>
            <View
              style={{
                borderBottomColor: "#777",
                marginBottom: 4,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            {item?.note && <FeatureItem text={item.note} />}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.squaresContainer}>
        <View style={styles.container}>
          <HeaderBox title="كشف الحساب" />
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text>جارٍ التحميل...</Text>
          </ThemedView>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox title="كشف الحساب" />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        {transactions.length === 0 ? (
          <ThemedView style={{ ...styles.content, flex: 1 }}>
            <Text style={styles.dangerAlert}>لا يوجد معاملات مالية</Text>
          </ThemedView>
        ) : (
          <FlatList
            data={transactions}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 24,
              gap: 12,
            }}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => index.toString()}
            style={styles.list}
          />
        )}
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
  container: { height: "100%", width: "100%" },
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
  card: {
    overflow: "hidden",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContainer: {
    padding: 18,
  },
  cardTint: {
    width: "100%",
    height: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280", // gray-500
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827", // text-gray-900
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginHorizontal: 4,
  },
  period: {
    fontSize: 18,
    color: "#6b7280",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  disabledText: {
    textDecorationLine: "line-through",
    color: "#9ca3af", // gray-400
  },
  button: {
    backgroundColor: "#06b6d4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
