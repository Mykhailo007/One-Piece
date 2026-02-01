import { Stack, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

function PlayerBackButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={10}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 8,
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>
        Done
      </Text>
    </Pressable>
  );
}

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Episodes',
          headerRight: () => null,
        }}
      />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen
        name="player"
        options={{
          title: 'Player',
          presentation: 'fullScreenModal',
          headerLeft: () => <PlayerBackButton />,
        }}
      />
      <Stack.Screen name="downloads" options={{ title: 'Downloads' }} />
    </Stack>
  );
}