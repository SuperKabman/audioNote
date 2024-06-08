import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "expo-router";
import React, { useState, useEffect } from "react";
import "nativewind";
import { icons } from "@/constants/icons";

const Home = () => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("recording");
  };
  const handleProfile = () => {
    navigation.navigate("profile");
  };

  // ...

return (
  <SafeAreaView style={{ flex: 1 , backgroundColor:'#DADADA'}}>
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        style={{ alignItems: "center", justifyContent: "center",  marginTop:'60%', marginBottom:"60%", marginHorizontal:'20%' }}
      >
        <Image
          source={require("@/assets/images/blob_1.gif")}
          style={{ width: "130%", height: "130%", top: "-3%", margin: "0%" }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontFamily: "IBMPlexMono-Medium",
            position: "absolute",
            top: "37%",
            left: "30%",
            color: "white",
            fontSize: 28,
          }}
        >
          Record
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleProfile} style={{ height:1 }}>
        <Image source={icons.profile} style={{ top: -680, left: "80%" }} />
      </TouchableOpacity>
    </SafeAreaView>
  </SafeAreaView>
);

// ...
};

export default Home;
