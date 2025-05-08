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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(with-products)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ProductProvider>
  );
}
