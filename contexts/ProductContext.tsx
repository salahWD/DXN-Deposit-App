// contexts/ProductContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Product } from '@/utils/types';
import { getProductsFromDB, getDollarPrice } from '@/utils/functions';

// Define the shape of the context
interface ProductContextType {
  products: Product[];
  dollarPrice: number;
  loading: boolean;
  fetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Product Provider Component
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dollarPrice, setDollarPrice] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProductsFromDB();
      const sortedProducts = fetchedProducts.sort((a, b) => {
        // Prioritize items with special = 1 or 2
        if ((a.special === 1 || a.special === 2) && (!b.special || b.special === 0)) return -1;
        if ((b.special === 1 || b.special === 2) && (!a.special || a.special === 0)) return 1;
        // If both have special status, sort by tag
        return (a.tag || 0) - (b.tag || 0);
      });
      setProducts(sortedProducts);
      const fetchDollarPrice = await getDollarPrice();
      setDollarPrice(fetchDollarPrice);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, dollarPrice, loading, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the ProductContext
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};