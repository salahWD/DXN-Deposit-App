import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Order, OrderProducts } from "@/utils/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  approveOrder,
  subscribeToOrders,
  rejectOrder,
} from "@/utils/functions";

const AdminPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(setOrders);
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <View>
      {orders.length === 0 ? (
        <Text>لا يوجد طلبات</Text>
      ) : (
        orders.map((order: Order) => (
          <View key={order.id} style={styles.orderBox}>
            <Text style={styles.orderTitle}>العضوية: {order.userId}</Text>
            {order.products.map((product: OrderProducts, idx) => (
              <View style={styles.productRow}>
                <Text key={idx} style={styles.productTitle}>
                  {product.title}{" "}
                </Text>
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
        ))
      )}
    </View>
  );
};

export default AdminPage;

const styles = StyleSheet.create({
  orderBox: {
    marginVertical: 10,
    elevation: 1, // Shadow for Android
    padding: 10,
    borderRadius: 8,
  },
  orderTitle: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
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
    flex: 1,
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
});
