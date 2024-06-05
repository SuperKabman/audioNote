import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      <Stack.Screen name="recording" options={{headerShown: false}}/>
      <Stack.Screen name="profile" options={{headerShown: false}}/>
      <Stack.Screen name="global_chat" options={{headerShown: false}}/>
    </Stack>
  );
}
