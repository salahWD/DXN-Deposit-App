import { Stack } from "expo-router";
import { ProductProvider } from "@/contexts/ProductContext";
import { StatusBar } from "expo-status-bar";
import { I18nManager } from "react-native";
import React from "react";

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  return (
    <ProductProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ headerShown: false }} />
        <Stack.Screen name="deposit" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen
          name="depositManagement"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ProductProvider>
  );
}
