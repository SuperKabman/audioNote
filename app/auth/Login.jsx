import { ImageBackground, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Redirect, useNavigation } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [redirect, setRedirect] = useState(false);
  const [signUpRedirect, setSignUpRedirect] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        redirectHome();
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
        fetchUserData(user.uid);
      })
      .catch(error => alert(error.message));
  };

  const fetchUserData = (uid) => {
    const docRef = doc(firestore, 'users', uid);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          console.log('User data:', docSnap.data());
          redirectHome();
        } else {
          console.log('No such document!');
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  };

  
  const redirectHome = () => {
    setRedirect(true);
  };

  const redirectSignup = () => {
    setSignUpRedirect(true);
  };

  if (redirect) {
    return <Redirect href='/home' />;
  }

  if (signUpRedirect) {
    return <Redirect href='auth/Signup' />;
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View>
        <Text style={{ color: '#F2F2F2', fontSize: 50, top: 130, left: 105, fontFamily: "IBMPlexMono-Medium" }}>Login</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={24} color="#484848" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder='Email/Username'
            placeholderTextColor={'#282828'}
            value={email}
            onChangeText={text => setEmail(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} color="#4848484" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder='Password'
            placeholderTextColor={'#282828'}
            secureTextEntry
            value={password}
            onChangeText={text => setPassword(text)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleLogin} style={[styles.button, styles.buttonOutline]}>
            <Text style={{ fontFamily: 'IBMPlexMono-Medium', fontSize: 12 }}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={redirectSignup} style={[styles.button, styles.buttonOutline]}>
            <Text style={{ left: 7, fontFamily: 'IBMPlexMono-Medium', fontSize: 12 }}>New to Audionote?  </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#14140F',
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
    top: 180,
    height: 45,
    alignItems: 'center',
    borderRadius: 15,
    borderColor: '#484848',
    borderWidth: 2,
    width: '70%',
  },
  inputIcon: {
    marginLeft: 17,
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
    paddingHorizontal: 12,
    borderRadius: 15,
    height: '100%',
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
    fontSize: 10,
  },
});
