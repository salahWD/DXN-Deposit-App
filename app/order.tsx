import { StyleSheet, View, ScrollView, TouchableOpacity, Pressable, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
                <Text style={{ color: "black" }}>Go Back</Text>
              </Pressable>
              <ThemedText type="title" style={{flex: 1, textAlign: "right"}}>إنشاء طلب جديد</ThemedText>
            </ThemedView>

            <ProductListing/>

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
