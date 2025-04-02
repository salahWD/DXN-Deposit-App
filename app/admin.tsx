import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { StyleSheet, ScrollView, Pressable, Text, View } from "react-native";
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
    <ScrollView>
      <ThemedView style={styles.squaresContainer}>
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
              <ThemedText type="title" style={{ flex: 1, textAlign: "right" }}>
                مراجعة الطلبات
              </ThemedText>
            </ThemedView>
            <AdminPage />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

export default ProtectedAdminPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  squaresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
});
