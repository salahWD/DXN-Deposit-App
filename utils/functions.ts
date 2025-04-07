import {
  getFirestore,
  getDoc,
  doc,
  onSnapshot,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, Deposit, Transaction, DepositProduct } from '@/utils/types';

export const getUserSession = async () => {
  return await AsyncStorage.getItem('member_code');
}

export const getUserSessionStatus = async () => {
  const val = await AsyncStorage.getItem('isAdmin');
  const isAdmin = val ? JSON.parse(val) : false;
  return isAdmin;
}

export const getDollarPrice = async () => {
  let dollarPrice = 35;

  try {
    // Ensure the document reference is correct
    const docRef = doc(db, "price", "1");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      dollarPrice = parseFloat(data["USD-TL"]);
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
  }

  return dollarPrice;
};

export const getProductsFromDB = async () => {
  console.log("getting products from DB")
  try {
    let products: Product[] = [];
    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Sort products by their numeric ID
    return products.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  } catch (error) {
    console.error("Error fetching products: ", error);
    return [];
  }
};

export const productPrice = (dollar:number, initPrice:number): number => {
  return Math.ceil(initPrice * dollar * 100) / 100;
};


export const submitOrder = async (userId: string | number, orderProducts: Order[]) => {

  if (orderProducts.length === 0) {
    alert('ام يتم اختيار اي منتجات!');
    return;
  }

  await addDoc(collection(db, 'orders'), {
    userId,
    products: orderProducts,
    status: 'pending',
    timestamp: new Date().toISOString(),
  });
  alert('تم الطلب!');
};

export const approveOrder = async (order: Order) => {
  console.log("order is approved", order);

  const userDepositRef = doc(db, "deposits", order.userId);
  const orderRef = doc(db, "orders", order.id);

  // Fetch current products in deposit
  const depositSnap = await getDoc(userDepositRef);
  let currentProducts: DepositProduct[] = [];
  if (depositSnap.exists()) {
    currentProducts = depositSnap.data().products || [];
  } else {
    console.log("Deposit document does not exist, creating a new one...");
    await setDoc(userDepositRef, { products: [] });
  }

  console.log("Existing products:", currentProducts);

  // Prepare new products with default status
  const newProducts = order.products.map((p) => ({
    ...p,
    paid: false,
    received: false,
    points: false,
  }));

  // Merge products: add count if same ID and default status exist
  const updatedProducts = [...currentProducts];
  newProducts.forEach((newProduct) => {
    const existingIndex = updatedProducts.findIndex(
      (p) =>
        p.id === newProduct.id &&
        p.paid === false &&
        p.received === false &&
        p.points === false
    );

    if (existingIndex !== -1) {
      // Product exists with default status, increment count
      updatedProducts[existingIndex].count += newProduct.count;
    } else {
      // No match, append as new product
      updatedProducts.push(newProduct);
    }
  });

  // Update Firestore
  await updateDoc(userDepositRef, { products: updatedProducts });

  // Remove order
  await deleteDoc(orderRef);

  alert("تم قبول الطلب!");
};

export const homePageStats = async (userId: string, dollarPrice=0, products) => {
  
  const depositSnap = await getDoc(doc(db, "deposits", userId));
  
  let stats = {
    depositProductsCount: 0,
    balance: 0,
  };

  if (depositSnap.exists()) {
    const depositProducts: Product[] = depositSnap.data().products;

    stats.depositProductsCount = depositProducts.reduce((value: number, p: Product) => (value += p.count), 0);
    stats.balance = Math.ceil(depositProducts.reduce((value: number, prod: Product) => {
      return value += productPrice(dollarPrice, products.find(item => item.id == prod.id).price);
    }, 0) * 100) / 100;

    return stats;
  } else {
    console.log("Deposit document does not exist, creating a new one...");
  }
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  return onSnapshot(collection(db, "orders"), (snapshot) => {
    const ordersArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(ordersArray);
  });
};

export const rejectOrder = async (orderId: Order["id"]) => {
  const orderRef = doc(db, "orders", orderId);
  await deleteDoc(orderRef);
  alert("Order rejected!");
};


/* ================ ADMIN DEPOSIT START ================ */

// Fetch all deposits with real-time updates
export const fetchDeposits = (callback: (deposits: Deposit[]) => void): Unsubscribe => {
  const depositsRef = collection(db, 'deposits');
  return onSnapshot(
    depositsRef,
    (snapshot) => {
      const depositsData = snapshot.docs.map((doc) => ({
        userId: doc.id,
        products: doc.data().products || [],
        transactions: doc.data().transactions || [],
      }));
      callback(depositsData);
    },
    (error) => {
      console.error('Error fetching deposits:', error);
      callback([]); // Return empty array on error
    }
  );
};

// Add a new product to a user's deposit
export const addProductToDeposit = async (userId: string, title: string, count: number) => {
  const userDepositRef = doc(db, 'deposits', userId);
  const newProduct: Product = {
    id: Date.now().toString(), // Simple unique ID
    title,
    count,
    paid: false,
    received: false,
    points: false,
  };
  await updateDoc(userDepositRef, {
    products: arrayUnion(newProduct),
  });
};

// Edit a product's count in a user's deposit
export const editProductInDeposit = async (
  userId: string,
  productId: string | number,
  newCount: number,
  currentProducts: Product[]
) => {
  const userDepositRef = doc(db, 'deposits', userId);
  const updatedProducts = currentProducts.map((p) =>
    p.id === productId ? { ...p, count: newCount } : p
  );
  await updateDoc(userDepositRef, { products: updatedProducts });
};

// Remove a product from a user's deposit
export const removeProductFromDeposit = async (
  userId: string,
  productId: string | number,
  currentProducts: Product[]
) => {
  const userDepositRef = doc(db, 'deposits', userId);
  const updatedProducts = currentProducts.filter((p) => p.id !== productId);
  await updateDoc(userDepositRef, { products: updatedProducts });
};

// Add a transaction to a user's deposit
export const addTransactionToDeposit = async (
  userId: string,
  adminId: string,
  amount: number,
  note?: string
) => {
  const userDepositRef = doc(db, 'deposits', userId);
  const newTransaction: Transaction = {
    id: Date.now().toString(), // Simple unique ID
    adminId,
    amount,
    date: new Date().toISOString(),
    note,
  };
  await updateDoc(userDepositRef, {
    transactions: arrayUnion(newTransaction),
  });
};

// Calculate balance from transactions (not a DB call, but a utility function)
export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, txn) => sum + txn.amount, 0);
};

/* ================ ADMIN DEPOSIT END ================ */