import { StyleSheet, View, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';


export default function HomeScreen() {

  const squareData = [
    { title: 'طلب جديد', color: '#4CAF50', value: "+" }, // Green
    { title: 'صندوق الودائع', color: '#2196F3', value: "45 منتج" }, // Blue
    { title: 'عدد المنتجات المودوعة', color: '#FF9800', value: "10" }, // Orange
    { title: 'الرصيد الحالي', color: '#9C27B0', value: "$45.00" }, // Purple
  ];

  const handleSquarePress = (route: number) => {
    console.log(route)
    if (route == 0) {
      router.replace('/order');
    }else if (route == 1) {
      // router.replace('/login');
    }else if (route == 2) {
      // router.replace('/login');
    }else {
      // router.replace('/login');
    }
  };

  return (
    <ScrollView>
      <ThemedView style={styles.squaresContainer}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">أهلا وسهلا</ThemedText>
            </ThemedView>

            <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 15 }}>
              {squareData.map((item, index) => (
                <View
                  key={index}
                  style={[styles.square, { backgroundColor: item.color }]}>
                  <Pressable onPress={() => handleSquarePress(index)}>
                    <View style={{ alignItems: "center" }}>
                      <ThemedText style={styles.squareText}>{item.title}</ThemedText>
                      <ThemedText type="subtitle" style={{ color: "white", opacity: 0.75, marginTop: 10 }}>{item.value}</ThemedText>
                    </View>
                  </Pressable>
                </View>
              ))}
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
    marginBottom: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  squaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  square: {
    width: '47%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  squareText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
});
