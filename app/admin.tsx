import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { StyleSheet, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router"; // Use expo-router for navigation

import AdminPage from "@/app/AdminScreen";
import useAdminCheck from "@/contexts/useAdminCheck";

const ProtectedAdminPage = () => {
  const handleGoBack = () => {
    router.replace("/home");
  };

  const router = useRouter();
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) return <Text>Loading...</Text>;
  if (!isAdmin) {
    router.replace("/home");
    return null;
  }

  return (
    <View style={styles.squaresContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.titleContainer}>
            <Pressable onPress={handleGoBack}>
              <Icon
                name="chevron-left"
                style={{
                  fontSize: 25,
                  backgroundColor: "#E9ECEF",
                  borderRadius: 8,
                  padding: 8,
                }}
              />
            </Pressable>
            <ThemedText
              type="title"
              style={{
                flex: 1,
                textAlign: "right",
                paddingTop: 8,
              }}
            >
              مراجعة الطلبات
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <AdminPage />
      </ThemedView>
    </View>
  );
};

export default ProtectedAdminPage;

const styles = StyleSheet.create({
  squaresContainer: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  container: { height: "100%", width: "100%" },
  content: {
    paddingHorizontal: 32,
    paddingTop: 28,
    gap: 16,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
