import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '../hooks/useLayout';
import { R, T, useTheme } from '../theme';

type Kind = 'success' | 'error' | 'info';
interface ToastApi { show: (message: string, kind?: Kind) => void }
const Ctx = createContext<ToastApi>({ show: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  const { isDesktop } = useLayout();
  const { bottom } = useSafeAreaInsets();
  const [t, setT] = useState<{ msg: string; kind: Kind } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const native = Platform.OS !== 'web';

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: native }).start(() => setT(null));
  }, [anim, native]);

  const show = useCallback((msg: string, kind: Kind = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setT({ msg, kind });
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: native }).start();
    timer.current = setTimeout(hide, kind === 'error' ? 7000 : 3500);
  }, [anim, hide, native]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const icon = t?.kind === 'error' ? 'alert-circle' : t?.kind === 'info' ? 'info' : 'check-circle';
  const tint = t?.kind === 'error' ? c.danger : t?.kind === 'info' ? c.primaryText : c.success;

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {t && (
        <View pointerEvents="box-none"
          style={{ position: 'absolute', left: 16, right: 16, alignItems: isDesktop ? 'flex-end' : 'center', ...(isDesktop ? { top: 24 } : { bottom: bottom + 76 }) }}>
          <Animated.View accessibilityRole="alert" accessibilityLiveRegion="polite"
            style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [isDesktop ? -8 : 8, 0] }) }],
              flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 440, backgroundColor: c.surface, borderRadius: R.md, borderWidth: 1,
              borderColor: c.border, borderLeftWidth: 4, borderLeftColor: tint, paddingVertical: 12, paddingLeft: 14, paddingRight: 6,
              shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
            <Feather name={icon} size={18} color={tint} />
            <Text style={[T.small, { color: c.text, flexShrink: 1, fontWeight: '500' }]}>{t.msg}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup pemberitahuan" onPress={hide}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={16} color={c.muted} />
            </Pressable>
          </Animated.View>
        </View>
      )}
    </Ctx.Provider>
  );
}
