import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ProductProvider } from "@/contexts/ProductContext";

import { StatusBar } from "expo-status-bar";
import { I18nManager } from "react-native";
import { useEffect } from "react";
import "react-native-reanimated";

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

console.log("layout - page");

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
