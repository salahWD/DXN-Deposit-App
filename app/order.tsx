import { StyleSheet, View, ScrollView, TouchableOpacity, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductListing from '@/components/ProductListing';
import { router } from 'expo-router';


export default function OrderScreen() {

  const handleGoBack = () => {
    router.replace('/home');
  };

  return (
    <ScrollView>
      <ThemedView style={styles.squaresContainer}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            
            <ThemedView style={styles.titleContainer}>
              <Pressable onPress={handleGoBack}>
                <Icon name='chevron-left' style={{ fontSize: 25,  backgroundColor: "#E9ECEF", borderRadius: 8, padding: 8}} />
              </Pressable>
              <ThemedText type="title" style={{flex: 1, textAlign: "right"}}>إنشاء طلب جديد</ThemedText>
            </ThemedView>

            <ProductListing/>

            <View>
              <Pressable onPress={() => console.log(1)}>
                <View style={{ width: "100%", gap: 8, padding: 12, borderRadius: 8, backgroundColor: "#4FFFB0", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <Icon name='cart-outline' style={{ fontSize: 25,}} />
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>إتمام الطلب</Text>
                </View>
              </Pressable>
            </View>

          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  squaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  square: {
    color: "black",
  },
  squareText: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
});
