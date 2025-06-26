import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { I18nManager } from "react-native";

import ProductCard from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { productPrice } from "@/utils/functions";
import { Product } from "@/utils/types";
import { DepositProduct } from "@/utils/types";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface DepositProductListingProps {
  resetKey: number;
  updateOrder: (product: Product, count: number) => void;
  availableProducts: DepositProduct[];
}

const DepositProductListing = ({
  resetKey,
  updateOrder,
  availableProducts,
}: DepositProductListingProps) => {
  const { products, dollarPrice, loading } = useProducts();

  if (loading)
    return (
      <View style={{ flex: 1, paddingHorizontal: 32, paddingVertical: 10 }}>
        <Text>Loading...</Text>
      </View>
    );
  if (products.length === 0) {
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
          const availableCount =
            availableProducts
              .filter((depP) => depP.id == product.id)
              ?.reduce(
                (val, item) => (!item.points ? (val += item?.count) : val),
                0
              ) || 0;
          return (
            <ProductCard
              key={`${product.id}-${resetKey}`}
              handleChangedCount={updateOrder}
              depositCount={availableCount}
              selectedCount={availableCount}
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
