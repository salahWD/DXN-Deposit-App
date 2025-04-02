import React, { memo } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { I18nManager } from "react-native";

import ProductCard from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext"; // Adjust the path as needed
import { productPrice } from "@/utils/functions";
import { Product } from "@/utils/types";

// Force RTL layout (as per your earlier request)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface ProductListingProps {
  updateOrder: (product: Product, count: number) => void;
  resetKey: number;
}

const ProductListing = ({ resetKey, updateOrder }: ProductListingProps) => {
  const { products, dollarPrice, loading } = useProducts();

  if (loading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  if (products.length === 0)
    return (
      <View>
        <Text>No products available</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 10 }}
        data={products}
        renderItem={({ item: product }) => {
          return (
            <MemoizedProductCard
              key={`${product.id}-${resetKey}`}
              handleChangedCount={updateOrder}
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

const MemoizedProductCard = memo(ProductCard);

export default ProductListing;
