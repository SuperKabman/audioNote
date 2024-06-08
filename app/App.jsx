import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';


import Login from './auth/Login';
import Signup from './auth/Signup';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer independent = {true}>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signup" component={Signup} />
  </Stack.Navigator>
</NavigationContainer>
  );
} 

export default App;

const styles = StyleSheet.create({})