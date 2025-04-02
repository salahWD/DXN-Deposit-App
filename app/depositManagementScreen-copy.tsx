import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { Deposit, DepositProduct, Transaction } from "@/utils/types";

const DepositManagementScreen = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ title: "", count: 1 });
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const db = getFirestore();
  const router = useRouter();
  const adminId = "CURRENT_ADMIN_ID"; // Replace with your auth logic

  useEffect(() => {
    const depositsRef = collection(db, "deposits");
    const unsubscribe = onSnapshot(
      depositsRef,
      (snapshot) => {
        const depositsData = snapshot.docs.map((doc) => ({
          userId: doc.id,
          products: doc.data().products || [],
          transactions: doc.data().transactions || [],
        }));
        setDeposits(depositsData);
      },
      (error) => {
        console.error("Error fetching deposits:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const calculateBalance = (transactions: Transaction[]) => {
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  };

  const addProduct = async (userId: string) => {
    if (!newProduct.title || newProduct.count <= 0) return;
    const userDepositRef = doc(db, "deposits", userId);
    const newProductData: DepositProduct = {
      id: Date.now().toString(), // Simple unique ID; consider a better method if needed
      title: newProduct.title,
      count: newProduct.count,
      paid: false,
      received: false,
      points: false,
    };
    await updateDoc(userDepositRef, {
      products: arrayUnion(newProductData),
    });
    setNewProduct({ title: "", count: 1 });
  };

  const editProduct = async (
    userId: string,
    product: DepositProduct,
    newCount: number
  ) => {
    const userDepositRef = doc(db, "deposits", userId);
    const updatedProducts = deposits
      .find((d) => d.userId === userId)!
      .products.map((p) =>
        p.id === product.id ? { ...p, count: newCount } : p
      );
    await updateDoc(userDepositRef, { products: updatedProducts });
  };

  const removeProduct = async (userId: string, productId: string | number) => {
    const userDepositRef = doc(db, "deposits", userId);
    const updatedProducts = deposits
      .find((d) => d.userId === userId)!
      .products.filter((p) => p.id !== productId);
    await updateDoc(userDepositRef, { products: updatedProducts });
  };

  const addTransaction = async (userId: string) => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount === 0) return;
    const userDepositRef = doc(db, "deposits", userId);
    const newTransaction: Transaction = {
      id: Date.now().toString(), // Simple unique ID
      adminId,
      amount,
      date: new Date().toISOString(),
      note: transactionNote || undefined,
    };
    await updateDoc(userDepositRef, {
      transactions: arrayUnion(newTransaction),
    });
    setTransactionAmount("");
    setTransactionNote("");
  };

  const renderDeposit = ({ item }: { item: Deposit }) => {
    const balance = calculateBalance(item.transactions);
    const isExpanded = expandedUserId === item.userId;

    return (
      <View style={styles.depositItem}>
        <TouchableOpacity
          onPress={() => setExpandedUserId(isExpanded ? null : item.userId)}
        >
          <Text style={styles.userId}>User: {item.userId}</Text>
          <Text>
            Balance: {balance} (from {item.transactions.length} transactions)
          </Text>
          <Text>Products: {item.products.length}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Product List */}
            <Text style={styles.sectionTitle}>Products</Text>
            {item.products.map((product) => (
              <View key={product.id} style={styles.productRow}>
                <Text>
                  {product.title} (x{product.count})
                </Text>
                <Button
                  title="+"
                  onPress={() =>
                    editProduct(item.userId, product, product.count + 1)
                  }
                />
                <Button
                  title="-"
                  onPress={() =>
                    editProduct(item.userId, product, product.count - 1)
                  }
                />
                <Button
                  title="Remove"
                  onPress={() => removeProduct(item.userId, product.id)}
                />
              </View>
            ))}

            {/* Add Product */}
            <TextInput
              style={styles.input}
              placeholder="Product Title"
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
              title="Add Product"
              onPress={() => addProduct(item.userId)}
            />

            {/* Transactions */}
            <Text style={styles.sectionTitle}>Add Transaction</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g., 50 or -50)"
              value={transactionAmount}
              keyboardType="numeric"
              onChangeText={setTransactionAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Note (optional)"
              value={transactionNote}
              onChangeText={setTransactionNote}
            />
            <Button
              title="Add Transaction"
              onPress={() => addTransaction(item.userId)}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Deposit Management</Text>
      <FlatList
        data={deposits}
        renderItem={renderDeposit}
        keyExtractor={(item) => item.userId}
        ListEmptyComponent={<Text>No deposits found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  depositItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  userId: { fontSize: 18, fontWeight: "bold" },
  expandedContent: { paddingTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginVertical: 4 },
});

export default DepositManagementScreen;
