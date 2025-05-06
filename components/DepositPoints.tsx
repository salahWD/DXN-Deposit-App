import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { I18nManager } from "react-native";

import ProductCard from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext"; // Adjust the path as needed
import { productPrice } from "@/utils/functions";
import { Product } from "@/utils/types";
import { getUserSession, getDepositProducts } from "@/utils/functions";
import { DepositProduct } from "@/utils/types";

// Force RTL layout (as per your earlier request)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface PostponedPointsProps {
  updateOrder: (product: Product, count: number) => void;
  resetKey: number;
  depositCount: number;
}

const PostponedPoints = ({ resetKey, updateOrder }: PostponedPointsProps) => {
  const { products, dollarPrice, loading } = useProducts();
  const [depositProducts, setDepositProducts] = useState<DepositProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = await getUserSession();
      if (userId) {
        const depositRef = getDepositProducts(userId);
        setDepositProducts(depositRef);
      } else {
        console.log("error no user id is found");
      }
    };
    fetchData();
    console.log("====================");
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, paddingHorizontal: 32, paddingVertical: 10 }}>
        <Text>Loading...</Text>
      </View>
    );
  if (products.length === 0)
    return (
      <View style={{ flex: 1, paddingHorizontal: 32, paddingVertical: 10 }}>
        <Text>لا يوجد منتجات</Text>
      </View>
    );

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
                depositProducts.find((depP) => depP.id == product.id)?.count ||
                0
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

export default PostponedPoints;
