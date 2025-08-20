import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { ThemedView } from "@/components/ThemedView";
import {
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import HeaderBox from "@/components/HeaderBox";
import ProductCard from "@/components/ProductCard";
import { ThemedText } from "@/components/ThemedText";
import { useProducts } from "@/contexts/ProductContext";
import React, { useEffect } from "react";

export default function Reports() {
  const [error, setError] = useState("");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filter, setFilter] = useState<boolean>(false);
  const { products } = useProducts();
  const { data } = useLocalSearchParams();

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (data) {
      try {
        const parsedData = JSON.parse(data as string);
        setDeposits(parsedData);
        console.log("Received deposits:", parsedData);
      } catch (e) {
        console.error("Failed to parse passed data:", e);
      }
    }
  }, [data]);

  useEffect(() => {
    const backAction = () => {
      router.replace("/(reports)");
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, []);

  const handleFilterPress = (value: boolean) => {
    setFilter(value)
  };

  return (
    <ThemedView style={styles.squaresContainer}>
      <View style={styles.container}>
        <HeaderBox
          title="المنتجات المتبقية"
          handleGoBack={() => {
            router.replace("/(reports)");
          }}
        />
        {error && (
          <ThemedView style={{ ...styles.content, paddingBottom: 12 }}>
            <Text style={styles.error}>{error}</Text>
          </ThemedView>
        )}
        <View
          style={{
            ...styles.content,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <View style={{ ...styles.squareContainer, opacity: filter ? 1 : 0.25, backgroundColor: filter ? "#E6E6FAab" : "#777" }}>
            <Pressable style={styles.square} onPress={() => handleFilterPress(true)}>
              <View style={{ alignItems: "center" }}>
                <ThemedText style={styles.squareText}>حسب المستخدم</ThemedText>
              </View>
            </Pressable>
          </View>
          <View style={{ ...styles.squareContainer, opacity: filter ? 0.25 : 1, backgroundColor: filter ? "#777" : "#E6E6FAab" }}>
            <Pressable style={styles.square} onPress={() => handleFilterPress(false)}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.squareText}>حسب المنتج</Text>
              </View>
            </Pressable>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          {(products.length === 0 && !filter) || (deposits?.length === 0 && filter) ? (
            <ThemedView style={{ ...styles.content, flex: 1 }}>
              <Text style={styles.dangerAlert}>لا يوجد بيانات لعرضها</Text>
            </ThemedView>
          ) : (
            <View style={{ flex: 1 }}>

              {!filter && (<FlatList
                contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 10, paddingBottom: 110 }}
                data={products}
                renderItem={({ item: product }) => {
                  let availableCount = 0;
                  deposits?.forEach((deposit) => {
                    deposit?.products && deposit?.products.forEach((prod: { id: string; received: boolean; count: number; }) => {
                      if (prod.id == product.id && prod.received == false && prod.count > 0) {
                        availableCount += prod.count;
                      }
                    })
                  });

                  return (
                    <ProductCard
                      key={`${product.id}-${resetKey}`}
                      handleChangedCount={() => { }}
                      depositCount={availableCount}
                      displayOnly={true}
                      product={product}
                      price={0}
                      noPrice={true}
                      customPointsText={"إجمالي المنتجات"}
                    />
                  );
                }}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text>No Products found</Text>}
              />)}

              {filter && (<FlatList
                contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 10, paddingBottom: 110 }}
                data={deposits}
                renderItem={({ item: deposit }) => {
                  if (
                    !deposit?.products ||
                    !deposit?.products.length ||
                    deposit?.products?.filter(
                      (item: { received: boolean; count: number }) =>
                        item.received == false && item.count > 0
                    ).length == 0
                  )
                    return null;

                  return (
                    <View style={styles.card}>
                      <Text style={styles.title}>{deposit.id}</Text>
                      <View>
                        {deposit?.products?.map(
                          (prod: { received: any; title: string; count: number }, idx: number) => {
                            if (prod.received) return null;
                            return (
                              <Text style={styles.price} key={idx}>
                                {prod.title} (x{prod.count})
                              </Text>
                            );
                          }
                        )}
                      </View>
                    </View>
                  );
                }}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text>No Products found</Text>}
              />)}

            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  squaresContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  container: { height: "100%", width: "100%" },
  content: {
    padding: 32,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 16,
    overflow: "hidden",
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
    backgroundColor: "#f884792e",
  },
  squareContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 10,
  },
  square: {
    minHeight: 110,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#303030",
    borderWidth: 2,
    paddingVertical: 12,
    padding: 8,
  },
  squareText: {
    color: "#333",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  squareValue: { color: "white", opacity: 0.75, marginTop: 10, fontSize: 14 },

  card: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    alignItems: "center",
  },
  title: {
    marginLeft: 7,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    color: "#000",
  },
});
