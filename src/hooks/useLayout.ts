import { useWindowDimensions } from 'react-native';

export const SIDEBAR_W = 248;
export const MAX_W = 1200;

export function useLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 600;
  const pad = isDesktop ? 32 : isTablet ? 24 : 16;
  const content = Math.min(width - (isDesktop ? SIDEBAR_W : 0), MAX_W) - pad * 2;
  const gridCols = width < 600 ? 2 : Math.max(2, Math.floor((content + 16) / 296));
  return { width, isDesktop, isTablet, pad, content, gridCols };
}
