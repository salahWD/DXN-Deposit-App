import { router, Stack } from "expo-router";
import { ProductProvider } from "@/contexts/ProductContext";
import { StatusBar } from "expo-status-bar";
import { BackHandler, I18nManager } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect } from "react";

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  useEffect(() => {
    ScreenOrientation.unlockAsync();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, []);

  const backAction = () => {
    router.replace("/home");
    return true;
  };

  BackHandler.addEventListener("hardwareBackPress", backAction);

  return (
    <ProductProvider>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="deptAmount" options={{ headerShown: false }} />
        <Stack.Screen name="actions" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ headerShown: false }} />
        <Stack.Screen name="postponedPoints" options={{ headerShown: false }} />
        <Stack.Screen name="deposit" options={{ headerShown: false }} />
        <Stack.Screen name="makeTransaction" options={{ headerShown: false }} />
        <Stack.Screen name="PointsOrders" options={{ headerShown: false }} />
        <Stack.Screen name="reports" options={{ headerShown: false }} />
        <Stack.Screen
          name="TransactionsOrders"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen
          name="depositManagement"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ProductProvider>
  );
}
