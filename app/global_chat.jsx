import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import OpenAI from "openai";
import { Redirect } from "expo-router";
import { API_KEY } from "@/keys/config";
import Backbutton from "../assets/images/backbuttonSVG.svg";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "expo-router";

const openai = new OpenAI({ apiKey: API_KEY });

const loadChatContext = async () => {
  try {
    const commonTranscriptionFile = `${FileSystem.documentDirectory}recordings/common_transcription.txt`;
    const context = await FileSystem.readAsStringAsync(commonTranscriptionFile, { encoding: FileSystem.EncodingType.UTF8 });
    console.log("Chat context loaded:", context);
    return context;
  } catch (error) {
    console.error("Error loading chat context:", error);
    throw error; // Propagate the error up to handle it elsewhere if needed
  }
};

const appendExistingTranscriptions = async () => {
  try {
    const recordingsDir = `${FileSystem.documentDirectory}recordings/`;
    const dirInfo = await FileSystem.readDirectoryAsync(recordingsDir);
    let commonTranscriptionContent = await FileSystem.readAsStringAsync(`${recordingsDir}common_transcription.txt`, { encoding: FileSystem.EncodingType.UTF8 }).catch(() => "");

    for (const subDir of dirInfo) {
      if (!subDir) {
        console.warn("Subdirectory name is not defined, skipping this iteration");
        continue;
      }
      const subDirPath = `${recordingsDir}${subDir}`;
      const transcriptionFilePath = `${subDirPath}/transcription.txt`;

      const fileInfo = await FileSystem.getInfoAsync(transcriptionFilePath);
      if (fileInfo.exists) {
        const transcription = await FileSystem.readAsStringAsync(transcriptionFilePath, { encoding: FileSystem.EncodingType.UTF8 });
        commonTranscriptionContent += `\n\n${transcription}`;
      }
    }

    await FileSystem.writeAsStringAsync(`${recordingsDir}common_transcription.txt`, commonTranscriptionContent);
    console.log("All existing transcriptions appended to common file");
  } catch (error) {
    console.error("Error appending existing transcriptions:", error);
    throw error; // Propagate the error up to handle it elsewhere if needed
  }
};

const initializeChat = async () => {
  await appendExistingTranscriptions();
  const context = await loadChatContext();
  console.log("Chat context loaded:", context);
  return context;
};

const responseGeneration = async (userMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a chatbot in an app called AudioNote. This app is used to record audio-notes of conversations, discussions, meetings, lectures, etc. You have the responsibility to answer any questions from any of the audio-notes that the user has made in this app. In front of every line of audionotes context, there is the date and time present in square brackets. The date and time inside those square brackets is not content from the audionote otself, that is just for you to know that when an audionote was made by the user. Dont talk about the audionotes unless you are asked about them, if you are not asked a question related to any information in the audionotes context, just behave like a normal assisstant in the audionotes app.' },
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
    throw error; // Propagate the error up to handle it elsewhere if needed
  }
};
let localContext = "";
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [chatContext, setChatContext] = useState("");

  const sendMessage = async () => {
    const userMessage = input;
    localContext = localContext + '\n' + userMessage; 
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setInput("");

    try {
      const context = await initializeChat();
      setChatContext(context);
      
      const response = await responseGeneration(`context from audionotes: \n${context}\n context from this conversation: \n${localContext}\n\n user query: ${userMessage}`);
      const botMessage = response.choices[0].message.content;

      setMessages(prevMessages => [
        ...prevMessages,
        { sender: "bot", text: botMessage },
      ]);

    } catch (error) {
      console.error("Error during chat:", error);
    }
  };

  const resetVariables  = async () => {
    setLocalContext("");
    setChatContext("");
    const commonTranscriptionFile = `${FileSystem.documentDirectory}recordings/common_transcription.txt`;
    try {
      await FileSystem.writeAsStringAsync(commonTranscriptionFile, "", { encoding: FileSystem.EncodingType.UTF8 });
      console.log("Common transcription file reset to empty");
    } catch (error) {
      console.error("Failed to reset common transcription file:", error);
    }
  }

  const handleBackButton = () => {
    resetVariables(); 
    setShouldRedirect(true);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {shouldRedirect && <Redirect href='/home' />}
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
            Hi, ask me anything from any of your audionotes and beyond.
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

export default Chat;
