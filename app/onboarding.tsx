import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '📱',
    title: 'Selamat datang!',
    desc: 'Aplikasi sandbox untuk belajar React Native + NativeWind. Semua tanpa backend, semua di device kamu.',
    color: 'bg-blue-500',
  },
  {
    icon: '🧩',
    title: '6 Mini Apps',
    desc: 'Todo, Habit, Tip Calculator, Quiz, Pomodoro, Expense — masing-masing fokus belajar konsep React Native tertentu.',
    color: 'bg-purple-500',
  },
  {
    icon: '📚',
    title: 'Belajar dari Praktik',
    desc: 'Setiap fitur dilengkapi dokumentasi di folder docs/ — baca sambil pelajari kodenya.',
    color: 'bg-green-500',
  },
];

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (index + 1), animated: true });
    } else {
      finish();
    }
  };

  const skip = () => finish();

  const finish = async () => {
    await AsyncStorage.setItem('@app/onboarding-done', 'true');
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Skip button */}
      <View className="flex-row justify-end px-4 pt-12">
        <Pressable onPress={skip} className="px-3 py-2 active:opacity-60">
          <Text className="text-gray-500 dark:text-gray-400 font-medium">Lewati</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1">
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{ width: SCREEN_WIDTH }}
            className="items-center justify-center px-8">
            <View
              className={`w-32 h-32 rounded-3xl ${slide.color} items-center justify-center mb-8`}>
              <Text className="text-6xl">{slide.icon}</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {slide.title}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6">
              {slide.desc}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer: dots + button */}
      <View className="px-6 pb-12 gap-6">
        <View className="flex-row justify-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === index ? 'w-6 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </View>

        <Pressable
          onPress={next}
          className="bg-primary rounded-full py-4 items-center active:opacity-70">
          <Text className="text-white font-bold text-base">
            {index < SLIDES.length - 1 ? 'Lanjut' : 'Mulai'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
