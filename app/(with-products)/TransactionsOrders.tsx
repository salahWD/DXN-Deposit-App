import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import useAdminCheck from "@/contexts/useAdminCheck";
import HeaderBox from "@/components/HeaderBox";
import React, { useEffect, useState } from "react";
import { TransactionOrder } from "@/utils/types";
import {
  approveTransactionOrder,
  rejectTransactionOrder,
  subscribeToTransactionOrders,
} from "@/utils/functions";

const TransactionsOrders = () => {
  const { isLoading, userId } = useAdminCheck();

  const [orders, setOrders] = useState<TransactionOrder[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToTransactionOrders((val) => {
      setOrders(val);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={styles.squaresContainer}>
      <HeaderBox title="طلبات السداد" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 14 }}
      >
        {orders.length === 0 ? (
          <Text style={styles.dangerAlert}>لا يوجد طلبات سداد</Text>
        ) : (
          orders.map((order: TransactionOrder, index) => (
            <View key={index} style={styles.orderBox}>
              <Text style={styles.orderTitle}>{order?.userId} </Text>
              <View
                style={{
                  borderBottomColor: "#777",
                  marginBottom: 4,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                }}
              />
              <Text style={{ textAlign: "center", color: "#777" }}>
                المبلغ: {order.amount}
              </Text>
              <View
                style={{
                  borderBottomColor: "#777",
                  marginTop: 4,
                  marginBottom: 6,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                }}
              />
              <View style={{ padding: 10, paddingBottom: 6 }}>
                <Text style={styles.productTitle}>{order?.note}</Text>
                <View style={styles.buttonsContainer}>
                  <View
                    style={{ ...styles.button, backgroundColor: "#ff6e6e" }}
                  >
                    <Pressable
                      onPress={() =>
                        order.id && rejectTransactionOrder(order.id)
                      }
                    >
                      <Text style={styles.buttonText}>
                        رفض السداد
                        <Icon
                          name="close-thick"
                          style={{
                            fontSize: 16,
                          }}
                        />
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.button}>
                    <Pressable
                      onPress={() =>
                        order.id &&
                        order.userId &&
                        approveTransactionOrder(order.id, order.userId, userId)
                      }
                    >
                      <Text style={styles.buttonText}>
                        قبول السداد
                        <Icon
                          name="check-bold"
                          style={{
                            fontSize: 16,
                          }}
                        />
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionsOrders;

const styles = StyleSheet.create({
  squaresContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  container: {
    paddingHorizontal: 32,
    height: "100%",
    width: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderBox: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingTop: 0,
    borderRadius: 10,
  },
  orderTitle: {
    backgroundColor: "#87CEEB70",
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: 10,
    paddingBottom: 8,
  },
  productRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 10,
    paddingBlock: 2,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  productTitle: {
    textAlign: "right",
    marginBlock: 2,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#32de84",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: "center",
  },
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
