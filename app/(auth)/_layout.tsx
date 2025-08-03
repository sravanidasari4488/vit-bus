import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthProvider';
import ThemeProvider from './context/ThemeContext';

function AuthLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="pending-approval" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AuthLayout;
