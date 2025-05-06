import { ThemedView } from "@/components/ThemedView";

import { StyleSheet, Text, View } from "react-native";

import AdminPage from "@/app/AdminScreen";
import useAdminCheck from "@/contexts/useAdminCheck";
import HeaderBox from "@/components/HeaderBox";
import React from "react";

const ProtectedAdminPage = () => {
  const { isLoading } = useAdminCheck();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={styles.squaresContainer}>
      <ThemedView style={styles.container}>
        <HeaderBox title="مراجعة الطلبات" />
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
