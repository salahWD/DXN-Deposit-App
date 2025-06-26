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
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Product,
  Order,
  Deposit,
  Transaction,
  DepositProduct,
  TransactionOrder,
  OrderProducts,
  Action,
} from "@/utils/types";

export const getUserSession = async () => {
  return await AsyncStorage.getItem("userId");
};

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
  console.log("getting products from DB");
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

export const depositAddProductsOrder = async (
  userId: string | number,
  orderProducts: Order[]
) => {
  if (orderProducts.length === 0) {
    alert("لم يتم اختيار اي منتجات!");
    return false;
  }

  await addDoc(collection(db, "orders"), {
    userId,
    products: orderProducts,
    timestamp: new Date().toISOString(),
  });

  alert("تم الطلب!");
  return true;
};

export const submitPointsOrder = async (
  userId: string | number,
  orderMemberId: string | number,
  orderProducts: Order[]
) => {
  if (orderProducts.length === 0) {
    alert("لم يتم اختيار اي منتجات!");
    return false;
  }
  console.log(orderProducts);

  await addDoc(collection(db, "pointOrders"), {
    userId,
    orderMemberId,
    products: orderProducts,
    timestamp: new Date().toISOString(),
  });

  // await addDoc(collection(db, `deposits/${userId}/transactions`), {
  //   userId: userId,
  //   amount: -1 * orderAmount,
  //   note: "سعر طلبية بتاريخ " + new Date().toLocaleDateString() + " وتحتوي على: \n " + newProducts.map((p) => `${p.title} (x${p.count})`).join("\n"),
  //   created_at: new Date(),
  // });

  alert("تم الطلب!");
  return true;
};

/* export const AdminAddPoints = async (
  adminId: string,
  userId: string,
  updatedProducts: Order[]
) => {
  console.log(updatedProducts, "<== updatedProducts");

  // Filter out products with count <= 0 (removal)
  const filteredProducts = updatedProducts.filter((product) => product.count > 0);

  const userDepositRef = doc(db, "deposits", userId);

  // Save the final filtered list to Firestore (even if empty)
  await setDoc(userDepositRef, {
    products: filteredProducts,
  }, { merge: true });

  // Log the admin action for auditing
  await addDoc(collection(db, `deposits/${userId}/actions`), {
    userId,
    adminId,
    actionType: 3, // 1 => order approval | 2 => transaction approval | 3 => points approval | 4 => deposit products received
    title: "تحديث نقاط الإيداع",
    notes:
      filteredProducts.length > 0
        ? "تم تحديث النقاط بواسطة المشرف:\n" +
          filteredProducts.map((p) => `${p.title} (x${p.count})`).join("\n")
        : "تمت إزالة جميع النقاط المؤجلة بواسطة المشرف.",
    created_at: new Date(),
  });

  alert("تم حفظ المنتجات بنجاح!");
  return true;
}; */


export const AdminAddPoints = async (
  adminId: string,
  userId: string,
  updatedList: DepositProduct[] // The new admin-provided final product list
) => {
  const userDepositRef = doc(db, "deposits", userId);
  const depositSnap = await getDoc(userDepositRef);

  let currentProducts: DepositProduct[] = depositSnap.exists()
    ? depositSnap.data().products || []
    : [];

  const finalProducts: DepositProduct[] = [];

  // Group current and updated by product ID
  const groupById = (list: DepositProduct[]) =>
    list.reduce((acc, p) => {
      if (!acc[p.id]) acc[p.id] = [];
      acc[p.id].push({ ...p });
      return acc;
    }, {} as Record<string | number, DepositProduct[]>);

  const currentMap = groupById(currentProducts);
  const updatedMap = groupById(updatedList);

  for (const id in updatedMap) {
    const updated = updatedMap[id][0]; // admin version (only one per product)
    const existing = currentMap[id] || [];

    const totalCurrentCount = existing.reduce((sum, p) => sum + p.count, 0);
    const diff = updated.count - totalCurrentCount;

    if (diff === 0) {
      // No change, just preserve current entries
      finalProducts.push(...existing);
    } else if (diff < 0) {
      // Decrease: remove from unreceived first
      let remaining = updated.count;

      const sorted = [...existing].sort((a, b) =>
        a.received === b.received ? 0 : a.received ? 1 : -1
      ); // prioritize unreceived first

      for (const p of sorted) {
        if (remaining <= 0) break;
        const copy = { ...p };
        if (copy.count <= remaining) {
          finalProducts.push({ ...copy });
          remaining -= copy.count;
        } else {
          finalProducts.push({ ...copy, count: remaining });
          remaining = 0;
        }
      }
    } else {
      // Increase: keep old and add new unreceived for the diff
      finalProducts.push(...existing);
      finalProducts.push({
        id: updated.id,
        title: updated.title,
        count: diff,
        received: false,
        points: updated.points ?? false,
      });
    }
  }

  // Also keep current products that were completely removed by admin
  const removedIds = Object.keys(currentMap).filter((id) => !(id in updatedMap));
  for (const id of removedIds) {
    // Completely removed: do not push anything
  }

  // Save to Firestore
  await setDoc(userDepositRef, {
    products: finalProducts,
  }, { merge: true });

  // Audit log
  await addDoc(collection(db, `deposits/${userId}/actions`), {
    userId,
    adminId,
    actionType: 3,
    title: "تحديث نقاط الإيداع",
    notes:
      finalProducts.length > 0
        ? "تم تحديث منتجات الإيداع:\n" +
          finalProducts.map((p) => `${p.title} (x${p.count}) - ${p.received ? "تم استلامه" : "لم يستلم"}`).join("\n")
        : "تمت إزالة جميع منتجات الإيداع.",
    created_at: new Date(),
  });

  alert("تم حفظ المنتجات بنجاح!");
  return true;
};


export const approveOrder = async (
  order: Order,
  products: Product[],
  adminId: string
) => {
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

  // Prepare new products with default status
  const newProducts = order.products.map((p) => ({
    ...p,
    received: false,
    points: false,
  }));

  // Calculate the total order amount & update products counts
  let orderAmount = 0;
  const updatedProducts = [...currentProducts];

  newProducts.forEach((newProduct) => {
    orderAmount +=
      newProduct.count *
      productPrice(
        products.find((item) => item.id == newProduct.id)?.price ?? 0,
        DollarPrice
      );

    // ADD or UPDATE the product in the deposit
    const existingIndex = updatedProducts.findIndex(
      (p) => p.id === newProduct.id && p.received == false && p.points == false
    );

    if (existingIndex !== -1) {
      updatedProducts[existingIndex].count += newProduct.count;
    } else {
      updatedProducts.push(newProduct);
    }
  });

  currentDept += orderAmount;

  await addDoc(collection(db, `deposits/${order.userId}/transactions`), {
    userId: order.userId,
    amount: -1 * orderAmount,
    note:
      "سعر طلبية بتاريخ " +
      new Date().toLocaleDateString() +
      " وتحتوي على: \n " +
      newProducts.map((p) => `${p.title} (x${p.count})`).join("\n"),
    created_at: new Date(),
  });

  await setDoc(doc(collection(db, `deposits/${order.userId}/actions`)), {
    userId: order.userId,
    adminId: adminId,
    actionType: 1, // 1 => order approval | 2 => transaction approval | 3 => points approval | 4 => deposit products received
    title: "قبول طلبية",
    amount: -1 * orderAmount,
    notes:
      "تم الموافقة على الطلبية التي يبلغ سعرها (" +
      orderAmount +
      "TL) وتحتوي على: \n " +
      newProducts.map((p) => `${p.title} (x${p.count})`).join("\n"),
    created_at: new Date(),
  });

  // Update Firestore
  console.log("Updated products:", updatedProducts);
  await updateDoc(userDepositRef, {
    products: updatedProducts,
    deptAmount: currentDept,
  });

  // Remove order
  await deleteDoc(orderRef);

  alert("تم قبول الطلب!");
};

export const approvePointsOrder = async (
  order: Order,
  products: Product[],
  adminId: string
) => {
  const userDepositRef = doc(db, "deposits", order.userId);
  const orderRef = doc(db, "pointOrders", order.id);
  const dollarPrice = await getDollarPrice();

  // Fetch current products in deposit
  const depositSnap = await getDoc(userDepositRef);
  let currentProducts: DepositProduct[] = [];
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    if (depositSnap.exists()) {
      console.log("Deposit document exists, fetching products...");
      currentProducts = depositSnap.data().products || [];
    } else {
      console.log("Deposit document does not exist, creating a new one...");
      await setDoc(userDepositRef, { products: [] });
    }

    let newDeptAmount = depositSnap.data()?.deptAmount || 0;
    let orderAmount = 0;
    let notOwnedProducts: OrderProducts[] = [];
    let updatedProducts = [...currentProducts];

    order.products.forEach((orderProduct) => {
      const existingIndex = updatedProducts.findIndex(
        (p) => p.id === orderProduct.id && p.received === true && !p.points
      );

      if (existingIndex !== -1) {
        if (updatedProducts[existingIndex].count > orderProduct.count) {
          updatedProducts[existingIndex].count -= orderProduct.count;
        } else {
          // this count of products will be considered as 0 points and already received and it's price is added to the dept
          const notInDepositProductsCount =
            -1 * (updatedProducts[existingIndex].count - orderProduct.count);
          notOwnedProducts.push({
            id: orderProduct.id,
            title: orderProduct.title,
            count: notInDepositProductsCount,
          });
          // updatedProducts[existingIndex].count = 0;// set the count to 0
          // or
          // remove the product from deposit products
          updatedProducts = updatedProducts.filter(
            (_, index) => index !== existingIndex
          );
          const unpointedProductType = updatedProducts.findIndex(
            (p) => p.id === orderProduct.id && p.received === false && p.points
          );
          if (unpointedProductType !== -1) {
            updatedProducts[unpointedProductType].count +=
              notInDepositProductsCount;
          } else {
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
          orderAmount +=
            notInDepositProductsCount *
            productPrice(
              products.find((item) => item.id == orderProduct.id)?.price ?? 0,
              dollarPrice
            );

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
        orderAmount +=
          orderProduct.count *
          productPrice(
            products.find((item) => item.id == orderProduct.id)?.price ?? 0,
            dollarPrice
          );
        notOwnedProducts.push(orderProduct);
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

    console.log("Updated products:", updatedProducts);
    newDeptAmount += orderAmount;
    console.log("New dept amount:", newDeptAmount);

    await updateDoc(userDepositRef, {
      products: updatedProducts,
      deptAmount: newDeptAmount,
    });

    await addDoc(collection(db, `deposits/${order.userId}/transactions`), {
      userId: order.userId,
      amount: -1 * orderAmount,
      note:
        "سعر تنزيل نقاط غير مملوكة بتاريخ " +
        new Date().toLocaleDateString() +
        " وتحتوي على: \n " +
        notOwnedProducts.map((p) => `${p.title} (x${p.count})`).join("\n"),
      created_at: new Date(),
    });

    await setDoc(doc(collection(db, `deposits/${order.userId}/actions`)), {
      userId: order.userId,
      adminId: adminId,
      actionType: 3, // 1 => order approval | 2 => transaction approval | 3 => points approval | 4 => deposit products received
      title: "تنزيل نقاط مؤجلة",
      amount: -1 * orderAmount,
      notes:
        "تم الموافقة على طلب تنزيل نقاط للعضو (" +
        orderSnap.data().orderMemberId +
        ") والتي تحتوي على: \n " +
        order.products.map((p) => `${p.title} (x${p.count})`).join("\n"),
      created_at: new Date(),
    });

    // Remove order
    await deleteDoc(orderRef);
  }

  alert("تم قبول الطلب!");
};

export const homePageStats = async (userId: string, products: any[]) => {
  const depositSnap = await getDoc(doc(db, "deposits", userId));

  let stats = {
    depositProductsCount: 0,
    postponedPoints: 0,
    depositAmount: 0,
  };

  if (depositSnap.exists()) {
    const depositInfo = depositSnap.data();
    const depositProducts: DepositProduct[] = depositInfo.products;

    if (!depositProducts || depositProducts?.length === 0) return stats;

    stats.depositProductsCount =
      depositProducts.reduce((value: number, p: DepositProduct) => {
        if (!p.received) {
          return (value += p.count);
        } else {
          return value;
        }
      }, 0) || 0;

    stats.postponedPoints =
      Math.ceil(
        depositProducts.reduce((value: number, prod: DepositProduct) => {
          console.log(value, "<== value");
          console.log(prod, "<== prod");
          if (prod.received && !prod.points) {
            value +=
              products.find((item, indx) => item.id == prod.id)?.points *
                prod.count || 0;
          }
          return value;
        }, 0) * 100
      ) / 100;

    stats.depositAmount =
      Math.ceil(depositInfo.deptAmount * 10) / 10 || stats.depositAmount;

    return stats;
  } else {
    console.log("Deposit document does not exist, creating a new one...");
  }
};

export const getAllUsersDebts = async (products: any[]) => {
  try {
    const depositsSnapshot = await getDocs(collection(db, "deposits"));

    const allDebts = depositsSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const depositProducts = data.products || [];
      const userId = docSnap.id;

      let depositProductsCount = 0;
      let postponedPoints = 0;
      let depositAmount = 0;

      depositProductsCount = depositProducts.reduce((acc: any, p: { received: any; count: any; }) => {
        if (!p.received) {
          acc += p.count;
        }
        return acc;
      }, 0);

      postponedPoints =
        Math.ceil(
          depositProducts.reduce((acc: number, prod: { received: any; points: any; id: any; count: number; }) => {
            if (prod.received && !prod.points) {
              acc +=
                (products.find(item => item.id === prod.id)?.points || 0) *
                prod.count;
            }
            return acc;
          }, 0) * 100
        ) / 100;

      depositAmount = Math.ceil((data.deptAmount || 0) * 10) / 10;

      return {
        userId,
        depositProductsCount,
        postponedPoints,
        depositAmount,
      };
    });

    return allDebts;
  } catch (err) {
    console.error("Error fetching deposits:", err);
    return [];
  }
};

export const getAllUsersPoints = async (products: any[]) => {
  try {
    const depositsSnapshot = await getDocs(collection(db, "deposits"));

    const allDebts = depositsSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const depositProducts = data.products || [];
      const userId = docSnap.id;

      let depositProductsCount = 0;
      let postponedPoints = 0;
      let depositAmount = 0;

      depositProductsCount = depositProducts.reduce((acc: any, p: { received: any; count: any; }) => {
        if (!p.received) {
          acc += p.count;
        }
        return acc;
      }, 0);

      postponedPoints =
        Math.ceil(
          depositProducts.reduce((acc: number, prod: { received: any; points: any; id: any; count: number; }) => {
            if (prod.received && !prod.points) {
              acc +=
                (products.find(item => item.id === prod.id)?.points || 0) *
                prod.count;
            }
            return acc;
          }, 0) * 100
        ) / 100;

      depositAmount = Math.ceil((data.deptAmount || 0) * 10) / 10;

      return {
        userId,
        depositProductsCount,
        postponedPoints,
        depositAmount,
      };
    });

    return allDebts;
  } catch (err) {
    console.error("Error fetching deposits:", err);
    return [];
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
export const fetchDeposits = (
  callback: (deposits: Deposit[]) => void
): Unsubscribe => {
  const depositsRef = collection(db, "deposits");
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
      console.error("Error fetching deposits:", error);
      callback([]); // Return empty array on error
    }
  );
};

// Add a new product to a user's deposit
export const addProductToDeposit = async (
  userId: string,
  title: string,
  count: number,
  paid = false,
  points = false,
  received = false
) => {
  console.log("started adding product to deposit");
  const userDepositRef = doc(db, "deposits", userId);
  const newProduct: Product = {
    id: Date.now().toString(), // Simple unique ID
    title,
    count,
    paid: paid,
    received: received,
    points: points,
  };
  console.log("new product", newProduct);
  await updateDoc(userDepositRef, {
    products: arrayUnion(newProduct),
  });
  console.log("product added to deposit");
};

// Edit a product's count in a user's deposit
export const editProductInDeposit = async (
  userId: string,
  productId: string | number,
  newCount: number,
  currentProducts: Product[]
) => {
  const userDepositRef = doc(db, "deposits", userId);
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
  const userDepositRef = doc(db, "deposits", userId);
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
  console.log("adding transaction started");

  const userTransactionRef = doc(
    collection(db, `deposits/${userId}/transactions`)
  );

  // const userDepositRef = doc(db, 'deposits', userId);
  const newTransaction: Transaction = {
    adminId,
    amount,
    created_at: new Date(),
    note,
  };

  await setDoc(userTransactionRef, newTransaction);

  const depositRef = doc(db, "deposits", userId);
  const depositSnap = await getDoc(depositRef);

  if (!depositSnap.exists()) {
    alert("الحساب الطالب للمعاملة غير موجود");
    return;
  }

  const depositDeptAmount = depositSnap.data()?.deptAmount || 0;
  const newDeptAmount = depositDeptAmount + amount;
  await updateDoc(depositRef, { deptAmount: newDeptAmount });

  // await updateDoc(userDepositRef, {
  //   transactions: arrayUnion(newTransaction),
  // });
};

// Calculate balance from transactions (not a DB call, but a utility function)
export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, txn) => sum + txn.amount, 0);
};

export async function getDepositProducts(
  userId: string
): Promise<DepositProduct[]> {
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
  setSelectedProducts: (
    selectedProducts: Record<string | number, number>
  ) => void,
  onError: (error: string | null) => void,
  onLoadingChange: (loading: boolean) => void
): Promise<void> {
  try {
    onLoadingChange(true);

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
      setSelectedProducts(
        combinedProducts.reduce((acc, prod) => {
          if (!prod.received) {
            acc[prod.id as string | number] = prod.count > 0 ? prod.count : 0;
          }
          return acc;
        }, {} as Record<string | number, number>)
      );
      
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

export async function adminFetchUserDepositAndOrders(
  userId: string,
  setProducts: (selectedProducts: DepositProduct[]) => void,
  setSelectedProducts: (selectedProducts: DepositProduct[]) => void,
  onError: (error: string | null) => void,
  onLoadingChange: (loading: boolean) => void
): Promise<void> {
  try {
    onLoadingChange(true);

    const depositDocRef = doc(db, "deposits", userId);
    const depositDocSnap = await getDoc(depositDocRef);

    let userProducts: DepositProduct[] = [];

    if (depositDocSnap.exists()) {
      const depositData = depositDocSnap.data();
      if (depositData.products && Array.isArray(depositData.products)) {
        userProducts = depositData.products.map((p) => ({
          ...p,
          received: p.received ?? false,
        }));
      }
    }

    if (userProducts.length > 0) {

      setProducts(userProducts);

      setSelectedProducts(
        userProducts
          .filter((prod) => !prod.received)
          .map((prod) => ({
            ...prod,
            received: false,
          }))
      );

      onError(null);
    } else {
      onError("لا توجد منتجات في وديعتك حاليًا");
    }
  } catch (error) {
    console.error("Error fetching deposit or orders:", error);
    onError("غير متصل بالإنترنت أو حدث خطأ. حاول لاحقًا.");
  } finally {
    onLoadingChange(false);
  }
}

export async function markProductsAsReceived(
  userId: string,
  updatedProducts: DepositProduct[],
  selectedProducts: { id: string; count: number; title: string }[],
  notes: string
): Promise<boolean | void> {
  try {
    await updateDoc(doc(db, "deposits", userId), {
      products: updatedProducts,
    });
    console.log(notes, "<== notes");
    await setDoc(doc(collection(db, `deposits/${userId}/actions`)), {
      userId,
      actionType: 4, // 1 => order approval | 2 => transaction approval | 3 => points approval | 4 => deposit products received
      title: "استلام منتجات",
      products: selectedProducts,
      created_at: new Date(),
      notes,
    });

    console.log("Products updated successfully in Firestore.");
    return true;
  } catch (error) {
    console.error("Error updating Firestore products:", error);
    throw error;
  }
}

export async function adminMarkProductsAsReceived(
  userId: string,
  adminId: string,
  updatedProducts: DepositProduct[],
): Promise<boolean | void> {
  try {
    const depositRef = doc(db, "deposits", userId);
    const depositSnap = await getDoc(depositRef);

    if (!depositSnap.exists()) {
      throw new Error("Deposit document not found.");
    }

    const currentProducts: DepositProduct[] = depositSnap.data().products || [];

    const changedProducts = updatedProducts.reduce<{ id: string; count: number; title: string }[]>(
      (diffs, updated) => {
        const current = currentProducts.find((p) => p.id === updated.id);
        if (!current || current.count !== updated.count) {
          diffs.push({
            id: updated.id,
            count: updated.count,
            title: updated.title,
          });
        }
        return diffs;
      },
      [],
    );

    const normalizedProducts = updatedProducts.map((prod) => ({
      ...prod,
      received: false,
    }));

    await updateDoc(depositRef, {
      products: normalizedProducts,
    });

    await setDoc(doc(collection(db, `deposits/${userId}/actions`)), {
      adminId,
      actionType: 4,
      title: "تعديل منتجات الوديعة",
      products: updatedProducts.map((p) => ({
        ...p,
        received: false,
      })),
      notes: `تم تعديل المنتجات غير المستلمة التالية:\n${changedProducts.map((p) => `${p.title} (x${p.count})`).join("\n")}`,
      created_at: new Date(),
    });

    console.log("Products updated and changes logged successfully.");
    return true;
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

    const transactionsRef = collection(db, "deposits", userId, "transactions");
    const q = query(transactionsRef, orderBy("created_at", "desc"));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const transactions: Transaction[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      onTransactionsChange(transactions);
      onError("");
    } else {
      console.log("no transactions found");
      onTransactionsChange([]);
      onError("لا توجد معاملات سابقة لك في النظام");
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    onTransactionsChange([]);
    onError("غير متصل بالإنترنت أو حدث خطأ. حاول لاحقًا.");
  } finally {
    onLoadingChange(false);
  }
}

export async function fetchUserActions(
  userId: string,
  onActionsChange: (actions: Action[]) => void,
  onError: (error: string) => void,
  onLoadingChange: (loading: boolean) => void
): Promise<void> {
  try {
    onLoadingChange(true);

    const actionsRef = collection(db, "deposits", userId, "actions");
    const q = query(actionsRef, orderBy("created_at", "desc"));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const actions: Action[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Action[];

      onActionsChange(actions);
      onError("");
    } else {
      console.log("no actions found");
      onActionsChange([]);
      onError("لا توجد معاملات سابقة لك في النظام");
    }
  } catch (error) {
    console.error("Error fetching actions:", error);
    onActionsChange([]);
    onError("غير متصل بالإنترنت أو حدث خطأ. حاول لاحقًا.");
  } finally {
    onLoadingChange(false);
  }
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
}

export async function submitTransaction(
  userId: string,
  amount: number,
  note?: string
) {
  await addDoc(collection(db, "transactionOrders"), {
    userId,
    amount: amount,
    note: note || "",
    created_at: new Date(),
  });
  return true;
}

export async function depositSubmitTransaction(
  userId: string,
  adminId: string,
  amount: number,
  note?: string
) {
  const depositRef = doc(db, "deposits", userId);
  const depositSnap = await getDoc(depositRef);

  if (typeof amount != "number") {
    alert("البلغ غير صحيح");
    return false;
  }

  if (!depositSnap.exists()) {
    alert("الحساب المطلوب تعديله غير موجود");
    return false;
  }

  const transactionOrder = {
    adminId,
    amount: amount,
    note: note || "",
    created_at: new Date(),
  };
  const depositDeptAmount = depositSnap.data()?.deptAmount || 0;
  const newDeptAmount = depositDeptAmount + transactionOrder.amount;

  const userTransactionRef = doc(
    collection(db, `deposits/${userId}/transactions`)
  );

  await setDoc(userTransactionRef, transactionOrder);
  await updateDoc(depositRef, { deptAmount: newDeptAmount });

  await setDoc(doc(collection(db, `deposits/${userId}/actions`)), {
    userId,
    adminId,
    actionType: 2, // 1 => order approval | 2 => transaction approval | 3 => points approval | 4 => deposit products received
    title: "تعديل الرصيد المالي",
    amount: transactionOrder.amount,
    notes: `تم التعديل على الرصيد المالي بواسطة ${adminId} وتم ${transactionOrder.amount > 0 ? "اضافة" : "خصم"} مبلغ (${transactionOrder.amount} TL) ${transactionOrder.amount > 0 ? "الى" : "من"} رصيدك`,
    created_at: new Date(),
  });

  alert("تم قبول السداد!");
  return true;
}

export async function approveTransactionOrder(
  orderId: string,
  userId: string,
  adminId: string
) {
  const orderRef = doc(db, "transactionOrders", orderId);
  const transactionOrderSnap = await getDoc(orderRef);

  const depositRef = doc(db, "deposits", userId);
  const depositSnap = await getDoc(depositRef);

  if (!transactionOrderSnap.exists()) {
    alert("طلب المعاملة غير موجود");
    return;
  }

  if (!depositSnap.exists()) {
    alert("الحساب الطالب للمعاملة غير موجود");
    return;
  }

  const transactionOrder = transactionOrderSnap.data();
  const depositDeptAmount = depositSnap.data()?.deptAmount || 0;
  const newDeptAmount = depositDeptAmount - transactionOrder.amount;

  const userTransactionRef = doc(
    collection(db, `deposits/${userId}/transactions`)
  );

  await setDoc(userTransactionRef, transactionOrder);
  await updateDoc(depositRef, { deptAmount: newDeptAmount });

  await setDoc(doc(collection(db, `deposits/${userId}/actions`)), {
    userId,
    adminId,
    actionType: 2, // 1 => order approval | 2 => transaction approval | 3 => points approval | 4 => deposit products received
    title: "تأكيد السداد",
    amount: transactionOrder.amount,
    notes: `تم قبول طلب السداد بواسطة ${adminId} وتم اضافة مبلغ (${transactionOrder.amount} TL) الى رصيدك`,
    created_at: new Date(),
  });

  await deleteDoc(orderRef);

  alert("تم قبول السداد!");
}

export async function rejectTransactionOrder(orderId: string) {
  const orderRef = doc(db, "transactionOrders", orderId);

  const transactionOrderSnap = await getDoc(orderRef);
  let transactionOrder = transactionOrderSnap.exists()
    ? transactionOrderSnap.data()
    : null;
  if (transactionOrder) {
    await deleteDoc(orderRef);
    alert("تم رفض السداد!");
  }
}

export const subscribeToTransactionOrders = (
  callback: (orders: TransactionOrder[]) => void
) => {
  return onSnapshot(collection(db, "transactionOrders"), async (snapshot) => {
    const ordersArray = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();

        return {
          id: docSnapshot.id,
          ...orderData,
        };
      })
    );
    callback(ordersArray);
  });
};

export async function getReportStats(products: Product[]) {
  let retrun = {
    totalDeptAmount: 0,
    totalDBUnreceivedProducts: 0,
    totalProducts: 0,
    totalPoints: 0,
    pointsDetails: [] as any[],
    deptsDetails: [] as { id: any; deptAmount: number }[],
    productsDetails: [] as { id: any; products: DepositProduct[] }[],
  };

  try {
    const depositsRef = collection(db, "deposits");
    const snapshot = await getDocs(depositsRef);

    snapshot.forEach((doc) => {
      const data = doc.data();

      // parsing data (depts, points, unreceived products)

      const deptAmount = data?.deptAmount;
      const unreceivedProducts = data?.products?.reduce(
        (total: number, item: DepositProduct) =>
          item.received == false ? total + item.count : total,
        0
      );
      const postponedPoints = data?.products?.reduce(
        (total: number, item: DepositProduct) => {
          const productPoints =
            products.find((prod) => prod.id == item.id)?.points || 0;
          return !item.points ? total + productPoints * item.count : total;
        },
        0
      );

      // console.log("=========================");
      // console.log(deptAmount, unreceivedProducts, postponedPoints);
      // console.log("=========================");

      // adding stats to "return object"

      if (deptAmount && typeof deptAmount === "number") {
        retrun.totalDeptAmount += deptAmount;
        retrun.deptsDetails.push({id: doc.id, deptAmount: Math.round(deptAmount)});
      }
      if (unreceivedProducts && typeof unreceivedProducts === "number") {
        // retrun.deptsDetails.push({id: doc.id, deptAmount: Math.round(deptAmount)});
        retrun.totalProducts += unreceivedProducts;
      }
      retrun.productsDetails.push({id: doc.id, products: data?.products?.filter((item: {received: Boolean}) => {
        return !item.received;
      })})
      if (postponedPoints && typeof postponedPoints === "number") {
        retrun.totalPoints += postponedPoints;
      }
    });
  } catch (error) {
    console.error("Error fetching total dept amount:", error);
  }

  return retrun;
  // {
  //   totalDeptAmount: retrun.totalDeptAmount,
  //   totalProducts: retrun.totalProducts,
  //   totalPoints: retrun.totalPoints,
  //   deptsDetails: retrun.deptsDetails,
  //   productsDetails: retrun.productsDetails,
  // };
}
