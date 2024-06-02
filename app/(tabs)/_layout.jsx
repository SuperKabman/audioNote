import { View, Text, Image, Dimensions } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import "nativewind";
import { icons } from "@/constants/icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const tabWidth = width / 3;

const TabIcon = ({ icon, focused, index, currentIndex }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(currentIndex.value * tabWidth, { duration: 300 }) }],
    };
  });

  return (
    <View className="flex items-center justify-center w-full h-full">
      {focused && (
        <Animated.View style={[animatedStyle]} className="absolute w-10 h-10 bg-white rounded-full z-[-1]" />
      )}
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={focused ? "white" : "white"}
        style={{ width: 32, height: 32 }}
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
          height: 70,
          marginBottom: 20,
          shadowColor: "transparent",
          margin: 20,
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
