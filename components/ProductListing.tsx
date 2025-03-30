import React, { useState, useEffect } from 'react';
import { Text ,View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown'

import { I18nManager } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

// Force RTL layout (as per your earlier request)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const productCountList = Array.from(Array(50).keys());

// export type ProductProps = {
//   item: {id: number, title: string, img: String, price: number, points: number, special?: number},
//   calcFooter: Function,
//   dollarPrice?: number,
//   selectedCount?: number,
//   customStyle?: {},
//   disabled?: boolean,
//   stopped?: boolean,
// };

interface ProductCardProps {
  title: string;
  selectedCount: number;
  price: string;
}

const ProductCard = ({ title, selectedCount=0, price }: ProductCardProps) => {

  const [count, setCount] = useState(0);
 
  useEffect(() => {
    setCount(selectedCount)
  }, [selectedCount]);

  const handleChangedText = (value: ProductCardProps["selectedCount"]) => {
    setCount(value);
    // calcFooter({ id: item.id, count: value });
  }

  return (
    <View style={styles.card}>

      <View style={styles.blockContainer}>
        <View style={styles.block}>
          <ThemedText type="default" style={{ fontSize: 10, lineHeight: 12 }}>في الصندوق</ThemedText>
        </View>
        <ThemedText type="default">6</ThemedText>
      </View>
      <View style={{...styles.blockContainer, width: 45 }}>
        <View style={styles.block}>
          <ThemedText type="default" style={{ fontSize: 10, lineHeight: 12 }}>المطلوب</ThemedText>
        </View>
        <ThemedText type="default">4</ThemedText>
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
        <ThemedText style={styles.price}>{price}</ThemedText>
      </View>

    </View>
  );
};

const ProductListing = () => {
  const products = [
    {
      title: 'Lorem ipsum ipsum',
      price: '$165.00',
      count: 114,
    },
    {
      title: 'Lorem ipsum',
      price: '$165.00',
      count: 113,
    },
  ];

  return (
    <View style={styles.container}>
      {products.map((product, index) => (
        <ProductCard
          key={index}
          title={product.title}
          selectedCount={product.count}
          price={product.price}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingLeft: 6,
    paddingTop: 6,
    paddingRight: 8,
    paddingBottom: 6,
    marginBottom: 10,
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
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  blockContainer: {
    textAlign: "right",
    backgroundColor: "red",
    width: 55,
    display: "flex",
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  block: {
    textAlign: "right",
    alignItems: "center",
    display: "flex",
    width: "100%",
  },

  dropdownButtonStyle: {
    width: "80%",
    height: 22,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonTxtStyle: {
    width: "100%",
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
    borderRadius: 8,
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

export default ProductListing;