import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import OpenAI from "openai";
import { Redirect } from "expo-router";
import { API_KEY } from "@/keys/config";
import { KeyboardAvoidingView, Platform } from "react-native";
import Backbutton from "../assets/images/backbuttonSVG.svg";

const openai = new OpenAI({ apiKey: API_KEY });

const responseGeneration = async (userMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a chatbot in an app called AudioNote. This app is used to record audio-notes of conversations, discussions, meetings, lectures, etc. You have the responsibility to answer any questions from any of the audio-notes that the user has made in this app. '},
        {role:'user', content: userMessage}
      ],
      model: "gpt-3.5-turbo",
    });
    return completion;
  } catch (error) {
    console.error("Failed to generate response:", error);
    Alert.alert(
      "Response Generation Failed",
      "An error occurred while trying to generate the response."
    );
  }
};
let context = "";
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  
  const sendMessage = async () => {
    const userMessage = input;
    context = context+'\n'+userMessage;
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setInput("");
  
    try {
      
      const response = await responseGeneration(context+'\n\n\n'+userMessage);
      
const botMessage = response.choices[0].message.content;
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botMessage },
        
      ]);
      
    
      
   

    } catch (error) {
      console.error("Error during chat:", error);
    }
  };

  const redirectHome = () => {
    setShouldRedirect(true);
  };

  if (shouldRedirect) {
    context = "";
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/chatCanvas.png")}
        style={styles.canvas}
      />
      <TouchableOpacity
        onPress={redirectHome}
        style={styles.backButtonContainer}
      >
        <Backbutton />
      </TouchableOpacity>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>
            {message.sender === "user" ? "You: " : "Bot: "}
            {message.text}
          </Text>
        ))}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       style={styles.inputContainer} >
        <Image
          source={require("../assets/images/chatBar.png")}
          style={styles.chatBar}
        />
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type your message"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendButtonContainer}
        >
          <Image
            source={require("../assets/images/sendButton.png")}
            style={styles.sendButton}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  canvas: {
    position: "absolute",
    height: "85%",
    width: "95%",
    left: "2.5%",
    top: "12%",
    borderRadius: 40,
  },
  backButtonContainer: {
    position: "absolute",
    top: 48,
    left: 20,
  },
  backButton: {
    height: 32,
    width: 80,
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
    marginTop: 90,
    marginBottom: 60,
    opacity: 20,
  },
  message: {
    left: "2%",
    fontSize: 18,
    fontFamily: "IBMPlexMono-Medium",
    marginBottom: 10,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    bottom: "2%",
    width: "90%",
    left: "5%",
  },
  chatBar: {
    position: "absolute",
    height: "65%",
    width: "98%",
    bottom: "33%",
    left: "2%",
  },
  input: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
    opacity: 0.8,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "white",
    bottom: '3%',
  },
  sendButtonContainer: {
    padding: "5%",
  },
  sendButton: {
    height: 42,
    width: 42,
    left: "30%",
    bottom:'28%',
  },
});

export default Chat;