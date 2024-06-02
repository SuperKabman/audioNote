import { View, Text, Image, Dimensions } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import "nativewind";
import { icons } from "@/constants/icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const TabIcon = ({ icon, focused}) => {

  return (
    <View className="flex items-center justify-center w-full h-full">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={focused ? "white" : "white"}
        style={{ width: 32, height: 32 }}
        // className="w-32 h-32"
      />
    </View>
  );
};

const TabsLayout = () => {
  const currentIndex = useSharedValue(1);

  return (

    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopColor: "transparent",
          borderRadius: 30,
          height: '7%',
          marginBottom: '5%',
          shadowColor: "transparent",
          margin: '5%',
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => {
            return <TabIcon icon={icons.chat} focused={focused} index={0} currentIndex={currentIndex} />;
          },
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => {
            return <TabIcon icon={icons.home} focused={focused} index={1} currentIndex={currentIndex} />;
          },
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          tabBarIcon: ({ focused }) => {
            return <TabIcon icon={icons.files} focused={focused} index={2} currentIndex={currentIndex} />;
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
