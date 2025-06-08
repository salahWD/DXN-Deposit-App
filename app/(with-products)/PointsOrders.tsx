import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import useAdminCheck from "@/contexts/useAdminCheck";
import { useProducts } from "@/contexts/ProductContext";
import HeaderBox from "@/components/HeaderBox";
import React, { useEffect, useState } from "react";
import { Order, OrderProducts } from "@/utils/types";
import {
  approvePointsOrder,
  rejectPointsOrder,
  subscribeToPointsOrders,
} from "@/utils/functions";

const pointsOrders = () => {
  const { isLoading, userId: adminId } = useAdminCheck();
  const [actionLoading, setActionLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const { products } = useProducts();

  useEffect(() => {
    const unsubscribe = subscribeToPointsOrders((val) => {
      setOrders(val);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={styles.squaresContainer}>
      <HeaderBox title="طلبات النقاط" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 14 }}
      >
        {orders.length === 0 ? (
          <Text style={styles.dangerAlert}>لا يوجد طلبات</Text>
        ) : (
          orders.map((order: Order, index) => (
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
                {order?.products?.length > 0 &&
                  order?.products.map((product: OrderProducts, idx) => (
                    <View style={styles.productRow} key={idx}>
                      <Text style={styles.productTitle}>{product.title} </Text>
                      <Text style={{ textAlign: "left" }}>
                        (x{product.count})
                      </Text>
                    </View>
                  ))}
                <View style={styles.buttonsContainer}>
                  <View
                    style={{ ...styles.button, backgroundColor: "#ff6e6e" }}
                  >
                    <TouchableOpacity
                      onPress={async () => {
                        if (!actionLoading) {
                          setActionLoading(true);
                          await rejectPointsOrder(order.id);
                          setActionLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.buttonText}>
                        رفض الطلب
                        <Icon
                          name="close-thick"
                          style={{
                            fontSize: 16,
                          }}
                        />
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.button}>
                    <TouchableOpacity
                      onPress={async () => {
                        if (!actionLoading) {
                          setActionLoading(true);
                          await approvePointsOrder(order, products, adminId);
                          setActionLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.buttonText}>
                        قبول الطلب
                        <Icon
                          name="check-bold"
                          style={{
                            fontSize: 16,
                          }}
                        />
                      </Text>
                    </TouchableOpacity>
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

export default pointsOrders;

const styles = StyleSheet.create({
  squaresContainer: {
    backgroundColor: "#fff",
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
