import { useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { PieChart } from 'react-native-gifted-charts';

import { formatIDR, useExpenses, type Transaction } from '@/hooks/use-expenses';

const PIE_COLORS = [
  '#0a7ea4', // primary
  '#f59e0b', // amber
  '#22c55e', // green
  '#ec4899', // pink
  '#a855f7', // purple
  '#94a3b8', // slate
];

type ExpenseSlice = {
  category: string;
  amount: number;
  color: string;
  percent: number;
};

function buildExpenseBreakdown(transactions: Transaction[]): {
  slices: ExpenseSlice[];
  total: number;
} {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  if (total === 0) return { slices: [], total: 0 };

  const byCategory: Record<string, number> = {};
  for (const t of expenses) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  }

  const slices = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], i) => ({
      category,
      amount,
      color: PIE_COLORS[i % PIE_COLORS.length],
      percent: (amount / total) * 100,
    }));

  return { slices, total };
}

const CATEGORY_EMOJI: Record<string, string> = {
  Makanan: '🍔',
  Transport: '🚗',
  Belanja: '🛍️',
  Hiburan: '🎮',
  Tagihan: '💡',
  Gaji: '💰',
  Bonus: '🎁',
  Hadiah: '🎀',
  Lainnya: '📦',
};

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
}

export default function ExpensesScreen() {
  const e = useExpenses();
  const isExpense = e.type === 'expense';

  const breakdown = useMemo(
    () => buildExpenseBreakdown(e.transactions),
    [e.transactions]
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="p-4 gap-4">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Expense Tracker
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Catat pemasukan & pengeluaran
          </Text>
        </View>

        {/* Balance card */}
        <View className="bg-primary rounded-2xl p-5">
          <Text className="text-white/70 text-xs font-medium uppercase tracking-wide">
            Saldo
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {formatIDR(e.totals.balance)}
          </Text>
          <View className="flex-row gap-4 mt-4">
            <View className="flex-1">
              <Text className="text-white/70 text-xs">Pemasukan</Text>
              <Text className="text-white text-base font-semibold">
                + {formatIDR(e.totals.income)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white/70 text-xs">Pengeluaran</Text>
              <Text className="text-white text-base font-semibold">
                − {formatIDR(e.totals.expense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Breakdown chart */}
        {breakdown.slices.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Breakdown Pengeluaran
            </Text>
            <View className="flex-row items-center gap-4">
              <PieChart
                data={breakdown.slices.map((s) => ({
                  value: s.amount,
                  color: s.color,
                }))}
                radius={70}
                innerRadius={48}
                donut
                centerLabelComponent={() => (
                  <View className="items-center">
                    <Text className="text-[10px] text-gray-500">Total</Text>
                    <Text className="text-xs font-bold text-gray-900 dark:text-white">
                      {formatIDR(breakdown.total).replace('Rp ', '')}
                    </Text>
                  </View>
                )}
              />
              <View className="flex-1 gap-1.5">
                {breakdown.slices.map((slice) => (
                  <View key={slice.category} className="flex-row items-center gap-2">
                    <View
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: slice.color }}
                    />
                    <Text
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1"
                      numberOfLines={1}>
                      {slice.category}
                    </Text>
                    <Text className="text-xs font-semibold text-gray-900 dark:text-white">
                      {Math.round(slice.percent)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Add form */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 gap-3">
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            Tambah Transaksi
          </Text>

          {/* Type toggle */}
          <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Pressable
              onPress={() => e.switchType('expense')}
              className={`flex-1 py-2 rounded-md ${isExpense ? 'bg-red-500' : ''}`}>
              <Text
                className={`text-center text-sm font-medium ${
                  isExpense ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                Pengeluaran
              </Text>
            </Pressable>
            <Pressable
              onPress={() => e.switchType('income')}
              className={`flex-1 py-2 rounded-md ${!isExpense ? 'bg-green-500' : ''}`}>
              <Text
                className={`text-center text-sm font-medium ${
                  !isExpense ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                Pemasukan
              </Text>
            </Pressable>
          </View>

          {/* Amount */}
          <View className="flex-row items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <Text className="text-xl font-bold text-gray-400 dark:text-gray-500">Rp</Text>
            <TextInput
              value={e.amountText}
              onChangeText={e.setAmountText}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="flex-1 text-xl font-bold text-gray-900 dark:text-white"
            />
          </View>

          {/* Category */}
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Kategori
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {e.categories.map((cat) => {
                const isActive = cat === e.category;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => e.setCategory(cat)}
                    className={`px-3 py-2 rounded-lg border ${
                      isActive
                        ? 'bg-primary border-primary'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    }`}>
                    <Text
                      className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {CATEGORY_EMOJI[cat] ?? '📦'} {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Note */}
          <TextInput
            value={e.note}
            onChangeText={e.setNote}
            placeholder="Catatan (opsional)"
            placeholderTextColor="#9ca3af"
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
          />

          <Pressable
            onPress={e.addTransaction}
            disabled={e.amount <= 0}
            className={`rounded-xl py-3 items-center active:opacity-70 ${
              e.amount > 0 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
            <Text className="text-white font-bold">Tambah</Text>
          </Pressable>
        </View>

        {/* Transactions list */}
        <View>
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Riwayat ({e.transactions.length})
          </Text>

          {e.transactions.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-8 items-center border border-dashed border-gray-200 dark:border-gray-700">
              <Text className="text-4xl mb-2">💸</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                Belum ada transaksi.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {e.transactions.map((tx) => {
                const isInc = tx.type === 'income';
                return (
                  <Animated.View
                    key={tx.id}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    layout={LinearTransition.duration(200)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 flex-row items-center gap-3 border border-gray-100 dark:border-gray-700">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isInc
                          ? 'bg-green-100 dark:bg-green-900/40'
                          : 'bg-red-100 dark:bg-red-900/40'
                      }`}>
                      <Text className="text-lg">
                        {CATEGORY_EMOJI[tx.category] ?? '📦'}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                        {tx.category}
                      </Text>
                      {tx.note ? (
                        <Text
                          className="text-xs text-gray-500 dark:text-gray-400"
                          numberOfLines={1}>
                          {tx.note}
                        </Text>
                      ) : null}
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatRelative(tx.createdAt)}
                      </Text>
                    </View>

                    <Text
                      className={`text-sm font-bold ${
                        isInc
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                      {isInc ? '+' : '−'} {formatIDR(tx.amount)}
                    </Text>

                    <Pressable
                      onPress={() => e.deleteTransaction(tx.id)}
                      className="w-7 h-7 items-center justify-center rounded-lg active:bg-red-50 dark:active:bg-red-900/30">
                      <Text className="text-red-500">×</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
