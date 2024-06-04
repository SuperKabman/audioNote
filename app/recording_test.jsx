import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from "react-native";
import OpenAI from "openai";
import { API_KEY, Google_API_KEY, IP_ADDRESS } from "../keys/config";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

let recording = new Audio.Recording();

const recording_test = () => {
  const getPermissions = async () => {
    try {
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      const { status: storageStatus } =
        await MediaLibrary.requestPermissionsAsync();

      if (micStatus !== "granted" || storageStatus !== "granted") {
        Alert.alert(
          "Permissions Denied",
          "This app requires microphone and storage permissions to function correctly.",
          [{ text: "OK" }]
        );
      } else {
        console.log("Permissions granted");
      }
    } catch (err) {
      console.error("Failed to get permissions", err);
    }
  };

  //const [recording, setRecording] = useState(null); //used to store the data about the recording
  const [progress, setProgress] = useState(0);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [fileData, setFileData] = useState(""); // used to store the data about the transcription
  const [uri, setUri] = useState("");

  const cleanupRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      } catch (error) {
        console.error("Failed to stop and unload recording", error);
      }
    }
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      await recording.prepareToRecordAsync(recordingOptions);
      console.log("Recording prepared");
      await recording.startAsync();
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  const openai = new OpenAI({
    apiKey: API_KEY,
  });

  const stopRecording = async () => {
    console.log("stop recording works!!!");

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
  };

  const generateResponse = async (Transcription) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fileData + Transcription }],
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

  useEffect(() => {
    getPermissions();
    startRecording();
  }, []);

  return (
    <View>
      <TouchableOpacity
        onPress={stopRecording}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <Text>stop recoridng</Text>
      </TouchableOpacity>
    </View>
  );
};

export default recording_test;
