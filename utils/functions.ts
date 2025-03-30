import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/utils/types';

export const getUserSession = async () => {
  return await AsyncStorage.getItem('member_code');
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
