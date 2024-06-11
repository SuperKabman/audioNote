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
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/profileScribble1.png")}
        style={styles.topShape}
      >
        <View style={styles.circle} />
      </ImageBackground>
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
      <ImageBackground
        source={require("../assets/images/profileScribble2.png")}
        style={styles.bottomShape}
      />
      <TouchableOpacity
        onPress={redirectHome}
        style={[styles.backButtonContainer, { width: 80, height: 32 }]}
      >
        <Image
          source={require("../assets/images/backButton.png")}
          style={styles.backButton}
        />
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
    backgroundColor: "white",
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
    top: 75,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 35,
    backgroundColor: "lightgrey",
    marginVertical: 25,
    top: 50,
    paddingHorizontal: 10,
    borderRadius: 5,
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
    width: "100%",
    height: "100%",
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
  logoutButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginVertical: 10,
    bottom: 70,
    left: 40,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default App;
