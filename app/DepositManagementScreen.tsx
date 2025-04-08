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

const DepositManagementScreen = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ title: "", count: 1 });
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionNote, setTransactionNote] = useState("");

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
    if (!newProduct.title || newProduct.count <= 0) return;
    await addProductToDeposit(userId, newProduct.title, newProduct.count);
    setNewProduct({ title: "", count: 1 });
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
              {item.products.map((product, index) => (
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
              <TextInput
                style={styles.input}
                placeholder="عنوان المنتج"
                value={newProduct.title}
                onChangeText={(text) =>
                  setNewProduct({ ...newProduct, title: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Count"
                value={newProduct.count.toString()}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setNewProduct({ ...newProduct, count: parseInt(text) || 1 })
                }
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
});

export default DepositManagementScreen;
