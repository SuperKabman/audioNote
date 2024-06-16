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
import Profile from "@/assets/images/profileSVG.svg";


const Home = () => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("recording");
  };
  const handleProfile = () => {
    navigation.navigate("profile");
  };

  const handleLongPress = () => {
    navigation.navigate("options");
  }

return (
  <SafeAreaView style={{ flex: 1 , backgroundColor:'#14140F'}}>
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={{ alignItems: "center", justifyContent: "center",  marginTop:'60%', marginBottom:"60%", marginHorizontal:'20%' }}
      >
        <Image
          source={require("@/assets/images/blob_3.gif")}
          style={{ width: "140%", height: "140%", top: "-3%", margin: "0%" }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontFamily: "IBMPlexMono-Medium",
            position: "absolute",
            top: "37%",
            left: "27%",
            color: "black",
            fontSize: 32,
          }}
        >
          Record
        </Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={handleProfile} style={{height:1}}>
          <Profile top={-700} left={310} />
                {/* <TouchableOpacity onPress={handleProfile} style={{ height:1 }}>
        <Image source={icons.profile} style={{ top: -680, left: "80%" }} /> */}

      </TouchableOpacity>
    </SafeAreaView>
  </SafeAreaView>
);

// ...
};

export default Home;
