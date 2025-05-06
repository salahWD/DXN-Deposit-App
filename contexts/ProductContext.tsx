import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { Product } from "@/utils/types";
import {
  getProductsFromDB,
  getDollarPrice,
  getDepositProductsFromDB,
} from "@/utils/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the shape of the context
interface ProductContextType {
  products: Product[];
  dollarPrice: number;
  loading: boolean;
  fetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const CACHE_KEY = "cached_products";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    tag: 1,
    count: 10,
    special: 1,
    price: 150,
    title: {
      ar: "قهوة لينجزي السوداء",
      tr: "Siyah Lingzhi Kahvesi",
    },
  },
  {
    id: 2,
    tag: 2,
    count: 5,
    special: 0,
    price: 80,
    title: {
      ar: "شاي الريشي",
      tr: "Reishi Çayı",
    },
  },
  {
    id: 3,
    tag: 3,
    count: 8,
    special: 2,
    price: 200,
    title: {
      ar: "سبيرولينا عضوية",
      tr: "Organik Spirulina",
    },
  },
  {
    id: 4,
    tag: 4,
    count: 15,
    special: 0,
    price: 50,
    title: {
      ar: "صابون الجانوديرما",
      tr: "Ganoderma Sabunu",
    },
  },
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dollarPrice, setDollarPrice] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortProducts = (products: Product[]) =>
    products.sort((a, b) => {
      const aSpecial = a.special ?? 0;
      const bSpecial = b.special ?? 0;
      if ((aSpecial === 1 || aSpecial === 2) && bSpecial === 0) return -1;
      if ((bSpecial === 1 || bSpecial === 2) && aSpecial === 0) return 1;
      const aTag = a.tag ?? 0;
      const bTag = b.tag ?? 0;
      return aTag - bTag;
    });

  const loadCachedProducts = async (): Promise<Product[] | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
      return null;
    } catch (e) {
      console.error("Error loading cached products:", e);
      return null;
    }
  };

  const saveCachedProducts = async (products: Product[]) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: products, timestamp: Date.now() })
      );
    } catch (e) {
      console.error("Error saving cached products:", e);
    }
  };

  // Merge products from both sources without duplicates
  const mergeProducts = (
    products: Product[],
    depositProducts: Product[]
  ): Product[] => {
    const productMap = new Map<number, Product>();

    // Add products from /products
    products.forEach((product) => {
      productMap.set(product.id, { ...product });
    });

    // Add or merge products from /deposits/<userID>/products
    depositProducts.forEach((dp) => {
      if (productMap.has(dp.id)) {
        // If product exists in both sources, merge properties
        const existing = productMap.get(dp.id)!;
        productMap.set(dp.id, {
          ...existing,
          count: dp.count ?? existing.count,
          received: dp.received,
          points: dp.points,
          title: {
            ar: dp.title.ar || existing.title.ar,
            tr: dp.title.tr || existing.title.tr,
          },
        });
      } else {
        // If product only in deposit, add it
        productMap.set(dp.id, { ...dp });
      }
    });

    return Array.from(productMap.values());
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assume userID is stored in AsyncStorage or passed as prop
      const userID = (await AsyncStorage.getItem("userID")) || "default_user";
      const [fetchedProducts, depositProducts, fetchDollarPrice] =
        await Promise.all([
          getProductsFromDB(),
          getDepositProductsFromDB(userID),
          getDollarPrice(),
        ]);
      const mergedProducts = mergeProducts(fetchedProducts, depositProducts);
      const sortedProducts = sortProducts(mergedProducts);
      setProducts(sortedProducts);
      setDollarPrice(fetchDollarPrice);
      await saveCachedProducts(sortedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
      // Fallback to cached data
      const cachedProducts = await loadCachedProducts();
      if (cachedProducts) {
        setProducts(sortProducts(cachedProducts));
      } else {
        setProducts(sortProducts(FALLBACK_PRODUCTS));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const cachedProducts = await loadCachedProducts();
      if (cachedProducts) {
        setProducts(sortProducts(cachedProducts));
        setLoading(false);
        fetchProducts();
      } else {
        setProducts(sortProducts(FALLBACK_PRODUCTS));
        setError("No internet connection. Showing fallback data.");
        setLoading(false);
        fetchProducts();
      }
    };
    initialize();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{ products, dollarPrice, loading, fetchProducts }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the ProductContext
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
