import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Order, OrderProducts } from "@/utils/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  approveOrder,
  subscribeToOrders,
  rejectOrder,
} from "@/utils/functions";
import React from "react";

const AdminPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((va) => {
      console.log(va);
      setOrders(va);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingVertical: 14 }}
    >
      {orders.length === 0 ? (
        <Text style={styles.dangerAlert}>لا يوجد طلبات</Text>
      ) : (
        orders.map((order: Order, index) => (
          <View key={index} style={styles.orderBox}>
            <Text style={styles.orderTitle}>
              {order?.username}{" "}
              <Text style={{ color: "#ababab" }}>[{order.userId}]</Text>
            </Text>
            <View
              style={{
                borderBottomColor: "#777",
                marginBottom: 4,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            <Text style={{ textAlign: "center", color: "#777" }}>
              العضوية: {order?.orderMemberId}
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
              {order.products.map((product: OrderProducts, idx) => (
                <View style={styles.productRow} key={idx}>
                  <Text style={styles.productTitle}>{product.title} </Text>
                  <Text style={{ textAlign: "left" }}>(x{product.count})</Text>
                </View>
              ))}
              <View style={styles.buttonsContainer}>
                <View style={{ ...styles.button, backgroundColor: "#ff6e6e" }}>
                  <Pressable onPress={() => rejectOrder(order.id)}>
                    <Text style={styles.buttonText}>
                      رفض الطلب
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
                  <Pressable onPress={() => approveOrder(order)}>
                    <Text style={styles.buttonText}>
                      قبول الطلب
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
  );
};

export default AdminPage;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
  },
  orderBox: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    // padding: 10,
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
    // red color => "#ff6e6e"
    // green color => "#32de84"
    backgroundColor: "#32de84",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonText: {
    // color: "white",
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
