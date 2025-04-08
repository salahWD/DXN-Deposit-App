import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "المعذرة" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">هذه الصفحة غير موجودة</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">العودة الى الرئيسية</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
