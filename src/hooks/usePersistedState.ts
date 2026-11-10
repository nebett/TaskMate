import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistedState<T extends string | boolean>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    AsyncStorage.getItem(key).then((v) => {
      if (v == null) return;
      setValue((typeof initial === 'boolean' ? v === 'true' : v) as T);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((v: T) => { setValue(v); AsyncStorage.setItem(key, String(v)).catch(() => {}); }, [key]);
  return [value, set] as const;
}
