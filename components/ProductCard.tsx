import React, { useState, useEffect } from 'react';
import { Text ,View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown'

import { ThemedText } from '@/components/ThemedText';

import { Product } from "@/utils/types"

const productCountList = Array.from(Array(51).keys());

interface ProductCardProps extends Pick<Product, "price" | "id" |  "special" | "depositCount" > {
  selectedCount?: number;
  title: string;
}

const ProductCard = ({ id, title, depositCount=0, selectedCount=0, special=0, price=0 }: ProductCardProps) => {

  const [count, setCount] = useState(0);
 
  useEffect(() => {
    setCount(selectedCount)
  }, [selectedCount]);

  const handleChangedText = (value: ProductCardProps["selectedCount"]) => {
    setCount(value || 0);
  }

  return (
    <View style={{...styles.card, backgroundColor: (special >= 1) ? "#E6E6FA" : "white"}}>

      <View style={styles.blockContainer}>
        <View style={styles.block}>
          <ThemedText type="default" style={{ fontSize: 10, lineHeight: 12, color: (depositCount == 0) ? "black" : (depositCount > 0) ? "green": "red" }}>في الصندوق</ThemedText>
        </View>
        <ThemedText type="default" style={{ color: (depositCount == 0) ? "black" : (depositCount > 0) ? "green": "red" }}>{depositCount}</ThemedText>
      </View>
      <View style={{...styles.blockContainer, width: 45 }}>
        <View style={styles.block}>
          <ThemedText type="default" style={{ fontSize: 10, lineHeight: 12 }}>المطلوب</ThemedText>
        </View>
        {/* <ThemedText type="default">4</ThemedText> */}
        <SelectDropdown
          statusBarTranslucent={true}
          defaultValue={selectedCount}
          // disabled={disabled || stopped}
          data={productCountList}
          onSelect={(selectedItem, index) => {
            handleChangedText(selectedItem)
          }}
          renderButton={(selectedItem, isOpened) => {
            return (
              <View style={styles.dropdownButtonStyle}>
                <Text style={styles.dropdownButtonTxtStyle}>
                  {(selectedItem > 0 && selectedItem) || ' '}
                </Text>
                <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#E9ECEF'})}}>
                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={styles.dropdownMenuStyle}
          />
      </View>

      <View style={styles.details}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.price}>{price}<Text style={{ fontSize: 10 }}> TL</Text></ThemedText>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingLeft: 6,
    paddingTop: 6,
    paddingRight: 8,
    paddingBottom: 6,
    marginBottom: 7,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  details: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    marginLeft: 7,
    textAlign: "right",
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  blockContainer: {
    textAlign: "right",
    width: 55,
    display: "flex",
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
    gap: 3,
  },
  block: {
    textAlign: "right",
    alignItems: "center",
    display: "flex",
    width: "100%",
  },

  dropdownButtonStyle: {
    width: "100%",
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 3,
    paddingTop: 3,
    paddingBottom: 3,
  },
  dropdownButtonTxtStyle: {
    textAlign: "center",
    marginHorizontal: "auto",
    fontSize: 12,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 16,
  },
  dropdownMenuStyle: {
    backgroundColor: 'white',
    borderRadius: 6,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#151E26',
  },
});

export default ProductCard;