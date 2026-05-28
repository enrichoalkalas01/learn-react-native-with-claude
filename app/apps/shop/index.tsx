import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';

import { CATEGORIES, formatIDR, useShop, type CartItem } from '@/hooks/use-shop';
import { useToast } from '@/context/toast-context';
import { useConfetti } from '@/context/confetti-context';
import { haptic } from '@/lib/haptic';

function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row items-center gap-0.5">
      <Text className="text-xs">⭐</Text>
      <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function ShopScreen() {
  const s = useShop();
  const toast = useToast();
  const confetti = useConfetti();

  const sheetRef = useRef<BottomSheet>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);

  const snapPoints = useMemo(() => ['60%', '88%'], []);

  const openCart = () => {
    sheetRef.current?.snapToIndex(0);
    haptic.selection();
  };

  const closeCart = () => sheetRef.current?.close();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const handleAdd = (id: string, name: string) => {
    s.addToCart(id);
    haptic.light();
    toast.success(`${name} ditambahkan`);
  };

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      `Bayar ${formatIDR(s.totalPrice)} untuk ${s.totalQty} item?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bayar',
          onPress: () => {
            s.clearCart();
            closeCart();
            confetti.fire();
            toast.success('Pesanan berhasil! 🎉');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        contentContainerClassName="p-4 pb-32 gap-4"
        showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Mini Shop
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            {s.products.length} dari 20 produk
          </Text>
        </View>

        <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3">
          <Text className="text-base mr-2">🔍</Text>
          <TextInput
            value={s.search}
            onChangeText={s.setSearch}
            placeholder="Cari produk..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-3 text-gray-900 dark:text-white"
          />
          {s.search.length > 0 && (
            <Pressable onPress={() => s.setSearch('')} className="p-1">
              <Text className="text-gray-400">✕</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = s.category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  s.setCategory(cat);
                  haptic.selection();
                }}
                className={`px-4 py-2 rounded-full border ${
                  isActive
                    ? 'bg-primary border-primary'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {s.products.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-8 items-center border border-dashed border-gray-200 dark:border-gray-700">
            <Text className="text-4xl mb-2">🔎</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              Produk tidak ditemukan.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {s.products.map((p) => {
              const qtyInCart = s.getQtyInCart(p.id);
              const outOfStock = p.stock === 0;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/apps/shop/${p.id}` as never)}
                  className="w-[48%] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden active:opacity-90">
                  <View className="aspect-square bg-gray-50 dark:bg-gray-900 items-center justify-center">
                    <Text className="text-6xl">{p.emoji}</Text>
                    {p.stock < 10 && p.stock > 0 && (
                      <View className="absolute top-2 left-2 bg-amber-500 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-white">
                          Sisa {p.stock}
                        </Text>
                      </View>
                    )}
                    {outOfStock && (
                      <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Text className="text-white font-bold text-sm">Habis</Text>
                      </View>
                    )}
                  </View>

                  <View className="p-3 gap-1.5">
                    <Text
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                      numberOfLines={2}>
                      {p.name}
                    </Text>
                    <StarRating rating={p.rating} />
                    <Text className="text-base font-bold text-primary">
                      {formatIDR(p.price)}
                    </Text>

                    {qtyInCart === 0 ? (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAdd(p.id, p.name);
                        }}
                        disabled={outOfStock}
                        className={`rounded-lg py-2 items-center mt-1 ${
                          outOfStock
                            ? 'bg-gray-200 dark:bg-gray-700'
                            : 'bg-primary active:opacity-70'
                        }`}>
                        <Text className="text-white text-xs font-bold">+ Tambah</Text>
                      </Pressable>
                    ) : (
                      <View className="flex-row items-center justify-between bg-primary/10 dark:bg-primary/20 rounded-lg p-1 mt-1">
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            s.decrementCart(p.id);
                            haptic.light();
                          }}
                          className="w-7 h-7 rounded-md bg-white dark:bg-gray-800 items-center justify-center active:opacity-70">
                          <Text className="text-base font-bold text-primary">−</Text>
                        </Pressable>
                        <Text className="text-sm font-bold text-primary">
                          {qtyInCart}
                        </Text>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            if (qtyInCart < p.stock) {
                              s.addToCart(p.id);
                              haptic.light();
                            }
                          }}
                          disabled={qtyInCart >= p.stock}
                          className={`w-7 h-7 rounded-md items-center justify-center ${
                            qtyInCart >= p.stock
                              ? 'bg-gray-200 dark:bg-gray-700'
                              : 'bg-primary active:opacity-70'
                          }`}>
                          <Text className="text-base font-bold text-white">+</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {s.totalQty > 0 && sheetIndex < 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="absolute left-4 right-4 bottom-6">
          <Pressable
            onPress={openCart}
            className="bg-primary rounded-2xl px-5 py-4 flex-row items-center justify-between shadow-lg active:opacity-80">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Text className="text-xl">🛒</Text>
              </View>
              <View>
                <Text className="text-xs text-white/80">{s.totalQty} item</Text>
                <Text className="text-base font-bold text-white">
                  {formatIDR(s.totalPrice)}
                </Text>
              </View>
            </View>
            <Text className="text-white font-bold">Lihat Cart →</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Bottom Sheet Cart */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={setSheetIndex}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        handleIndicatorStyle={{ backgroundColor: '#9ca3af' }}>
        <BottomSheetView className="flex-1 bg-white dark:bg-gray-900 rounded-t-3xl">
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <View>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Keranjang
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {s.totalQty} item
              </Text>
            </View>
            <Pressable
              onPress={closeCart}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center active:opacity-70">
              <Text className="text-gray-700 dark:text-gray-200">✕</Text>
            </Pressable>
          </View>

          <BottomSheetScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {s.cartItems.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl mb-2">🛒</Text>
                <Text className="text-gray-500 dark:text-gray-400">Cart kosong</Text>
              </View>
            ) : (
              s.cartItems.map((item: CartItem) => (
                <Animated.View
                  key={item.id}
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(100)}
                  layout={LinearTransition.duration(200)}
                  className="flex-row items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <View className="w-14 h-14 rounded-lg bg-white dark:bg-gray-900 items-center justify-center">
                    <Text className="text-2xl">{item.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                      numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatIDR(item.price)} × {item.qty}
                    </Text>
                    <Text className="text-sm font-bold text-primary mt-1">
                      {formatIDR(item.subtotal)}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1 bg-white dark:bg-gray-900 rounded-lg p-1">
                    <Pressable
                      onPress={() => {
                        s.decrementCart(item.id);
                        haptic.light();
                      }}
                      className="w-7 h-7 rounded-md items-center justify-center active:bg-gray-100 dark:active:bg-gray-800">
                      <Text className="text-base font-bold text-gray-700 dark:text-gray-200">
                        −
                      </Text>
                    </Pressable>
                    <Text className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item.qty}
                    </Text>
                    <Pressable
                      onPress={() => {
                        if (item.qty < item.stock) {
                          s.addToCart(item.id);
                          haptic.light();
                        }
                      }}
                      disabled={item.qty >= item.stock}
                      className={`w-7 h-7 rounded-md items-center justify-center ${
                        item.qty >= item.stock
                          ? 'opacity-30'
                          : 'active:bg-gray-100 dark:active:bg-gray-800'
                      }`}>
                      <Text className="text-base font-bold text-primary">+</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              ))
            )}
          </BottomSheetScrollView>

          {s.cartItems.length > 0 && (
            <View className="p-5 border-t border-gray-100 dark:border-gray-800 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Total ({s.totalQty} item)
                </Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatIDR(s.totalPrice)}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    s.clearCart();
                    haptic.warning();
                    toast.info('Cart dikosongkan');
                  }}
                  className="px-4 rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-center active:bg-gray-100 dark:active:bg-gray-800">
                  <Text className="text-gray-600 dark:text-gray-300 font-medium">
                    Hapus semua
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleCheckout}
                  className="flex-1 bg-primary rounded-xl py-3 items-center active:opacity-70">
                  <Text className="text-white font-bold">Checkout</Text>
                </Pressable>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
