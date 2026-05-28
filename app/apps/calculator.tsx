import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { formatIDR, TIP_PRESETS, useTipCalculator } from '@/hooks/use-tip-calculator';

export default function CalculatorScreen() {
  const c = useTipCalculator();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Tip Calculator
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Hitung tip & split tagihan
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total tagihan
          </Text>
          <View className="flex-row items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <Text className="text-2xl font-bold text-gray-400 dark:text-gray-500">
              Rp
            </Text>
            <TextInput
              value={c.billText}
              onChangeText={c.setBillText}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="flex-1 text-2xl font-bold text-gray-900 dark:text-white"
            />
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tip ({c.tipPercent}%)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TIP_PRESETS.map((p) => {
              const isActive = p === c.tipPercent;
              return (
                <Pressable
                  key={p}
                  onPress={() => c.setTipPercent(p)}
                  className={`flex-1 min-w-[64px] py-3 rounded-lg items-center border ${
                    isActive
                      ? 'bg-primary border-primary'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}>
                  <Text
                    className={`font-semibold ${
                      isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {p}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Jumlah orang
          </Text>
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={c.decrementPeople}
              className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center active:opacity-70">
              <Text className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                −
              </Text>
            </Pressable>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {c.people}
            </Text>

            <Pressable
              onPress={c.incrementPeople}
              className="w-12 h-12 rounded-full bg-primary items-center justify-center active:opacity-70">
              <Text className="text-2xl font-bold text-white">+</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-primary rounded-2xl p-5 gap-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/70 text-xs">Tip total</Text>
              <Text className="text-white text-lg font-bold">
                {formatIDR(c.tipAmount)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white/70 text-xs">Total bayar</Text>
              <Text className="text-white text-lg font-bold">
                {formatIDR(c.totalAmount)}
              </Text>
            </View>
          </View>

          <View className="h-px bg-white/20" />

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/70 text-xs">Tip / orang</Text>
              <Text className="text-white text-base font-semibold">
                {formatIDR(c.tipPerPerson)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white/70 text-xs">Bayar / orang</Text>
              <Text className="text-white text-2xl font-bold">
                {formatIDR(c.perPerson)}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={c.reset}
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 items-center active:bg-gray-100 dark:active:bg-gray-800">
          <Text className="text-gray-600 dark:text-gray-300 font-medium">Reset</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
