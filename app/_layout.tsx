import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/clerk-expo';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from './(auth)/context/AuthProvider';
import { ThemeProvider } from './(auth)/context/ThemeContext';
import { publishableKey } from './config/clerk';

function RootLayout() {
  useFrameworkReady();

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default RootLayout;