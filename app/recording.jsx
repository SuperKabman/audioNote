import React, { useState, useEffect } from "react";

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  Image,
  SafeAreaView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Audio, ResizeMode } from "expo-av";
import axios from "axios";

import OpenAI from "openai";
import { API_KEY, Google_API_KEY, IP_ADDRESS } from "../keys/config";
import * as MediaLibrary from "expo-media-library";

const openai = new OpenAI({
  apiKey: API_KEY,
});

export default function App() {
  // const [recordingVar, setRecordingVar] = useState(null);
  const [sound, setSound] = useState(null);
  const [gainValue, setGainValue] = useState(1);
  const [uri, setUri] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [transcription, setTranscription] = useState("");
  const [fileData, setFileData] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    getPermissions();
    fetchTranscription();
  }, []);

  let recordingVar = null;

  const getPermissions = async () => {
    const { status: micStatus } = await Audio.requestPermissionsAsync();
    const { status: storageStatus } =
      await MediaLibrary.requestPermissionsAsync();

    if (micStatus !== "granted" || storageStatus !== "granted") {
      Alert.alert(
        "Permissions Denied",
        "This app requires microphone and storage permissions to function correctly.",
        [{ text: "OK" }]
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

  async function startRecording() {
    if (recordingVar != null) {
      await stopRecording();
    }
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

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      console.log("Recording started");
      recordingVar = recording;
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");
      await recordingVar.stopAndUnloadAsync();
      const uri = recordingVar.getURI();
      console.log("Recording stopped and stored");
      setUri(uri);
      recordingVar = null;
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
      fetchTranscription();
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  async function playRecording() {
    try {
      if (uri) {
        console.log("Loading sound from", uri);
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);

        console.log("Playing sound...");
        await sound.playAsync();
      } else {
        console.log("No URI set for the recording.");
      }
    } catch (err) {
      console.error("Failed to play recording", err);
    }
  }

  async function shareRecording() {
    try {
      if (uri) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          "No Recording",
          "There is no recording available to share."
        );
      }
    } catch (err) {
      console.error("Failed to share recording", err);
      Alert.alert(
        "Share Failed",
        "An error occurred while trying to share the recording."
      );
    }
  }

  const handleResetFile = async () => {
    try {
      await axios.post(`http://${IP_ADDRESS}:3000/resetTranscriptionFile`);
      setFileData("");
      setGeneratedResponse("");
    } catch (error) {
      console.error("Error resetting transcription file:", error);
      alert("Error resetting transcription file. Please try again.");
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

  // use effect for recording parameteres
  useEffect(() => {
    if (recordingVar) {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldActivateAudio: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    }
    return sound
      ? async () => {
          if (!recordingVar) {
            console.log("Unloading sound...");
            await sound.unloadAsync();
          }
        }
      : undefined;
  }, [recordingVar, sound]);

  // use effect to start the recording as soon as the page loads
  useEffect(() => {
    const initializeRecording = async () => {
      console.log("Initializing recording...");
      startRecording();
    };

    initializeRecording();
  }, []);

  // use effect for the timer
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [isListening, setIsListening] = useState(true); // for when the app is recording

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused && isListening) {
        setProgress((prevProgress) => prevProgress + 1);
      }
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [isPaused]);

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const handleRecordingCycle = async () => {
    await startRecording();
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isListening && !isPaused) {
        await handleRecordingCycle();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isListening, isPaused]);

  const handleStopButton = async () => {
    setIsListening(false);
    await stopRecording();
    handleResetFile();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: "IBMPlexMono-Medium",
          color: "black",
          fontSize: 16,
          marginTop: "15%",
          marginHorizontal: "5%",
        }}
      >
        {fileData}
      </Text>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginHorizontal: "5%",
          marginBottom: "2%",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity onPress={handleStopButton}>
              <Image
                source={require("../assets/images/stopButton.png")}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={require("../assets/images/blob_1.gif")}
              style={{ width: 110, height: 110 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontFamily: "IBMPlexMono-Regular",
                position: "absolute",
                top: "37%",
                left: "37%",
                color: "white",
                fontSize: 16,
              }}
            >
              {Math.floor(progress / 60)}:{progress % 60 < 10 ? "0" : ""}
              {Math.floor(progress % 60)}
            </Text>
          </View>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={require("../assets/images/stopButton.png")}
              style={{ width: 70, height: 70 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
