import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function TabLayout() {
  // Optional: Restart the app if needed (not always required)
  useEffect(() => {
    if (I18nManager.isRTL !== true) {
      // You may need to restart the app for the change to take effect fully
      // Updates.reloadAsync() from 'expo-updates' can be used if necessary
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        // Ensure tab bar respects RTL
        tabBarStyle: { direction: 'rtl' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}