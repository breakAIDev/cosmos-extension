import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { Images } from '../../../assets/images';

export function getDefaultTokenLogo(isDark: boolean) {
  return isDark ? Images.Logos.ImgNotAvailableDark : Images.Logos.ImgNotAvailableLight;
}

export function useDefaultTokenLogo() {
  const isDark = useColorScheme() === 'dark';
  return useMemo(() => getDefaultTokenLogo(isDark), [isDark]);
}
