import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStoredState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [isLoaded, setIsLoaded] = useState(false);
  // Skip first save (saat baru load dari storage), supaya tidak overwrite dgn initial
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled) return;
        if (raw != null) {
          try {
            setValue(JSON.parse(raw) as T);
          } catch {
            // data rusak, abaikan
          }
        }
        setIsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
      // ignore write errors di demo
    });
  }, [key, value, isLoaded]);

  return [value, setValue, isLoaded];
}

export async function clearAllAppData() {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith('@app/'));
  if (appKeys.length) await AsyncStorage.multiRemove(appKeys);
}
