import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

export default function HeaderBox({ title }: { title: string }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.replace("/home");
  };

  return (
    <ThemedView style={styles.content}>
      <ThemedView style={styles.titleContainer}>
        <Pressable onPress={handleGoBack}>
          <Icon name="chevron-left" style={styles.icon} />
        </Pressable>
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    paddingTop: 32,
    gap: 16,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 0,
  },
  icon: {
    fontSize: 25,
    backgroundColor: "#E9ECEF",
    borderRadius: 8,
    padding: 8,
  },
  title: { paddingTop: 4, flex: 1, textAlign: "right" },
});
