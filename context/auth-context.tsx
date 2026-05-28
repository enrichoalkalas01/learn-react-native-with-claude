import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@app/auth-user';

export type User = {
  name: string;
  email: string;
  avatar: string; // emoji untuk demo
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, _password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    _password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_AVATARS = ['👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🦊', '🐱', '🐶'];

function pickAvatar(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return DEMO_AVATARS[Math.abs(hash) % DEMO_AVATARS.length];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setUser(JSON.parse(raw) as User);
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: User | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (
    email: string,
    _password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!email.includes('@')) return { ok: false, error: 'Email tidak valid' };
    // Mock — auto sukses untuk demo
    const newUser: User = {
      name: email.split('@')[0],
      email,
      avatar: pickAvatar(email),
    };
    await persist(newUser);
    return { ok: true };
  };

  const register = async (
    name: string,
    email: string,
    _password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!name.trim()) return { ok: false, error: 'Nama wajib diisi' };
    if (!email.includes('@')) return { ok: false, error: 'Email tidak valid' };
    const newUser: User = {
      name: name.trim(),
      email,
      avatar: pickAvatar(email),
    };
    await persist(newUser);
    return { ok: true };
  };

  const logout = async () => {
    await persist(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    await persist({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
