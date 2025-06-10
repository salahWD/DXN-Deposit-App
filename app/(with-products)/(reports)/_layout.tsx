import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";

export default function Reports() {
  return (
    <>
      <Stack>
        <Stack.Screen name="reports" options={{ headerShown: false }} />
        <Stack.Screen name="depts" options={{ headerShown: false }} />
        <Stack.Screen name="depositProducts" options={{ headerShown: false }} />
        <Stack.Screen name="points" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
