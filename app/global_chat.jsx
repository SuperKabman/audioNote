import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import OpenAI from 'openai'
import { Models } from 'openai/resources';
import { Alert } from 'react-native';
import {API_KEY} from '@/keys/config'
import { icons } from '@/constants/icons';


const openai = new OpenAI({apiKey:API_KEY});

const responseGeneration = async(userMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{role:'user', content: userMessage }],
      model: 'gpt-3.5-turbo',
    })
    return completion
  } catch (error) {
      console.error("Failed to generate response:", error);
      Alert.alert(
        "Response Generation Failed",
        "An error occurred while trying to generate the response."
      );
    }
}

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const userMessage = input;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInput('');

    try { 
      const response = await responseGeneration(userMessage);
      botMessage = response.choices[0].message.content;
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botMessage }]);
    } catch (error) {
      console.error("Error during chat:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>
            {message.sender === 'user' ? 'You: ' : 'Bot: '}
            {message.text}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type your message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    padding: 5,
  },
});

export default Chat;
