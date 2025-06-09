import { useEffect, useState } from "react";
import {
  getUserSession,
  fetchUserDepositAndOrders,
  markProductsAsReceived,
} from "@/utils/functions";
import { DepositProduct } from "@/utils/types";
import useAdminCheck from "@/contexts/useAdminCheck";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  FlatList,
  View,
  Pressable,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";

import React from "react";
import HeaderBox from "@/components/HeaderBox";

import SelectDropdown from "react-native-select-dropdown";

function addAndMergeProducts(
  products: DepositProduct[],
  newProduct: DepositProduct
): DepositProduct[] {
  const index = products.findIndex(
    (p) => p.id === newProduct.id && p.received === newProduct.received
  );
  if (index !== -1) {
    products[index].count += newProduct.count;
  } else {
    products.push(newProduct);
  }
  return products;
}

export default function DepositScreen() {
  const [products, setProducts] = useState<DepositProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAdminCheck();
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string | number, number>
  >({});
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        fetchUserDepositAndOrders(
          userId,
          setProducts,
          setSelectedProducts,
          setError,
          setLoading
        );
      };
      loadData();
    } else {
      return;
    }
  }, [userId]);

  useEffect(() => {
    console.log(selectedProducts);
  }, [selectedProducts]);

  const handleMarkAsReceived = async () => {
    if (buttonLoading) return;
    setButtonLoading(true);
    if (Object.keys(selectedProducts).length) {
      if (notes.trim()) {
        try {
          let updatedProducts: DepositProduct[] = [];
          const SelectedProductsData: {
            id: string;
            title: string;
            count: number;
          }[] = [];
          // let mergeReceivedProducts: DepositProduct[] = [];

          products.forEach((prod) => {
            // selected count of this product
            const selectedCount = selectedProducts[prod.id as string];

            // if this product isn't selected or already fully received, keep it as-is
            if (prod.received) {
              updatedProducts = addAndMergeProducts(updatedProducts, prod);
              return;
            }

            // if product is partially received
            if (prod.count > selectedCount) {
              // push unreceived remaining part
              updatedProducts = addAndMergeProducts(updatedProducts, {
                ...prod,
                count: prod.count - selectedCount,
                received: false,
              });
              // push new received part
              updatedProducts = addAndMergeProducts(updatedProducts, {
                ...prod,
                count: selectedCount,
                received: true,
              });

              SelectedProductsData.push({
                id: prod.id as string,
                count: selectedCount,
                title: prod.title,
              });
            } else {
              // Entire product is marked as received

              updatedProducts = addAndMergeProducts(updatedProducts, {
                ...prod,
                received: true,
              });
              SelectedProductsData.push({
                id: prod.id as string,
                count: prod.count,
                title: prod.title,
              });
            }
          });

          setProducts(updatedProducts);
          await markProductsAsReceived(
            userId,
            updatedProducts.filter((p) => p.received !== undefined),
            SelectedProductsData,
            notes
          );
          setNotes("");
          setButtonLoading(false);
        } catch (error) {
          setButtonLoading(false);
          console.error("Failed to mark products as received:", error);
          // Optionally show a user-friendly message
        }
      } else {
        setButtonLoading(false);
        Alert.alert("تنبيه", "يرجى كتابة ملاحظة الاستلام.");
      }
    } else {
      setButtonLoading(false);
      Alert.alert("تنبيه", "يرجى تحديد المنتجات التي تم استلامها.");
    }
  };

  const renderProduct = ({
    item,
    index,
  }: {
    item: DepositProduct;
    index: number;
  }) => {
    return (
      <View style={styles.productItem}>
        <Text style={styles.productTitle}>{item.title}</Text>

        {item?.received != undefined && !item.received && (
          <>
            <View style={{ width: 40 }}>
              <SelectDropdown
                statusBarTranslucent={true}
                defaultValue={item.count > 0 ? item.count : 0}
                data={Array.from(Array(item.count + 1).keys())}
                onSelect={(count) => {
                  if (count > 0) {
                    setSelectedProducts((prev) => ({
                      ...prev,
                      [item.id as string | number]: count,
                    }));
                  } else {
                    setSelectedProducts((prev) => {
                      const newState = { ...prev };
                      delete newState[item.id as string | number];
                      return newState;
                    });
                  }
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem > 0 && selectedItem) || " "}
                      </Text>
                      <Icon
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        style={styles.dropdownButtonArrowStyle}
                      />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && { backgroundColor: "#E9ECEF" }),
                      }}
                    >
                      <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>
            <View style={styles.recievedBtn}>
              <Text
                style={{
                  width: 30,
                  height: 30,
                  fontSize: 16,
                  opacity: 0.6,
                  textAlignVertical: "center",
                  textAlign: "center",
                  backgroundColor: "#3ef2a1",
                  color: "#303030",
                  borderRadius: 8,
                }}
              >
                {item.count}
              </Text>
            </View>
          </>
        )}
        {item?.received != undefined && item.received && (
          <>
            <Text>تم الإستلام</Text>
            <View style={styles.recievedBtn}>
              <Text
                style={{
                  width: 30,
                  height: 30,
                  fontSize: 16,
                  opacity: 0.6,
                  textAlignVertical: "center",
                  textAlign: "center",
                  backgroundColor: "#E9ECEF",
                  color: "#303030",
                  borderColor: "#c8c8c8",
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                {item.count}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.squaresContainer}>
        <View style={styles.container}>
          <HeaderBox title="صندوق الودائع للأدمن" />
          <ThemedView style={styles.content}>
            <Text>جاري التحميل...</Text>
          </ThemedView>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox title="صندوق الودائع للأدمن" />
        {/* {error && (
          <ThemedView style={styles.content}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )} */}
        {products.length === 0 ? (
          <ThemedView style={{ ...styles.content, flex: 1 }}>
            <Text style={styles.dangerAlert}>لا يوجد طلبات</Text>
          </ThemedView>
        ) : (
          <FlatList
            data={products}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            renderItem={renderProduct}
            keyExtractor={(item, index) => index.toString()}
            style={styles.list}
          />
        )}
        <ThemedView style={{ ...styles.content, paddingTop: 12, flex: "none" }}>
          <TextInput
            style={styles.input}
            placeholder="ملاحظات (إجباري)"
            value={notes}
            onChangeText={setNotes}
          />
          <TouchableOpacity onPress={() => handleMarkAsReceived()}>
            <View
              style={{
                width: "100%",
                gap: 8,
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#4FFFB0",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!buttonLoading && (
                <>
                  <Icon name="cart-outline" style={{ fontSize: 25 }} />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    إستلام المنتجات
                  </Text>
                </>
              )}
              {buttonLoading && (
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  جاري التحميل...
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 4,
    width: "100%",
    borderRadius: 4,
  },
  dropdownButtonStyle: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 3,
    paddingTop: 3,
    paddingBottom: 3,
  },
  dropdownButtonTxtStyle: {
    textAlign: "center",
    marginHorizontal: "auto",
    fontSize: 12,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownButtonArrowStyle: {
    fontSize: 16,
  },
  dropdownMenuStyle: {
    backgroundColor: "white",
    borderRadius: 6,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#151E26",
  },

  recievedBtn: {
    marginLeft: 6,
  },
  squaresContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  container: {
    height: "100%",
    width: "100%",
  },
  content: {
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
  list: { flex: 1 },
  productItem: {
    padding: 12,
    paddingRight: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productTitle: { fontSize: 16, flex: 1 },
  statusLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  error: { color: "red", marginBottom: 16 },
  dangerAlert: {
    marginVertical: 6,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingTop: 10,
    textAlign: "center",
    borderColor: "#F88379",
    backgroundColor: "#F8837960",
  },
});
