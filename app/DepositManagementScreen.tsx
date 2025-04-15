import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import {
  fetchDeposits,
  addProductToDeposit,
  editProductInDeposit,
  removeProductFromDeposit,
  addTransactionToDeposit,
  calculateBalance,
  getUserSession,
} from "@/utils/functions"; // Adjust path to your functions.ts

import { useState, useEffect } from "react";
import { router } from "expo-router";

import { Deposit, DepositProduct, Transaction } from "@/utils/types";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useProducts } from "@/contexts/ProductContext";
import { orderStatuses } from "@/utils/types";
import SelectDropdown from "react-native-select-dropdown"; // Import SelectDropdown
import React from "react";

const DepositManagementScreen = () => {
  const { products } = useProducts(); // Fetch products from ProductContext
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [newProductCount, setNewProductCount] = useState<
    string | number | null
  >(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = fetchDeposits((depositsData) => {
      setDeposits(depositsData);
    });
    return () => unsubscribe();
  }, []);

  const handleGoBack = () => {
    router.replace("/home");
  };

  const addProduct = async (userId: string) => {
    if (
      !selectedProductId ||
      parseInt(newProductCount?.toString() || "0") <= 0 ||
      !selectedStatus
    )
      return;
    const selectedProduct = products.find(
      (p) => p.id.toString() === selectedProductId
    );
    if (selectedProduct) {
      const { paid, points, received } = selectedStatus?.details;
      await addProductToDeposit(
        userId,
        selectedProduct.title.ar,
        newProductCount,
        paid,
        points,
        received
      );
      setNewProductCount(1);
      setSelectedProductId(null);
      setSelectedStatus(null);
    }
  };

  const editProduct = async (
    userId: string,
    product: DepositProduct,
    newCount: number
  ) => {
    const currentProducts = deposits.find((d) => d.userId === userId)!.products;
    await editProductInDeposit(userId, product.id, newCount, currentProducts);
  };

  const removeProduct = async (userId: string, productId: string | number) => {
    const currentProducts = deposits.find((d) => d.userId === userId)!.products;
    await removeProductFromDeposit(userId, productId, currentProducts);
  };

  const addTransaction = async (userId: string) => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount === 0) return;
    const adminId = await getUserSession();
    if (adminId) {
      await addTransactionToDeposit(
        userId,
        adminId,
        amount,
        transactionNote || undefined
      );
      setTransactionAmount("");
      setTransactionNote("");
      console.log("transaction added: " + amount);
    } else {
      router.replace("/");
      console.log("user is not logged in");
    }
  };

  const renderDeposit = ({ item }: { item: Deposit }) => {
    if (item?.transactions) {
      const balance = calculateBalance(item?.transactions);
      const isExpanded = expandedUserId === item.userId;
      return (
        <SafeAreaView style={styles.depositItem}>
          <TouchableOpacity
            onPress={() => setExpandedUserId(isExpanded ? null : item.userId)}
          >
            <Text style={styles.userId}>العضوية: {item.userId}</Text>
            <Text style={{ textAlign: "right" }}>
              الرصيد: {balance} (إجمالي {item.transactions.length} عملية)
            </Text>
            <Text style={{ textAlign: "right" }}>
              المنتجات: {item.products.length}
            </Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* Product List */}
              <Text style={styles.sectionTitle}>المنتجات</Text>
              {item?.products?.map((product, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productTitle}>
                    {product.title} (x{product.count})
                  </Text>
                  <View style={styles.buttonsContainer}>
                    <View style={styles.controlsBtns}>
                      <TouchableOpacity
                        onPress={() =>
                          editProduct(item.userId, product, product.count + 1)
                        }
                      >
                        <View style={styles.button}>
                          <Text>+</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          editProduct(item.userId, product, product.count - 1)
                        }
                      >
                        <View style={styles.button}>
                          <Text>-</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.deleteProductBtn}>
                      <Pressable
                        onPress={() => removeProduct(item.userId, product.id)}
                      >
                        <Icon
                          name="trash-can-outline"
                          style={{
                            fontSize: 18,
                          }}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              {/* Add Product */}
              <Text style={styles.sectionTitle}>إضافة منتج</Text>
              <SelectDropdown
                statusBarTranslucent={true}
                defaultValue={"اختر منتجًا"}
                data={products.map((product) => ({
                  label: product.title.ar,
                  value: product.id.toString(),
                }))}
                onSelect={(val) => {
                  setSelectedProductId(val.value);
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {selectedItem?.label || "اختر منتجًا"}
                      </Text>
                      <Icon
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        style={styles.dropdownButtonArrowStyle}
                      />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && { backgroundColor: "#E9ECEF" }),
                      }}
                    >
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item?.label}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
              <SelectDropdown
                statusBarTranslucent={true}
                defaultValue={"اختر الحالة"}
                data={orderStatuses}
                onSelect={setSelectedStatus}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {selectedItem?.title || "اختر الحالة"}
                      </Text>
                      <Icon
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        style={styles.dropdownButtonArrowStyle}
                      />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && { backgroundColor: "#E9ECEF" }),
                      }}
                    >
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item?.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
              <TextInput
                style={styles.input}
                placeholder="Count"
                value={newProductCount?.toString() || ""}
                keyboardType="numeric"
                onChangeText={(text) => setNewProductCount(text || "")}
              />
              <Button
                title="إضافة منتج"
                onPress={() => addProduct(item.userId)}
              />

              {/* Transactions */}
              <Text style={styles.sectionTitle}>إضافة عملية مالية</Text>
              <TextInput
                style={styles.input}
                placeholder="المبلغ"
                value={transactionAmount}
                keyboardType="numeric"
                onChangeText={setTransactionAmount}
              />
              <TextInput
                style={styles.input}
                placeholder="ملاحظات (اختياري)"
                value={transactionNote}
                onChangeText={setTransactionNote}
              />
              <Button
                title="إضافة العملية"
                onPress={() => addTransaction(item.userId)}
              />
            </View>
          )}
        </SafeAreaView>
      );
    } else {
      return <Text>No transactions</Text>;
    }
  };

  return (
    <ThemedView style={styles.container}>
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
            إدارة الصناديق
          </ThemedText>
        </ThemedView>
        <FlatList
          data={deposits}
          renderItem={renderDeposit}
          keyExtractor={(item) => item.userId}
          ListEmptyComponent={<Text>No deposits found</Text>}
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  buttonsContainer: {
    flexDirection: "row-reverse",
    gap: 4,
  },
  controlsBtns: {
    flexDirection: "row",
    gap: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  deleteProductBtn: {
    borderRadius: 4,
    backgroundColor: "#ff6e6e",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  button: {
    // red color => "#ff6e6e"
    // green color => "#32de84"
    backgroundColor: "#E9ECEF",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  depositItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  userId: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  expandedContent: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "right",
  },
  productRow: {
    gap: 6,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  productTitle: { flex: 1, textAlign: "right" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginVertical: 4 },

  dropdownButtonStyle: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 3,
    paddingTop: 3,
    paddingBottom: 3,
    marginTop: 8,
  },
  dropdownButtonTxtStyle: {
    textAlign: "center",
    marginHorizontal: "auto",
    fontSize: 16,
    paddingVertical: 4,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonArrowStyle: {
    fontSize: 18,
  },
  dropdownMenuStyle: {
    backgroundColor: "white",
    borderRadius: 6,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  dropdownItemTxtStyle: {
    textAlign: "right",
    paddingVertical: 3,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#151E26",
  },
});

export default DepositManagementScreen;
