import { ThemeProvider } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { NavTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminProfileProvider } from '../context/AdminProfileContext';

function KeepAwakeWrapper() {
  useKeepAwake();
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AdminProfileProvider>
      <ThemeProvider value={colorScheme === 'dark' ? NavTheme.dark : NavTheme.light}>
        {Platform.OS !== 'web' && <KeepAwakeWrapper />}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AdminProfileProvider>
  );
}
