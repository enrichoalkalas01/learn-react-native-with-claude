import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { formatIDR, PRODUCTS, useShop } from '@/hooks/use-shop';
import { useToast } from '@/context/toast-context';
import { haptic } from '@/lib/haptic';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useShop();
  const toast = useToast();

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);

  // Related: produk lain di kategori sama, max 4
  const related = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <Text className="text-5xl mb-3">🔍</Text>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Produk tidak ditemukan
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-full active:opacity-70">
          <Text className="text-white font-medium">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const qty = s.getQtyInCart(product.id);
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    s.addToCart(product.id);
    haptic.light();
    toast.success(`${product.name} ditambahkan`);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerClassName="pb-32">
        {/* Hero image */}
        <View className="bg-white dark:bg-gray-800 aspect-square items-center justify-center">
          <Text className="text-9xl">{product.emoji}</Text>
          {product.stock < 10 && product.stock > 0 && (
            <View className="absolute top-4 right-4 bg-amber-500 rounded-full px-3 py-1">
              <Text className="text-xs font-bold text-white">Sisa {product.stock}</Text>
            </View>
          )}
        </View>

        {/* Info card */}
        <View className="bg-white dark:bg-gray-800 -mt-4 rounded-t-3xl p-5 gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-wide text-primary font-semibold">
                {product.category}
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {product.name}
              </Text>
            </View>
            <Pressable
              onPress={() => toast.info('Wishlist belum diimplementasi')}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center active:opacity-70">
              <Text className="text-lg">🤍</Text>
            </Pressable>
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-1">
            <Text className="text-sm">⭐</Text>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">
              {product.rating.toFixed(1)}
            </Text>
            <Text className="text-sm text-gray-400">·</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {Math.floor(product.rating * 12 + 3)} review
            </Text>
            <Text className="text-sm text-gray-400">·</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {product.stock} stok
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-baseline gap-2">
            <Text className="text-3xl font-bold text-primary">
              {formatIDR(product.price)}
            </Text>
            <Text className="text-base text-gray-400 line-through">
              {formatIDR(product.price * 1.2)}
            </Text>
            <View className="bg-red-100 dark:bg-red-900/40 rounded-md px-2 py-0.5">
              <Text className="text-xs font-bold text-red-600 dark:text-red-400">
                -20%
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="bg-white dark:bg-gray-800 mt-2 p-5">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Deskripsi
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300 leading-5">
            {product.name} adalah produk berkualitas dari kategori {product.category}.
            Cocok untuk pemakaian sehari-hari dengan desain modern dan material yang tahan
            lama. Tersedia stock terbatas — pesan segera sebelum kehabisan.
          </Text>
        </View>

        {/* Specs */}
        <View className="bg-white dark:bg-gray-800 mt-2 p-5">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Spesifikasi
          </Text>
          <View className="gap-2">
            {[
              ['Kategori', product.category],
              ['SKU', `SKU-${product.id.padStart(6, '0')}`],
              ['Stok', `${product.stock} pcs`],
              ['Rating', `${product.rating} / 5.0`],
              ['Berat', '500 gram (estimasi)'],
              ['Garansi', '7 hari retur'],
            ].map(([label, value]) => (
              <View
                key={label}
                className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Related products */}
        {related.length > 0 && (
          <View className="mt-2 p-5">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Produk Serupa
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {related.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => router.push(`/apps/shop/${r.id}` as never)}
                    className="w-32 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden active:opacity-70">
                    <View className="aspect-square bg-gray-50 dark:bg-gray-900 items-center justify-center">
                      <Text className="text-4xl">{r.emoji}</Text>
                    </View>
                    <View className="p-2">
                      <Text
                        className="text-xs font-semibold text-gray-900 dark:text-white"
                        numberOfLines={1}>
                        {r.name}
                      </Text>
                      <Text className="text-sm font-bold text-primary mt-1">
                        {formatIDR(r.price)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View className="absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 pb-6 flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400">Total</Text>
          <Text className="text-lg font-bold text-primary">
            {formatIDR(product.price)}
          </Text>
        </View>

        {qty === 0 ? (
          <Pressable
            onPress={handleAdd}
            disabled={outOfStock}
            className={`flex-1 rounded-xl py-3 items-center ${
              outOfStock ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary active:opacity-70'
            }`}>
            <Text className="text-white font-bold">
              {outOfStock ? 'Stok Habis' : '+ Tambah ke Cart'}
            </Text>
          </Pressable>
        ) : (
          <View className="flex-1 flex-row items-center justify-between bg-primary/10 dark:bg-primary/20 rounded-xl p-1">
            <Pressable
              onPress={() => {
                s.decrementCart(product.id);
                haptic.light();
              }}
              className="w-10 h-10 rounded-md bg-white dark:bg-gray-800 items-center justify-center active:opacity-70">
              <Text className="text-lg font-bold text-primary">−</Text>
            </Pressable>
            <Text className="text-base font-bold text-primary">{qty} di cart</Text>
            <Pressable
              onPress={() => {
                if (qty < product.stock) {
                  s.addToCart(product.id);
                  haptic.light();
                }
              }}
              disabled={qty >= product.stock}
              className={`w-10 h-10 rounded-md items-center justify-center ${
                qty >= product.stock
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-primary active:opacity-70'
              }`}>
              <Text className="text-lg font-bold text-white">+</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
