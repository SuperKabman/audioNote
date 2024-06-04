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
  iconContainerFocusedIOS: {
    margin: '50%',
    width: '70%',
    height:'10%',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingBottom:40,
    paddingTop:10,
    marginBottom:60,
  },
  iconContainerFocusedAndroid: {
    margin: '5%',
    width: '60%',
    backgroundColor: 'white',
    borderRadius: 30,
  },
  icon: {  
    width: 32,
    height: 32,
    marginBottom: Platform.OS === "ios" ? "12%" : "0%",
    
  },
  iconFocused: {
    width:32,
    height:32,
    marginTop: Platform.OS === "ios" ? "40%" : "0%",
  }
});

interface TabIconProps {
  icon: any;
  focused: boolean;
}

const TabIcon : React.FC<TabIconProps> = ({ icon, focused }) => {
  if (Platform.OS === 'ios') {
    return (
      <View style = {[styles.iconContainer, focused && styles.iconContainerFocusedIOS]}>
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={focused ? "black" : "white"}
          style={(focused ? styles.iconFocused : styles.icon)}
        />
      </View>
    );
  } else {
    return (
      <View style = {[styles.iconContainer, focused && styles.iconContainerFocusedAndroid]}>
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={focused ? "black" : "white"}
          style={styles.icon}
        />
      </View>
    );
  }
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
            margin: Platform.OS === "ios" ? "10%" : "5%",
            padding: Platform.OS === "ios" ? "10%" : "0%",
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