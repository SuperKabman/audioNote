import OpenAI from "openai";
import { API_KEY, Google_API_KEY, IP_ADDRESS } from "../keys/config";
import React, { useState, useEffect } from "react";

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";


const openai = new OpenAI({
    apiKey: API_KEY,
  });

async function stopRecording() {
    console.log("stop recording works!!!");
    const [uri, setUri] = useState("");
    const [recording, setRecording] = useState(null);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      setUri(uri);

      console.log("Transcribing audio...");
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: Platform.OS === "ios" ? "audio/x-caf" : "audio/mp4",
        name: Platform.OS === "ios" ? "recording.caf" : "recording.m4a",
      });

      const response = await axios.post(
        `http://${IP_ADDRESS}:3000/transcribe`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const transcription = response.data.transcription;
      console.log("Transcription:", transcription);
      //setGeneratedResponse(transcription);
      
      console.log("Audio transcription complete.");
      generateResponse(transcription);
      fetchTranscription();
      setRecording(null);
      setProgress(0);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

const generateResponse = async (Transcription) => {
    try {
        const [generatedResponse, setGeneratedResponse] = useState("");
        const [fileData, setFileData] = useState("");
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fileData + Transcription}],
      });

      console.log("Generated response:", response.choices[0].message.content);
      setGeneratedResponse(response.choices[0].message.content);
    } catch (error) {
      console.error("Failed to generate response:", error);
      Alert.alert(
        "Response Generation Failed",
        "An error occurred while trying to generate the response."
      );
    }
  };

const fetchTranscription = async () => {
    try {
      const response = await axios.get(`http://${IP_ADDRESS}:3000/file`);
      setFileData(response.data);
    } catch (error) {
      console.error("Error fetching transcription:", error);
      Alert.alert(
        "Fetch Failed",
        "An error occurred while trying to fetch the transcription."
      );
    }
  };

  export default stopRecording;
