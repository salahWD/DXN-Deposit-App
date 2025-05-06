import {
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
  arrayUnion,
  query, where
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, Deposit, Transaction, DepositProduct } from '@/utils/types';

export const getUserSession = async () => {
  return await AsyncStorage.getItem('userId');
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

export const productPrice = (dollar: number, initPrice: number): number => {
  if (isNaN(dollar) || isNaN(initPrice)) {
    return 0; // Default to 0 if inputs are invalid
  }
  return Math.ceil(initPrice * dollar * 100) / 100;
};


export const depositAddProductsOrder = async (userId: string | number, orderProducts: Order[]) => {

  if (orderProducts.length === 0) {
    alert('لم يتم اختيار اي منتجات!');
    return false;
  }

  await addDoc(collection(db, 'orders'), {
    userId,
    products: orderProducts,
    timestamp: new Date().toISOString(),
  });
  alert('تم الطلب!');
  return true;
};

export const submitPointsOrder = async (userId: string | number, orderMemberId: string | number, orderProducts: Order[]) => {

  if (orderProducts.length === 0) {
    alert('لم يتم اختيار اي منتجات!');
    return false;
  }

  await addDoc(collection(db, 'pointOrders'), {
    userId,
    orderMemberId,
    products: orderProducts,
    timestamp: new Date().toISOString(),
  });
  alert('تم الطلب!');
  return true;
};

export const approveOrder = async (order: Order) => {

  const userDepositRef = doc(db, "deposits", order.userId);
  const orderRef = doc(db, "orders", order.id);
  const DollarPrice = await getDollarPrice();

  // Fetch current products in deposit
  const depositSnap = await getDoc(userDepositRef);
  let currentProducts: DepositProduct[] = [];
  let currentDept: number = 0;
  if (depositSnap.exists()) {
    console.log("Deposit document exists, fetching products...");
    currentProducts = depositSnap.data().products || [];
    currentDept = depositSnap.data().deptAmount || 0;
  } else {
    console.log("Deposit document does not exist, creating a new one...");
    await setDoc(userDepositRef, { products: [], deptAmount: 0 });
  }

  console.log("Existing products:", currentProducts);

  // Prepare new products with default status
  const newProducts = order.products.map((p) => ({
    ...p,
    received: false,
    points: 0,
  }));

  // Merge products: add count if same ID and default status exist
  const updatedProducts = [...currentProducts];
  newProducts.forEach((newProduct) => {
    currentDept += newProduct.count * productPrice(newProduct.price ?? 0, DollarPrice);
    const existingIndex = updatedProducts.findIndex(
      (p) =>
        p.id === newProduct.id &&
        p.received === false &&
        !p.points
    );

    if (existingIndex !== -1) {
      updatedProducts[existingIndex].count += newProduct.count;
    } else {
      updatedProducts.push(newProduct);
    }
  });

  // Update Firestore
  console.log("Updated products:", updatedProducts);
  await updateDoc(userDepositRef, { products: updatedProducts, deptAmount: currentDept });

  // Remove order
  await deleteDoc(orderRef);

  alert("تم قبول الطلب!");
};

export const approvePointsOrder = async (order: Order, products: Product[]) => {

  const userDepositRef = doc(db, "deposits", order.userId);
  const orderRef = doc(db, "pointOrders", order.id);
  const dollarPrice = await getDollarPrice();

  // Fetch current products in deposit
  const depositSnap = await getDoc(userDepositRef);
  let currentProducts: DepositProduct[] = [];
  if (depositSnap.exists()) {
    console.log("Deposit document exists, fetching products...");
    currentProducts = depositSnap.data().products || [];
  } else {
    console.log("Deposit document does not exist, creating a new one...");
    await setDoc(userDepositRef, { products: [] });
  }

  let newDeptAmount = depositSnap.data()?.deptAmount || 0;
  let updatedProducts = [...currentProducts];

  order.products.forEach((orderProduct) => {
    const existingIndex = updatedProducts.findIndex(
      (p) =>
        p.id === orderProduct.id &&
        p.received === true &&
        !p.points
    );

    if (existingIndex !== -1) {
      if (updatedProducts[existingIndex].count > orderProduct.count) {
        updatedProducts[existingIndex].count -= orderProduct.count;
      }else {
        // this count of products will be considered as 0 points and already received and it's price is added to the dept
        const notInDepositProductsCount = -1 * (updatedProducts[existingIndex].count - orderProduct.count);
        // updatedProducts[existingIndex].count = 0;// set the count to 0
        // or
        // remove the product from deposit products
        updatedProducts = updatedProducts.filter((_, index) => index !== existingIndex);
        const unpointedProductType = updatedProducts.findIndex(
          (p) =>
            p.id === orderProduct.id &&
            p.received === false &&
            p.points
        );
        if (unpointedProductType !== -1) {
          updatedProducts[unpointedProductType].count += notInDepositProductsCount;
        }else {
          if (notInDepositProductsCount > 0) {
            updatedProducts.push({
              id: orderProduct.id,
              points: true,
              received: false,
              title: orderProduct.title,
              count: notInDepositProductsCount,
            });
          }
        }
        newDeptAmount += notInDepositProductsCount * productPrice(products.find(item => item.id == orderProduct.id)?.price ?? 0, dollarPrice);
        
      // if the order count is more then what user has in deposit:
      //    - set ordered product type count in deposit to 0
      //    - remove the total (points) of (available ordered products) in (deposit) from the deposit points
      //    - add the remaining order count to deposit products
      //    (and mark it as unpointed because the points has already been assigned to a member)
      //    - add transaction with a negative amount
      //      and a title of "طلب منتجات غير متوفرة في المنتجات المؤجلة"
      //     =====================
      //      for example: user has 5 spiro and ordered 10 spiro => will set spiro count to 0 in deposit
      //        and remove 5 * points of spiro from the deposit points
      //        and add 5 * price of spiro to the dept amount
      //        and add 5 * price of spiro to the dept amount
      // and add the remaining order count price to the deposit amount without adding remaning points
      }
    } else {
      // newDeptAmount += productPrice(products.find(item => item.id == orderProduct.id)?.price, orderProduct.count);
      newDeptAmount += orderProduct.count * productPrice(products.find(item => item.id == orderProduct.id)?.price ?? 0, dollarPrice);
      updatedProducts.push({
        id: orderProduct.id,
        points: true,
        received: false,
        title: orderProduct.title,
        count: orderProduct.count,
      });
    }
  });

  // let newDeptAmount = order.products.reduce((total, product) => {
  //   return total + (product.count * productPrice(product.price ?? 0, dollarPrice));
  // }, depositSnap.data()?.deptAmount || 0);

  // Update Firestore
  console.log("Updated products:", updatedProducts);
  await updateDoc(userDepositRef, { products: updatedProducts, deptAmount: newDeptAmount });

  // Remove order
  await deleteDoc(orderRef);

  alert("تم قبول الطلب!");
};

export const homePageStats = async (userId: string, products: any[]) => {

  const depositSnap = await getDoc(doc(db, "deposits", userId));
  // const allProducts = await getProductsFromDB();
  
  let stats = {
    depositProductsCount: 0,
    postponedPoints: 0,
    depositAmount: 0,
  };

  if (depositSnap.exists()) {
    const depositInfo = depositSnap.data();
    const depositProducts: DepositProduct[] = depositInfo.products;

    stats.depositProductsCount = depositProducts.reduce((value: number, p: DepositProduct) => {
      if (!p.received) {
        return value += p.count;
      }else {
        return value;
      }
    }, 0);

    stats.postponedPoints = Math.ceil(depositProducts.reduce((value: number, prod: DepositProduct) => {
      if (prod.received && !prod.points) {
        value += products.find((item, indx) => item.id == prod.id)?.points * prod.count || 0;
      }
      return value
    }, 0) * 100) / 100;

    stats.depositAmount = depositInfo.deptAmount || stats.depositAmount;

    return stats;
  } else {
    console.log("Deposit document does not exist, creating a new one...");
  }
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  return onSnapshot(collection(db, "orders"), async (snapshot) => {
    const ordersArray = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();
        const userId = orderData.userId;
        let username = "";

        try {
          const userDocRef = doc(db, "deposits", String(userId));
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            username = userDoc.data()?.username || "";
          }
        } catch (error) {
          console.error(`Error fetching username for userId ${userId}:`, error);
        }

        return {
          id: docSnapshot.id,
          ...orderData,
          username,
        };
      })
    );
    callback(ordersArray);
  });
};

export const subscribeToPointsOrders = (callback: (orders: any) => void) => {
  return onSnapshot(collection(db, "pointOrders"), async (snapshot) => {
    const ordersArray = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();
        const userId = orderData.userId;
        let username = "";

        try {
          const userDocRef = doc(db, "deposits", String(userId));
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            username = userDoc.data()?.username || "";
          }
        } catch (error) {
          console.error(`Error fetching username for userId ${userId}:`, error);
        }

        return {
          id: docSnapshot.id,
          ...orderData,
          username,
        };
      })
    );
    callback(ordersArray);
  });
};

export const rejectOrder = async (orderId: Order["id"]) => {
  const orderRef = doc(db, "orders", orderId);
  await deleteDoc(orderRef);
  alert("Order rejected!");
};

export const rejectPointsOrder = async (orderId: Order["id"]) => {
  console.log(orderId);
  const orderRef = doc(db, "pointOrders", orderId);
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
export const addProductToDeposit = async (userId: string, title: string, count: number, paid=false, points=false, received=false) => {
  console.log("started adding product to deposit")
  const userDepositRef = doc(db, 'deposits', userId);
  const newProduct: Product = {
    id: Date.now().toString(), // Simple unique ID
    title,
    count,
    paid: paid,
    received: received,
    points: points,
  };
  console.log("new product", newProduct)
  await updateDoc(userDepositRef, {
    products: arrayUnion(newProduct),
  });
  console.log("product added to deposit")
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
  console.log("adding transaction started")
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

export async function getDepositProducts(userId: string): Promise<DepositProduct[]> {
  
  if (!userId) {
    throw new Error("User not logged in.");
  }

  const depositRef = doc(db, "deposits", userId);
  const snapshot = await getDoc(depositRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    if (data && data.products) {
      return data.products as DepositProduct[];
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function fetchUserDepositAndOrders(
  userId: string,
  onProductsChange: (products: DepositProduct[]) => void,
  onError: (error: string) => void,
  onLoadingChange: (loading: boolean) => void
): Promise<void> {
  
  try {
    onLoadingChange(true);
  
    // ✅ Fix: Get document directly
    const depositDocRef = doc(db, "deposits", userId);
    const depositDocSnap = await getDoc(depositDocRef);
  
    let userProducts: DepositProduct[] = [];
  
    if (depositDocSnap.exists()) {
      const depositData = depositDocSnap.data();
      if (depositData.products && Array.isArray(depositData.products)) {
        userProducts = depositData.products;
      } else {
      }
    } else {
    }
  
    // Orders logic stays the same
    const ordersCollectionRef = collection(db, "orders");
    const q = query(ordersCollectionRef, where("userId", "==", userId));
    const ordersSnapshot = await getDocs(q);
  
  
    let orderProducts: DepositProduct[] = [];
  
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      if (orderData.products && Array.isArray(orderData.products)) {
        orderProducts = orderProducts.concat(orderData.products);
      }
    }
  
    const combinedProducts = [...userProducts, ...orderProducts];
  
    if (combinedProducts.length > 0) {
      onProductsChange(combinedProducts);
      onError(null);
    } else {
      onProductsChange([]);
      onError("لا توجد منتجات في وديعتك حاليًا");
    }
  } catch (error) {
    console.error("Error fetching deposit or orders:", error);
    onError("غير متصل بالإنترنت أو حدث خطأ. حاول لاحقًا.");
    onProductsChange([]);
  } finally {
    onLoadingChange(false);
  }
}

export async function markProductsAsReceived(
  userId: string,
  updatedProducts: DepositProduct[]
): Promise<void> {
  const userDepositRef = doc(db, "deposits", userId);

  try {
    await updateDoc(userDepositRef, {
      products: updatedProducts,
    });
    console.log("Products updated successfully in Firestore.");
  } catch (error) {
    console.error("Error updating Firestore products:", error);
    throw error;
  }
}

export async function fetchUserAccountStatement(
  userId: string,
  onTransactionsChange: (transaction: Transaction[]) => void,
  onError: (error: string) => void,
  onLoadingChange: (loading: boolean) => void
): Promise<void> {
  
  try {
    onLoadingChange(true);
  
    // ✅ Fix: Get document directly
    const depositDocRef = doc(db, "deposits", userId);
    const depositDocSnap = await getDoc(depositDocRef);
  
    if (depositDocSnap.exists()) {

      const depositData = depositDocSnap.data();
      if (depositData.transactions && Array.isArray(depositData.transactions)) {
        onTransactionsChange(depositData.transactions);
        onError(null);
      }
    }else {
      console.log("no transactions found");
      onTransactionsChange([]);
      onError("لا توجد معاملات سابقة لك في النظام");
    }

  } catch (error) {
    console.error("Error fetching deposit or orders:", error);
    onError("غير متصل بالإنترنت أو حدث خطأ. حاول لاحقًا.");
    onTransactionsChange([]);
  } finally {
    onLoadingChange(false);
  }
}

export async function submitTransaction(userId: string, amount: number, note?: string) {
  // if (orderProducts.length === 0) {
  //   alert('لم يتم اختيار اي منتجات!');
  //   return false;
  // }

  await addDoc(collection(db, 'pointOrders'), {
    userId,
    amount: amount,
    note: note || "",
    created_at: new Date().toISOString(),
  });
  alert('تم تقديم طلب السداد!');
  return true;
}

export async function getDepositProductsFromDB(
    userID: string
  ): Promise<Product[]> {
    console.log("getting deposit products from DB");
    try {
      let depositProducts: Product[] = [];
      const querySnapshot = await getDocs(
        collection(db, `deposits/${userID}/products`)
      );

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DepositProduct;
        depositProducts.push({
          id: parseInt(doc.id),
          tag: undefined,
          count: data.count,
          special: undefined,
          price: undefined,
          received: data.received,
          points: data.points,
          title: {
            ar: data.title,
            tr: data.title, // Assuming same title for both languages; adjust if needed
          },
        });
      });

      // Sort deposit products by their numeric ID
      return depositProducts.sort((a, b) => a.id - b.id);
    } catch (error) {
      console.error("Error fetching deposit products: ", error);
      return [];
    }
  };