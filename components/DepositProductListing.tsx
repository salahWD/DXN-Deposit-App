import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { I18nManager } from "react-native";

import ProductCard from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext"; // Adjust the path as needed
import { productPrice } from "@/utils/functions";
import { Product } from "@/utils/types";
import { db } from "@/firebaseConfig";
import { DepositProduct } from "@/utils/types";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface DepositProductListingProps {
  userId: string;
  updateOrder: (product: Product, count: number) => void;
  resetKey: number;
}

const DepositProductListing = ({
  userId,
  resetKey,
  updateOrder,
}: DepositProductListingProps) => {
  const { products, dollarPrice, loading } = useProducts();
  const [depositProducts, setDepositProducts] = useState<DepositProduct[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe;
    const getDepositProducts = async () => {
      if (userId) {
        const depositRef = doc(db, "deposits", userId);
        unsubscribe = onSnapshot(
          depositRef,
          (snapshot) => {
            const data = snapshot.data();
            if (data && data.products) {
              setDepositProducts(data.products);
            } else {
              setDepositProducts([]);
            }
          },
          (error) => {
            console.error("Error fetching deposit:", error);
          }
        );
      } else {
        console.log("error no user id is found");
      }
    };
    getDepositProducts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, paddingHorizontal: 32, paddingVertical: 10 }}>
        <Text>Loading...</Text>
      </View>
    );
  if (products.length === 0) {
    console.log(products);
    return (
      <View style={{ flex: 1, paddingHorizontal: 32, paddingVertical: 10 }}>
        <Text>لا يوجد منتجات</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 10 }}
        data={products}
        renderItem={({ item: product }) => {
          return (
            <ProductCard
              key={`${product.id}-${resetKey}`}
              handleChangedCount={updateOrder}
              depositCount={
                // depositProducts.find((depP) => depP.id == product.id)?.count ||
                depositProducts
                  .filter((depP) => depP.id == product.id)
                  ?.reduce(
                    (val, item) => (!item.points ? (val += item?.count) : val),
                    0
                  ) || 0
              }
              selectedCount={product.count}
              product={product}
              price={productPrice(product.price, dollarPrice)}
            />
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No Products found</Text>}
      />
    </View>
  );
};

export default DepositProductListing;
