import { View, Text, Alert, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "expo-router";
import React from "react";
import "nativewind";

const Home = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('recording');
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Image source={require('@/assets/images/blob_1.gif')} style = {{width: 300, height: 300,top:175}} />
        <Text style={{position:'absolute', top:300, left:145,color: 'white', fontSize: 36 }}>Record</Text>
      </TouchableOpacity>
    </View>
  );
};


export default Home;