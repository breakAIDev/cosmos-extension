import { Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

export class UserClipboard {
  static async copyText(text: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        await window.navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setString(text);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Paste text from clipboard
   */
  static async pasteText(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await window.navigator.clipboard.readText();
      } else {
        return await Clipboard.getString();
      }
    } catch {
      return null;
    }
  }
}
