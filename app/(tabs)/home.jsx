import { View, Text, Alert, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "expo-router";
import React from "react";
import "nativewind";
import useStartRecording from "@/components/startRecording";

const Home = () => {
  const { startRecording, recording, progress } = useStartRecording();
  const navigation = useNavigation();

  const handlePress = () => {
    startRecording();
    navigation.navigate('recording');
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Image source={require('@/assets/images/blob.gif')} style = {{width: 400, height: 400}} />
      </TouchableOpacity>
    </View>
  );
};


export default Home;
