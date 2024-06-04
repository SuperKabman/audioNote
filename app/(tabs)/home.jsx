import { View, Text, Alert, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "expo-router";
import React from "react";
import "nativewind";
import { icons } from "@/constants/icons";

const Home = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('recording');
  
  }
  const handleProfile = () => {
    navigation.navigate('profile');
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Image source={require('@/assets/images/blob_1.gif')} style = {{width: 260, height: 260,top:190}} />
        <Text style={{position:'absolute', top:300, left:145,color: 'white', fontSize: 36 }}>Record</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleProfile}>
        <Image source={icons.profile} style = {{top:-250, left:328}} />
      </TouchableOpacity>
    </View>
  );
};


export default Home;