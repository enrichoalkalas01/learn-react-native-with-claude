import { useMemo, useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';
import { formatIDR } from '@/lib/format';

export { formatIDR };

export type Product = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  rating: number;
  category: string;
  stock: number;
};

export type CartEntry = {
  productId: string;
  qty: number;
};

export const PRODUCTS: Product[] = [
  // Fashion
  {
    id: '1',
    name: 'Kaos Polos Cotton',
    emoji: '👕',
    price: 89000,
    rating: 4.5,
    category: 'Fashion',
    stock: 50,
  },
  {
    id: '2',
    name: 'Kemeja Flannel',
    emoji: '🧥',
    price: 245000,
    rating: 4.7,
    category: 'Fashion',
    stock: 25,
  },
  {
    id: '3',
    name: 'Sneakers Putih',
    emoji: '👟',
    price: 599000,
    rating: 4.8,
    category: 'Fashion',
    stock: 12,
  },
  {
    id: '4',
    name: 'Topi Baseball',
    emoji: '🧢',
    price: 75000,
    rating: 4.3,
    category: 'Fashion',
    stock: 80,
  },
  {
    id: '5',
    name: 'Tas Ransel',
    emoji: '🎒',
    price: 320000,
    rating: 4.6,
    category: 'Fashion',
    stock: 18,
  },

  // Elektronik
  {
    id: '6',
    name: 'Headphone Wireless',
    emoji: '🎧',
    price: 1250000,
    rating: 4.9,
    category: 'Elektronik',
    stock: 15,
  },
  {
    id: '7',
    name: 'Smartphone 5G',
    emoji: '📱',
    price: 4500000,
    rating: 4.6,
    category: 'Elektronik',
    stock: 8,
  },
  {
    id: '8',
    name: 'Powerbank 20000mAh',
    emoji: '🔋',
    price: 350000,
    rating: 4.5,
    category: 'Elektronik',
    stock: 30,
  },
  {
    id: '9',
    name: 'Mouse Gaming',
    emoji: '🖱️',
    price: 425000,
    rating: 4.7,
    category: 'Elektronik',
    stock: 20,
  },
  {
    id: '10',
    name: 'Keyboard Mekanik',
    emoji: '⌨️',
    price: 850000,
    rating: 4.8,
    category: 'Elektronik',
    stock: 10,
  },

  // Makanan
  {
    id: '11',
    name: 'Kopi Susu Gula Aren',
    emoji: '☕',
    price: 25000,
    rating: 4.6,
    category: 'Makanan',
    stock: 100,
  },
  {
    id: '12',
    name: 'Roti Bakar Coklat',
    emoji: '🍞',
    price: 18000,
    rating: 4.4,
    category: 'Makanan',
    stock: 60,
  },
  {
    id: '13',
    name: 'Burger Spesial',
    emoji: '🍔',
    price: 65000,
    rating: 4.8,
    category: 'Makanan',
    stock: 40,
  },
  {
    id: '14',
    name: 'Pizza Margherita',
    emoji: '🍕',
    price: 125000,
    rating: 4.7,
    category: 'Makanan',
    stock: 25,
  },
  {
    id: '15',
    name: 'Es Krim Vanilla',
    emoji: '🍦',
    price: 22000,
    rating: 4.5,
    category: 'Makanan',
    stock: 80,
  },

  // Buku
  {
    id: '16',
    name: 'Novel Best Seller',
    emoji: '📚',
    price: 95000,
    rating: 4.6,
    category: 'Buku',
    stock: 30,
  },
  {
    id: '17',
    name: 'Notebook A5 Hard',
    emoji: '📓',
    price: 35000,
    rating: 4.5,
    category: 'Buku',
    stock: 100,
  },
  {
    id: '18',
    name: 'Buku Programming',
    emoji: '📖',
    price: 175000,
    rating: 4.9,
    category: 'Buku',
    stock: 15,
  },
  {
    id: '19',
    name: 'Pensil Mekanik 0.5',
    emoji: '✏️',
    price: 22000,
    rating: 4.4,
    category: 'Buku',
    stock: 150,
  },
  {
    id: '20',
    name: 'Sticky Notes Pack',
    emoji: '📒',
    price: 45000,
    rating: 4.3,
    category: 'Buku',
    stock: 200,
  },
];

export const CATEGORIES = ['Semua', 'Fashion', 'Elektronik', 'Makanan', 'Buku'];

export type CartItem = Product & { qty: number; subtotal: number };

export function useShop() {
  const [cart, setCart] = useStoredState<CartEntry[]>('@app/cart', []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('Semua');

  const filtered = useMemo(() => {
    let result = PRODUCTS;
    if (category !== 'Semua') {
      result = result.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [category, search]);

  const cartItems: CartItem[] = useMemo(() => {
    return cart
      .map((entry) => {
        const product = PRODUCTS.find((p) => p.id === entry.productId);
        if (!product) return null;
        return { ...product, qty: entry.qty, subtotal: product.price * entry.qty };
      })
      .filter((x): x is CartItem => x !== null);
  }, [cart]);

  const totalQty = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalPrice = cartItems.reduce((sum, c) => sum + c.subtotal, 0);

  const addToCart = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        // Cap di stock
        if (existing.qty >= product.stock) return prev;
        return prev.map((c) =>
          c.productId === productId ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
  };

  const decrementCart = (productId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.productId === productId ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const getQtyInCart = (productId: string) =>
    cart.find((c) => c.productId === productId)?.qty ?? 0;

  return {
    products: filtered,
    cart,
    cartItems,
    search,
    category,
    totalQty,
    totalPrice,
    setSearch,
    setCategory,
    addToCart,
    decrementCart,
    removeFromCart,
    clearCart,
    getQtyInCart,
  };
}
