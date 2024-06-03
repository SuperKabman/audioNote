import { View, Text, Image, Dimensions, Platform, StyleSheet } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import "nativewind";
import { icons } from "@/constants/icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const styles = StyleSheet.create({
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  iconContainerFocused: {
    margin: '5%',
    width: '60%',
    backgroundColor: 'white',
    borderRadius: 30,
  },
  icon: {
    width: 32,
    height: 32,
  },
});

interface TabIconProps {
  icon: any;
  focused: boolean;
}

const TabIcon : React.FC<TabIconProps> = ({ icon, focused }) => {
  return (
    <View style = {[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={focused ? "black" : "white"}
        style={styles.icon}
      />
    </View>
  );
};
const TabsLayout = () => {

  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "black",
            borderTopColor: "transparent",
            borderRadius: 30,
            height: "7%",
            marginBottom: "5%",
            shadowColor: "transparent",
            margin: "5%",
            padding: Platform.OS === "ios" ? "6%" : "0%",
          },
        }}
      >
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <TabIcon
                  icon={icons.chat}
                  focused={focused}
                />
              );
            },
          }}
        />

        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <TabIcon
                  icon={icons.home}
                  focused={focused}
                />
              );
            },
          }}
        />
        <Tabs.Screen
          name="files"
          options={{
            tabBarIcon: ({ focused }) => {
              return (
                <TabIcon
                  icon={icons.files}
                  focused={focused}
                />
              );
            },
          }}
        />
      </Tabs>
  );
};

export default TabsLayout;
