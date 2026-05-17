/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

const tintColorLight = '#133C55';
const tintColorDark = '#91E5F6';

export const Colors = {
  light: {
    text: '#133C55',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#386FA4',
    tabIconDefault: '#59A5D8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#91E5F6',
    background: '#133C55',
    tint: tintColorDark,
    icon: '#84D2F6',
    tabIconDefault: '#84D2F6',
    tabIconSelected: tintColorDark,
  },
};

export const NavTheme = {
  light: {
    ...NavDefaultTheme,
    colors: {
      ...NavDefaultTheme.colors,
      primary: '#133C55',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#133C55',
      border: '#F1F5F9',
      notification: '#EF4444',
    },
  },
  dark: {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      primary: '#91E5F6',
      background: '#133C55',
      card: '#133C55',
      text: '#91E5F6',
      border: '#386FA4',
      notification: '#EF4444',
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'System',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'Georgia',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'System',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'Courier New',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
