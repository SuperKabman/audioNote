import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  TextInput,
  Text,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { Redirect } from "expo-router";
import { auth, firestore } from "./firebase"; // Import firestore from your firebase configuration
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Image } from "react-native";
import { signOut } from "firebase/auth";
import Scribble from "../assets/images/profileScribble1SVG.svg";
import Scribbles from "../assets/images/profileScribble2SVG.svg"
import Backbutton from "../assets/images/backbuttonSVG.svg";
import ProfilePicture from "../assets/images/profilePictureSVG.svg";
import Ellipse from "../assets/images/ellipseSVG.svg";
import ProfileBlob  from "../assets/images/profileBlob1.svg";
import ProfileBlobs  from "../assets/images/profileBlob2.svg";
import ProfileBlobss  from "../assets/images/profileBlob3.svg";
import ProfileBlobsss  from "../assets/images/profileBlob4.svg";


const InputWithIcon = ({ iconName, placeholder, value }) => (
  <View style={styles.inputContainer}>
    <FontAwesome name={iconName} size={20} color="grey" style={styles.icon} />
    <TextInput
      style={styles.inputText}
      placeholder={placeholder}
      placeholderTextColor="#666"
      value={value}
      editable={false} // Make the input non-editable
    />
  </View>
);

const App = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [userData, setUserData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No user data found!");
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    try {
      signOut(auth);
      setShouldRedirect(true);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const redirectHome = () => {
    setShouldRedirect(true);
  };

  if (shouldRedirect) {
    return <Redirect href="auth/Login" />;
  }

  return (
    
    <View  style={styles.container}>
      <ProfileBlob height={'180%'} width={'180%'} left = {'-70%'} top = {'10%'}  position = {"absolute"} />
      <ProfileBlobs height={'150%'} width={'150%'} bottom = {'-15%'} left = {'-100%'} position = {"absolute"} />
      <ProfileBlobss height={'180%'} width={'180%'} top = {'-70%'} left = {'-4%'} position = {"absolute"} />
      <ProfileBlobsss height={'200%'} width={'200%'} top = {'-20%'} left = {'15%'} position = {"absolute"} />
      <Ellipse height={'35%'} width={'35%'} top = {'3%'} left = {'32%'} position = {"absolute"} borderWidth = {20} borderColor = {'black'} />

      <ProfilePicture height={'20%'} width={'20%'} top = {'10%'} left = {'40%'} />
      <View style={styles.content}>
        <InputWithIcon
          iconName="user"
          placeholder="Username"
          value={userData.userName}
        />
        <InputWithIcon
          iconName="envelope"
          placeholder="Email"
          value={userData.email}
        />
        <InputWithIcon
          iconName="phone"
          placeholder="Phone Number"
          value={userData.phoneNumber}
        />
      </View>
      
      <TouchableOpacity
        onPress={redirectHome}
        style={[styles.backButtonContainer, { width: 80, height: 32 }]}
      >
        <Backbutton top={-8} left = {-3}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      
    </View>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#14140F",
    
  },
  topShapeContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  topShape: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 240,
    width: 400,
    top: -35,
    left: 5,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "lightgrey",
    top: 500,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    top:70,
    
    
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 35,
    backgroundColor: "white",
    marginVertical: 25,
    top: -100,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 2,
    height: '8%',
  },
  icon: {
    marginRight: 10,
    color: "black",
  },
  inputText: {
    flex: 1,
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomShapeContainer: {
    width: "10%",
    height: "10%",
    bottom: '100%',
  },
  bottomShape: {
    width: 500,
    height: 330,
    left: -50,
    bottom: -150,
    bottom: 100,
  },
  backButtonContainer: {
    position: "absolute",
    top: 65,
    left: 5,
  },
  backButton: {
    height: 32,
    width: 80,
  },
  logoutButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginVertical: 10,
    bottom: 100,
    left: 40,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default App;
