import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/clerk-expo';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from './(auth)/context/AuthProvider';
import { ThemeProvider, useTheme } from './(auth)/context/ThemeContext';
import { publishableKey } from './config/clerk';
import '../global.css'; // Import NativeWind styles

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

function RootLayout() {
  useFrameworkReady();

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default RootLayout;