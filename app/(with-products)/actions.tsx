import { useEffect, useState } from "react";
import { fetchUserAccountStatement, fetchUserActions } from "@/utils/functions";
import { Action } from "@/utils/types";
import useAdminCheck from "@/contexts/useAdminCheck";

import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";

import React from "react";
import HeaderBox from "@/components/HeaderBox";

export default function DeptAmount() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAdminCheck();

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        fetchUserActions(userId, setActions, setError, setLoading);
      };
      loadData();
    } else {
      return;
    }
  }, [userId]);

  const renderActions = ({ item }: { item: Action }) => {
    console.log(item);
    console.log(item?.created_at);
    return (
      <View style={styles.card}>
        <View
          style={{
            ...styles.cardTint,
            backgroundColor:
              item?.products && item.products.length > 0
                ? "#F97A00"
                : item?.amount && item.amount > 0
                ? "#213448"
                : item?.amount &&
                  item?.userId &&
                  !item?.products &&
                  item?.adminId
                ? "lightgreen"
                : "#9C27B0",
          }}
        ></View>
        <View style={styles.cardContainer}>
          <View
            style={{ justifyContent: "space-between", flexDirection: "row" }}
          >
            <Text style={styles.title}>
              بواسطة:{" "}
              <Text style={{ fontSize: 12 }}>
                {item?.adminId ? item?.adminId : "انت"}
              </Text>
            </Text>
            <Text style={styles.title}>
              بتاريخ:{" "}
              <Text style={{ fontSize: 12 }}>
                {new Date(item?.created_at?.seconds * 1000)
                  .toISOString()
                  .slice(0, 10)}
              </Text>
            </Text>
          </View>
          <Text style={styles.price}>
            {item.title}{" "}
            <Text style={styles.period}>
              {item?.products
                ? item.products.length > 1
                  ? "(منتجات"
                  : "(منتج"
                : ""}{" "}
              {item?.products && item.products.length + ")"}
            </Text>
          </Text>
          <View>
            {item?.products && (
              <FlatList
                style={{
                  ...styles.productItem,
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
                data={item?.products}
                renderItem={({ item }) => {
                  return <Text>{`\u2022 ${item.title} (x${item.count})`}</Text>;
                }}
              />
            )}
          </View>

          <View style={styles.featureItem}>
            <View
              style={{
                borderBottomColor: "#777",
                marginBottom: 4,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            {item?.notes && item?.notes.trim().length && (
              <View style={{ flex: 1 }}>
                <Text style={{ ...styles.statusLabel, textAlign: "right" }}>
                  ملاحظة:
                </Text>
                {item?.notes && (
                  <Text
                    style={{
                      textAlign: "right",
                      lineHeight: 20,
                      paddingRight: 12,
                    }}
                  >
                    {item.notes}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.squaresContainer}>
        <View style={styles.container}>
          <HeaderBox title="معاملاتي" />
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
        <HeaderBox title="معاملاتي" />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        {actions.length === 0 ? (
          <ThemedView style={{ ...styles.content, flex: 1 }}>
            <Text style={styles.dangerAlert}>لا يوجد معاملات مالية</Text>
          </ThemedView>
        ) : (
          <FlatList
            data={actions}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 24,
              gap: 12,
            }}
            renderItem={renderActions}
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
    textAlign: "right",
    flex: 1,
    paddingRight: 8,
    marginTop: 8,
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
    textAlign: "center",
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
