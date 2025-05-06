import React, { memo, useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SelectDropdown from "react-native-select-dropdown";

import { ThemedText } from "@/components/ThemedText";

import { Product } from "@/utils/types";

const productCountList = Array.from(Array(51).keys());

interface ProductCardProps extends Pick<Product, "price"> {
  selectedCount?: number;
  depositCount?: number;
  product: Product;
  handleChangedCount: (product: Product, count: number) => void;
  displayOnly: Boolean;
}

const ProductCard = ({
  handleChangedCount,
  selectedCount = 0,
  depositCount = 0,
  price = 0,
  product,
  displayOnly = false,
}: ProductCardProps) => {
  const {
    title: { ar: title },
    special = 0,
  } = product;
  const [count, setCount] = useState(selectedCount);
  const isFirstRender = useRef(true);

  // Reset count when selectedCount changes (e.g., after submission)
  if (!displayOnly) {
    useEffect(() => {
      setCount(selectedCount);
    }, [selectedCount]);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark the first render as done
      return; // Skip the first execution
    }

    console.log("productCard - handleChangedCount - product count changed");
    if (!displayOnly) {
      handleChangedCount(product, count);
    }
  }, [count]);

  return (
    <View
      style={{
        ...styles.card,
        backgroundColor: special >= 1 ? "#E6E6FAab" : "white",
      }}
    >
      <View style={styles.blockContainer}>
        <View
          style={{
            ...styles.block,
            backgroundColor:
              depositCount == 0
                ? "#dedede"
                : depositCount > 0
                ? "#4FFFB0bd"
                : "#F8837960",
          }}
        >
          <ThemedText
            type="default"
            style={{
              fontSize: 10,
              lineHeight: 12,
              color: "#333",
            }}
          >
            نقاط مؤجلة
          </ThemedText>
          <ThemedText
            type="default"
            style={{
              color: "#333",
            }}
          >
            {depositCount}
          </ThemedText>
        </View>
      </View>
      {!displayOnly && (
        <View style={{ ...styles.blockContainer, width: 45 }}>
          <View style={styles.block}>
            <ThemedText type="default" style={{ fontSize: 10, lineHeight: 12 }}>
              المطلوب
            </ThemedText>
          </View>
          <SelectDropdown
            statusBarTranslucent={true}
            defaultValue={count}
            data={productCountList}
            onSelect={setCount}
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
      )}

      <View style={styles.details}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.price}>
          {price}
          <Text style={{ fontSize: 10 }}> TL</Text>
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingLeft: 6,
    paddingTop: 6,
    paddingRight: 8,
    paddingBottom: 6,
    marginBottom: 7,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  details: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    marginLeft: 7,
    textAlign: "right",
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  blockContainer: {
    textAlign: "right",
    width: 60,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    gap: 3,
  },
  block: {
    textAlign: "right",
    alignItems: "center",
    display: "flex",
    borderRadius: 8,
    padding: 4,
    paddingTop: 8,
    flex: 1,
    width: "100%",
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
});

export default memo(ProductCard);
