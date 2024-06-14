import { Stack, SplashScreen } from "expo-router";
import {useFonts} from 'expo-font';
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoaded, error] = useFonts({
    "IBMPlexMono-SemiBold": require('@/assets/fonts/IBMPlexMono-SemiBold.ttf'),
    "IBMPlexMono-Regular": require("@/assets/fonts/IBMPlexMono-Regular.ttf"),
    "IBMPlexMono-Medium": require("@/assets/fonts/IBMPlexMono-Medium.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }




  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      <Stack.Screen name="recording" options={{headerShown: false}}/>
      <Stack.Screen name="profile" options={{headerShown: false}}/>
      <Stack.Screen name="global_chat" options={{headerShown: false}}/>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="file_details" options={{headerShown: false}}/>
      <Stack.Screen name="files" options={{headerShown: false}}/>
      <Stack.Screen name="options" options={{headerShown: false}}/>
    </Stack>
  );
}
