import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '@/components/custom-tab-bar';
import { HamburgerButton } from '@/components/hamburger-button';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerLeft: () => <HamburgerButton />,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="posts" options={{ title: 'Posts' }} />
      <Tabs.Screen name="apps" options={{ title: 'Apps' }} />
    </Tabs>
  );
}
