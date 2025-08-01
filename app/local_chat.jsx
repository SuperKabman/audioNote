import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Image } from 'react-native'
import { TouchableOpacity } from 'react-native' 
import Backbutton from "../assets/images/backbuttonSVG.svg";
import { KeyboardAvoidingView } from 'react-native' 
import { Platform } from 'react-native' 
import { ScrollView } from 'react-native'
import { TextInput } from 'react-native'    
import { Redirect } from 'expo-router'    
import { API_KEY } from "@/keys/config";
import OpenAI from "openai";
import { useNavigation } from 'expo-router'
const openai = new OpenAI({ apiKey: API_KEY });


let context = "";
const local_chat = () => {

  const {transcription} = useLocalSearchParams(); 
  const navigation = useNavigation();
  const responseGeneration = async (userMessage) => {

  
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: "You are a simple assistant bot in the audionote app who will answer any questions related to the transcription that you are going to be given in this prompt. You will be given a transcription of a conversation and you will have to answer any questions that the user might have about the transcription. You will always address the transcription as 'the conversation'. Do not talk about the transcription unless you are asked about it. Other wise just act like a chatgpt chat window but as an assisstant for audionote. The transcription: \n\n" + transcription },
          { role: 'user', content: userMessage }
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
      throw error; 
    }
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");


  const sendMessage = async () => {
    const userMessage = input;
    context = context + '\n' + userMessage; 
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setInput("");

    try {
      const response = await responseGeneration(context+'\n\n\n'+userMessage);
      const botMessage = response.choices[0].message.content;

      setMessages(prevMessages => [
        ...prevMessages,
        { sender: "bot", text: botMessage },
      ]);

    } catch (error) {
      console.error("Error during chat:", error);
    }
  };
  
  const handleBackButton = () => {
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
     
      <Image
        source={require("../assets/images/chatCanvas.png")}
        style={styles.canvas}
      />
      <TouchableOpacity
        onPress={handleBackButton}
        style={styles.backButtonContainer}
      >
        <Backbutton />
      </TouchableOpacity>
      <ScrollView style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <Text style={styles.welcomeMessage}>
                        Hi, ask me anything from this audionote.

          </Text>
        ) : (
          messages.map((message, index) => (
            <Text key={index} style={message.sender === "user" ? styles.userMessage : styles.botMessage}>
              {message.sender === "user" ? "You-> " : "Bot-> "}
              {message.text}
            </Text>
          ))
        )}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  style={styles.inputContainer}>
        <Image
          source={require("../assets/images/chatBar.png")}
          style={styles.chatBar}
        />
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type your message"
          placeholderTextColor="black"
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#DADADA",
  },
  welcomeMessage: {
    fontSize: 25,
    fontFamily: "IBMPlexMono-Medium",
    marginBottom: 20,
    color: "#A5A5A5",
    textAlign: "center",
    lineHeight: 60,
    marginHorizontal: 5,
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
    top: "5%",
    left: "5%",
  },
  messagesContainer: {
    flex: 1,
    marginTop: "30%",
    marginHorizontal: "5%",
    marginBottom: "30%",
  },
  userMessage: {
    fontSize: 18,
    fontFamily: "IBMPlexMono-Medium",
    marginBottom: 20,
    color: "#A5A5A5",
  },
  botMessage: {
    fontSize: 18,
    fontFamily: "IBMPlexMono-Medium",
    marginBottom: 20,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    bottom: "2%",
    left: "2.5%",
    width: "95%",
  },
  chatBar: {
    position: "absolute",
    height: "100%",
    width: "100%",
    bottom: "0%",
    left: "0%",
    opacity: 0,
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
    borderRadius: 20,
  },
  sendButtonContainer: {
    padding: "5%",
  },
  sendButton: {
    height: 42,
    width: 42,
  },
});

export default local_chat







    // const {transcription} = useLocalSearchParams(); t
    // useEffect(() => {
    //   const sendDataToBackend = async () => {
    //     try {
    //       const response = await axios.post(`http://${LOCAL_IP_ADDRESS}:8080/localHelp`, {
    //         transcription: transcription
    //       });
    //       console.log(response.data);
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   };
    //   sendDataToBackend();
    // }, []);