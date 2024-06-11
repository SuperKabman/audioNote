import { ImageBackground, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect } from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Redirect, useNavigation } from 'expo-router'
import { firestore } from '../firebase'
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';



const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [redirect, setRedirect] = useState(false)
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [])

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log('Registered with:', user.email);
  
        // Save additional user data to Firestore
        const usersCollection = collection(firestore, 'users');
        const userDoc = doc(usersCollection, user.uid);
        setDoc(userDoc, {
          email: user.email,
          userName: userName,
          phoneNumber: phoneNumber,
          createdAt: new Date()
        }).then(() => {
          console.log('User data saved to Firestore');
        }).catch(error => {
          console.error('Error saving user data:', error);
        });
      })
      .catch(error => alert(error.message));
  };

  const redirectLogin = () => {
    setRedirect(true);
  };

  if (redirect) {
    return <Redirect href='auth/Login' />
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View>
        <Text style={{ color: '#F2F2F2', fontSize: 50, top: 90, left: 80, fontFamily: "IBMPlexMono-Medium" }}>Sign-Up</Text>

        <View style={styles.inputContainer}>
          <FontAwesome
            name="envelope"
            size={24}
            color="#9A9A9A"
            style={styles.inputIcon} />
          <TextInput style={styles.textInput} placeholder='Enter an Email' placeholderTextColor={'#282828'}
            value={email} onChangeText={text => setEmail(text)} />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome
            name="lock"
            size={24}
            color="#9A9A9A"
            style={styles.inputIcon} />
          <TextInput style={styles.textInput} placeholder='Choose a Password' secureTextEntry placeholderTextColor={'#282828'}
            value={password} onChangeText={text => setPassword(text)} />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome
            name="user"
            size={24}
            color="#9A9A9A"
            style={styles.inputIcon} />
          <TextInput style={styles.textInput} placeholder='Choose a Username' placeholderTextColor={'#282828'}
            value={userName} onChangeText={text => setUserName(text)} />
        </View>
        
        <View style={styles.inputContainer}>
          <FontAwesome
            name="phone"
            size={24}
            color="#9A9A9A"
            style={styles.inputIcon} />
          <TextInput style={styles.textInput} placeholder='Enter Phone Number' placeholderTextColor={'#282828'}
            value={phoneNumber} onChangeText={text => setPhoneNumber(text)} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSignUp}
            style={[styles.button, styles.buttonOutline]}>
            <Text style={{ fontFamily: 'IBMPlexMono-Medium', fontSize: 12 }}>Sign Up </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={redirectLogin}
            style={[styles.button, styles.buttonOutline]}>
            <Text style={{ fontFamily: 'IBMPlexMono-Medium', fontSize: 12 }}>Back To Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Signup;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#232625',
    flex: 1,
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 40,
    elevation: 10,
    marginVertical: 20,
    marginTop: 25,
    top: 120,
    height: 45,
    alignItems: 'center',
    borderRadius: 15,
    borderColor: '#484848',
    borderWidth: 2,
    width: '70%',
  },
  inputIcon: {
    marginLeft: 14,
    color: 'black',
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "IBMPlexMono-Medium",
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '70%',
    height: 50,
    left: 100,

  },
  button: {
    backgroundColor: '#484848',
    fontSize: 14,
    width: 160,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: '100%',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 80,
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#808080',
    borderWidth: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

})
