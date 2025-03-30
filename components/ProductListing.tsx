import React, { memo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { I18nManager } from 'react-native';
import ProductCard from './ProductCard';
import { useProducts } from '@/contexts/ProductContext'; // Adjust the path as needed
import { productPrice } from '@/utils/functions';

// Force RTL layout (as per your earlier request)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const ProductListing = () => {
  const { products, dollarPrice, loading } = useProducts();

  if (loading) return <View><Text>Loading...</Text></View>;
  if (products.length === 0) return <View><Text>No products available</Text></View>;

  return (
    <View>
      {products.map((product, index) => (
        <MemoizedProductCard
          id={index}
          key={index}
          title={product.title.ar}
          special={product.special}
          selectedCount={product.depositCount}
          price={productPrice(product.price, dollarPrice)}
        />
      ))}
    </View>
  );
};

const MemoizedProductCard = memo(ProductCard);

export default ProductListing;