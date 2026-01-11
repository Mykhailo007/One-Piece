import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Episodes',
          headerRight: () => null
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="player" 
        options={{ 
          title: 'Player',
          presentation: 'fullScreenModal'
        }} 
      />
      <Stack.Screen 
        name="downloads" 
        options={{ title: 'Downloads' }} 
      />
    </Stack>
  );
}
