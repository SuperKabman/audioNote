import React from 'react';
import { StyleSheet, View, ImageBackground, TextInput } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Image } from 'react-native'; 

const InputWithIcon = ({ iconName, placeholder }) => (
  <View style={styles.inputContainer}>
    <FontAwesome name={iconName} size={20} color="grey" style={styles.icon} />
    <TextInput
      style={styles.inputText}
      placeholder={placeholder}
      placeholderTextColor="#666"
    />
  </View>
);

const App = () => {

  const [shouldRedirect, setShouldRedirect] = useState(false);

  const redirectHome = () => {
    setShouldRedirect(true);
  };

  if (shouldRedirect) {
    context = "";
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/profileScribble1.png')}
        style={styles.topShape}
      >
        <View style={styles.circle} />
      </ImageBackground>
      <View style={styles.content}>
        <InputWithIcon iconName="user" placeholder="Username" />
        <InputWithIcon iconName="envelope" placeholder="Email" />
       
        <InputWithIcon iconName="phone" placeholder="Phone Number" />
      </View>
      <ImageBackground
        source={require('../assets/images/profileScribble2.png')}
        style={styles.bottomShape}
      />
      <TouchableOpacity
    onPress={redirectHome}
    style={[styles.backButtonContainer, {width: 80, height: 32}]}
>
    <Image
      source={require("../assets/images/backButton.png")}
      style={styles.backButton}
    />
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  topShapeContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  topShape: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 240,
    width: 400,
    top: -35,
    left: 5,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgrey',
    top: 55,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: 35,
    backgroundColor: 'lightgrey',
    marginVertical: 25,
    top: 25,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
    color: 'black',
  },
  inputText: {
    flex: 1,
    color: 'black', 
    fontSize: 16, 
    fontWeight: '500', 
  },
  bottomShapeContainer: {
    width: '100%',
    height: '100%',
  },
  bottomShape: {
    width: 500,
    height: 330,
    left: -50,
    bottom: -150,
  },
  backButtonContainer: {
    position: "absolute",
    top: 55,
    left: 5,
  },
  backButton: {
    height: 32,
    width: 80,
  },
});

export default App;
