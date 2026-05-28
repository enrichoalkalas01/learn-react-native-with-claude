# Konsep 07 — Dynamic Routes

## Apa itu Dynamic Route?

Dynamic route adalah halaman yang URL-nya bisa berubah-ubah berdasarkan data.

Contoh:

- `/posts/1` → detail post id 1
- `/posts/2` → detail post id 2
- `/user/john` → profil user "john"
- `/products/iphone-15` → halaman produk

Satu file menangani semua URL tersebut.

---

## Cara Membuat Dynamic Route

Buat file dengan nama dalam tanda kurung siku: `[namaParam].tsx`

```
app/
├── posts/
│   └── [id].tsx      → /posts/1  /posts/2  /posts/abc
├── user/
│   └── [username].tsx → /user/john  /user/alice
└── product/
    └── [slug].tsx    → /product/iphone-15  /product/airpods
```

Nama di dalam `[...]` menjadi nama parameter yang bisa kamu akses.

---

## Cara Mengambil Parameter

Gunakan hook `useLocalSearchParams()` dari expo-router:

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function PostDetailScreen() {
  // id diambil dari URL — contoh URL: /posts/42
  const { id } = useLocalSearchParams<{ id: string }>();

  console.log(id); // '42'

  return <Text>Post ID: {id}</Text>;
}
```

### `useLocalSearchParams` vs `useGlobalSearchParams`

| Hook                    | Kapan Dipakai                            |
| ----------------------- | ---------------------------------------- |
| `useLocalSearchParams`  | Untuk parameter milik screen itu sendiri |
| `useGlobalSearchParams` | Untuk semua parameter di URL saat ini    |

Hampir selalu pakai `useLocalSearchParams`.

---

## Cara Navigasi ke Dynamic Route

### Dari kode (programmatic)

```tsx
import { router } from 'expo-router';

// Cara 1: string interpolation (mudah dibaca)
router.push(`/posts/${post.id}`);

// Cara 2: object dengan pathname (lebih type-safe)
router.push({
  pathname: '/posts/[id]',
  params: { id: post.id },
});
```

### Dari JSX (deklaratif)

```tsx
import { Link } from 'expo-router';

// Cara 1: href string
<Link href={`/posts/${post.id}`}>Baca Post</Link>

// Cara 2: href object
<Link href={{ pathname: '/posts/[id]', params: { id: post.id } }}>
  Baca Post
</Link>
```

---

## Multiple Params

Bisa punya lebih dari satu parameter:

```
app/
└── courses/
    └── [courseId]/
        └── lessons/
            └── [lessonId].tsx
```

URL: `/courses/react/lessons/3`

```tsx
const { courseId, lessonId } = useLocalSearchParams<{
  courseId: string;
  lessonId: string;
}>();
// courseId = 'react', lessonId = '3'
```

---

## Catch-All Route

Menangkap semua segmen URL:

```
app/
└── [...slug].tsx    → /a  /a/b  /a/b/c
```

```tsx
const { slug } = useLocalSearchParams<{ slug: string[] }>();
// URL: /docs/api/hooks → slug = ['docs', 'api', 'hooks']
```

---

## Contoh di Project Ini

### Struktur

```
app/(tabs)/posts.tsx     ← Daftar semua post (TAB)
app/posts/[id].tsx       ← Detail satu post (STACK)
```

### Flow

```
User di tab Posts
    ↓
Tekan kartu post
    ↓
router.push(`/posts/${post.id}`)
    ↓
Expo Router melihat ada file: app/posts/[id].tsx
    ↓
Screen PostDetailScreen dirender
    ↓
useLocalSearchParams() → { id: '3' }
    ↓
Cari data berdasarkan id
    ↓
Tampilkan konten post
```

### Handle 404 / Data Tidak Ada

```tsx
const post = POSTS_DATA.find((p) => p.id === id);

if (!post) {
  return (
    <View>
      <Text>Post tidak ditemukan</Text>
      <Button onPress={() => router.back()}>Kembali</Button>
    </View>
  );
}
```

---

## Query String (Parameter Tambahan)

Selain path params, bisa juga kirim query string:

```tsx
// Navigasi dengan query params
router.push(`/posts/${id}?ref=home&highlight=true`);

// Di screen tujuan
const { id, ref, highlight } = useLocalSearchParams();
// id = '5', ref = 'home', highlight = 'true'
```

Query params berguna untuk state tambahan yang tidak perlu masuk ke URL path.
