import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'home',
  explore: 'explore',
  posts: 'article',
  apps: 'apps',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  explore: 'Explore',
  posts: 'Posts',
  apps: 'Apps',
};

const ACTIVE_COLOR = '#0a7ea4';

type TabButtonProps = {
  isFocused: boolean;
  iconName: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
};

function TabButton({
  isFocused,
  iconName,
  label,
  onPress,
  onLongPress,
  isDark,
}: TabButtonProps) {
  const activeProgress = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    activeProgress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused, activeProgress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
    transform: [
      {
        scale: 0.7 + activeProgress.value * 0.3,
      },
    ],
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -activeProgress.value * 2 }, { scale: pressScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + activeProgress.value * 0.4,
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.88, { damping: 12, stiffness: 300 });
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const inactiveColor = isDark ? '#9ca3af' : '#6b7280';
  const iconColor = isFocused ? ACTIVE_COLOR : inactiveColor;
  const labelColor = isFocused ? ACTIVE_COLOR : inactiveColor;
  const pillBg = isDark ? 'rgba(10,126,164,0.18)' : 'rgba(10,126,164,0.1)';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}>
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.pill, pillStyle, { backgroundColor: pillBg }]} />
        <Animated.View style={iconWrapStyle}>
          <MaterialIcons name={iconName} size={22} color={iconColor} />
        </Animated.View>
      </View>
      <Animated.Text
        style={[
          styles.label,
          labelStyle,
          {
            color: labelColor,
            fontWeight: isFocused ? '700' : '500',
          },
        ]}
        numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
        },
      ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconName = TAB_ICONS[route.name] ?? 'circle';
        const label =
          TAB_LABELS[route.name] ??
          (typeof options.title === 'string' ? options.title : route.name);

        const onPress = () => {
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabButton
            key={route.key}
            isFocused={isFocused}
            iconName={iconName}
            label={label}
            onPress={onPress}
            onLongPress={onLongPress}
            isDark={isDark}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
