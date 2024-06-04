// import { AppRegistry } from "react-native";
// AppRegistry.registerComponent(appName, () => App());
import React, { useState, useEffect } from "react";

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import * as Sharing from "expo-sharing";
import { Audio } from "expo-av";
import axios from "axios";
import { NativeModules } from "react-native";
//import { manipulateAsync } from 'expo-image-manipulator';

import OpenAI from "openai";
import { API_KEY, Google_API_KEY, IP_ADDRESS } from "../keys/config";
// import { RNFFmpeg } from 'react-native-ffmpeg';
//const fs = require('fs');
//const filePath = '/Users/kabir/AudioNote/transcription-server/transcriptionFile(s)/transcription.txt';

// let recording = new Audio.Recording();

const openai = new OpenAI({
  apiKey: API_KEY,
});

export default function App() {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [progress, setProgress] = useState(0);
  const [gainValue, setGainValue] = useState(1);
  const [uri, setUri] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [transcription, setTranscription] = useState("");
  const [fileData, setFileData] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    getPermissions();
    // fetchTranscription();
  }, []);

  const getPermissions = async () => {
    const { status: micStatus } = await Permissions.askAsync(
      Permissions.AUDIO_RECORDING
    );
    const { status: storageStatus } = await Permissions.askAsync(
      Permissions.MEDIA_LIBRARY
    );
    if (micStatus !== "granted" || storageStatus !== "granted") {
      Alert.alert(
        "Permissions Denied",
        "This app requires microphone and storage permissions to function correctly.",
        [{ text: "OK" }]
      );
    }
  };

  // const audioAmplify = async (inputFilePath, outputFilePath, amplificationFactor) => {
  //   try {
  //     const ffmpegCommand = `-i ${inputFilePath} -filter:a "volume=${amplificationFactor}" ${outputFilePath}`;
  //     const { rc } = await RNFFmpeg.execute(ffmpegCommand);

  //     if (rc === 0) {
  //       console.log("Audio amplified successfully");
  //     } else {
  //       console.error("Failed to amplify audio");
  //     }
  //   } catch (error) {
  //     console.error("Error amplifying audio:", error);
  //   }
  // }

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

      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => setProgress(status.durationMillis / 1000)
      );

      console.log("Recording started");

      recording.setProgressUpdateInterval(100);
      recording.setOnRecordingStatusUpdate((status) => {
        setProgress(status.durationMillis / 1000);
        setRecording(recording);
      });
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
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
      alert("Previous recording deleted.");
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

  useEffect(() => {
    if (recording) {
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
      ? () => {
          console.log("Unloading sound...");
          sound.unloadAsync();
        }
      : undefined;
  }, [recording, sound]);

  return (
    <View style={styles.container}>
      <View style={styles.recorder}>
        <TouchableOpacity
          style={styles.button}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text>{recording ? "Stop Recording" : "Start Recording"}</Text>
        </TouchableOpacity>
        <Text>Recording Progress: {progress.toFixed(2)} s</Text>
        {uri ? (
          <>
            <TouchableOpacity style={styles.button} onPress={playRecording}>
              <Text>Play Recording</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={shareRecording}>
              <Text>Share Recording</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
      <View style={styles.responseContainer}>
        <Text>Generated Response:</Text>
        <Text>{generatedResponse}</Text>
      </View>
      {/* <View style={styles.gain}>
        <Text>Mic Gain</Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={0}
          maximumValue={10}
          value={gainValue}
          onValueChange={(value) => setGainValue(value)}
          step={0.1}
        />
        <Text>{gainValue.toFixed(1)}</Text>
      </View> */}
      <TouchableOpacity style={styles.button} onPress={handleResetFile}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  recorder: {
    marginBottom: 20,
  },
  responseContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  gain: {
    flexDirection: "row",
    alignItems: "center",
  },
});
