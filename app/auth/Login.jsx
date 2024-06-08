import { ImageBackground, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect } from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Redirect, useNavigation } from 'expo-router'



const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigation = useNavigation()
  const [redirect, setRedirect] = useState(false)
  const [signUpRedirect, setSignUpRedirect] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            redirectHome();
        }
    })
    return unsubscribe;
  }, [])  

  if (redirect) {
    return <Redirect href='/home' />
  }
  const redirectHome = () => {
    setRedirect(true);
  };
  const redirectSignup = () => {
    setSignUpRedirect(true);
  }

  if (signUpRedirect) {
    return <Redirect href='auth/Signup' />
  }


  

  const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then(userCredenditals => {
            const user = userCredenditals.user;
            console.log('Looged in with:', user.email);
        })
        .catch(error => alert(error.message))
    }

  return (
    <KeyboardAvoidingView>
    <View style = {styles.container}>
      <View style = {styles.inputContainer}>
      <FontAwesome 
      name = "user" 
      size = {24} 
      color = "#9A9A9A" 
      style = {styles.inputIcon} />
      <TextInput style = {styles.textInput}placeholder='Email/Username'
      value = {email} onChangeText={text => setEmail(text)}/>
      </View>
      <View style = {styles.inputContainer}>
      <FontAwesome 
      name = "lock" 
      size = {24} 
      color = "#9A9A9A" 
      style = {styles.inputIcon} />
      <TextInput style = {styles.textInput}placeholder='Password' secureTextEntry
      value = {password} onChangeText={text => setPassword(text)}/>
      </View>
      <View style = {styles.buttonContainer}>
        <TouchableOpacity
         onPress={handleLogin}
         style = {[styles.button, styles.buttonOutline]}>
            <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
         onPress={redirectSignup}
         style = {[styles.button, styles.buttonOutline]}>
            <Text>New to Audionote?  </Text>
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
}

export default Login;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F5F5F5",
        flex: 1,
        alignItems: 'center',
    },
    inputContainer: {
        backgroundColor:'#FFFFFF',
        flexDirection: 'row',
        borderRadius: 20,
        marginHorizontal: 40,
        elevation: 10,
        marginVertical: 20,
        marginTop: 25,
        top: 150,
        height:45,
        alignItems: 'center',
    },
    inputIcon: {
        marginLeft: 17,
    },
    textInput: {
        flex: 1,
        marginLeft: 10,
    },
    buttonContainer: {
        width:'60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '60%',
        height:50,
    },
    button: {
        backgroundColor: '#FF6347',
        fontSize: 14,
        width:'100%',
        paddingHorizontal: 15,
        borderRadius: 10,
        height:'100%',
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: '#FFFFFF',
        marginTop: 70,
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