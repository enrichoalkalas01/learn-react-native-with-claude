import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Profil',
      }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Daftar' }} />
      <Stack.Screen name="forgot" options={{ title: 'Lupa Password' }} />
    </Stack>
  );
}
