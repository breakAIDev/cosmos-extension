import { useCallback } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';

export function useCopy() {
  return useCallback((text: string) => {
    Clipboard.setString(text);
  }, []);
}
