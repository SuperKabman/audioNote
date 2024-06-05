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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={handlePress}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <Image
            source={require("@/assets/images/blob_1.gif")}
            style={{ width: "60%", height: "60%", top: "25%", margin: "5%" }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontFamily: "IBMPlexMono-Medium",
              position: "absolute",
              top: "70%",
              left: "37%",
              color: "white",
              fontSize: 28,
            }}
          >
            Record
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfile}>
          <Image source={icons.profile} style={{ top: "-750%", left: "80%" }} />
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default Home;
