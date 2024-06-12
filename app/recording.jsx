import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  Image,
  SafeAreaView,
  Animated,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Audio } from "expo-av";
import axios from "axios";
import OpenAI from "openai";
import { API_KEY, Google_API_KEY, LOCAL_IP_ADDRESS } from "../keys/config";
import * as MediaLibrary from "expo-media-library";
import Waveform from "../components/waveform";
import RenameModal from "../components/rename_file";

const openai = new OpenAI({
  apiKey: API_KEY,
});

export default function App() {
  const [recordingVar, setRecordingVar] = useState(null);
  const [sound, setSound] = useState(null);
  const [gainValue, setGainValue] = useState(1);
  const [uri, setUri] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [transcription, setTranscription] = useState("");
  const [fileData, setFileData] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [waveform, setWaveform] = useState(new Array(40).fill(0));
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [filename, setFilename] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    getPermissions();
    fetchTranscription();
  }, []);

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
      const response = await axios.get(`http://${LOCAL_IP_ADDRESS}:8080/file`);
      setFileData(response.data);
    } catch (error) {
      console.error("Error fetching transcription:", error);
      Alert.alert(
        "Fetch Failed",
        "An error occurred while trying to fetch the transcription."
      );
    }
  };

  // _________________________________ RECORDING LOGIC START ______________________________________

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

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      console.log("Recording started");
      setRecordingVar(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  const ensureDirExists = async (dir) => {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      console.log("Directory does not exist, creating...");
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");
      await recordingVar.stopAndUnloadAsync();
      const uri = recordingVar.getURI();
      console.log("Recording stopped and stored");
      console.log('uri', uri);
      console.log("Transcribing audio...");
      // const formData = new FormData();
      // formData.append("audio", {
      //   uri: uri,
      //   type: Platform.OS === "ios" ? "audio/wav" : "audio/m4a",
      //   name: Platform.OS === "ios" ? "recording.caf" : "recording.m4a",
      // });

      // const response = await axios.post(`http://${LOCAL_IP_ADDRESS}:8080/transcribeFromFile`, {
      //   filePath: uri,
      // });

      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: Platform.OS === "ios" ? "audio/wav" : "audio/m4a",
        name: "recording.m4a",
      });

      const headers = {
        'Content-Type': 'multipart/form',
        'Authorization': `Bearer ${API_KEY}`
      }

      const response = await axios.post(`http://${LOCAL_IP_ADDRESS}:8080/transcribe`, formData, { headers: headers });
      console.log("Transcription response:", response.data);

      const transcription = response.data.transcription;
      
      setFileData(transcription);
      console.log("Transcription:", transcription);
      // const wordTimeMapping = await axios.post(
      //   `http://${LOCAL_IP_ADDRESS}:8080/getWordTimeMapping`
      // );

      // setting the default file name
      const folder_name = `recording_${new Date().getTime()}`;

      // creating the directory
      const recordingDir = `${FileSystem.documentDirectory}recordings/${folder_name}`;
      await FileSystem.makeDirectoryAsync(recordingDir, {
        intermediates: true,
      });

  

      // saving the audio file in the directory
      const fileURI = Platform.OS === "ios" ? `${recordingDir}/recording.wav` : `${recordingDir}/recording.m4a`;
      await FileSystem.moveAsync({ from: uri, to: fileURI });
      console.log("Recording saved to:", fileURI);
      const fileInfo = await FileSystem.getInfoAsync(fileURI);
      console.log("File info:", fileInfo);

      // saving the transcription in a file
      // const transcriptionFile = `${recordingDir}/transcription.txt`;
      // await FileSystem.writeAsStringAsync(transcriptionFile, transcription);
      // console.log("Transcription saved to:", transcriptionFile);

      // //saving the metadata in a file
      // const metadataFile = `${recordingDir}/metadata.txt`;
      // const recordingLengthSeconds = recordingVar.getDurationMillis() / 1000;
      // const metadata = `Recording Date: ${new Date().toLocaleDateString()}\nRecording Length: ${recordingLengthSeconds} seconds`;
      // await FileSystem.writeAsStringAsync(metadataFile, metadata);
      // console.log("Metadata saved to:", metadataFile);

      // saving the summary in a file

      // saving the word-time-mapping
      // const wordTimeMappingFile = `${recordingDir}/word_time_mapping.json`;
      // await FileSystem.writeAsStringAsync(
      //   wordTimeMappingFile,
      //   JSON.stringify(wordTimeMapping)
      // );
      // console.log("Word-time mapping saved to:", wordTimeMappingFile);

      setUri(fileURI);
      setRecordingVar(null);
      setIsRecording(false);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  // _________________________________ RECORDING LOGIC END ______________________________________

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
      await axios.post(`http://${LOCAL_IP_ADDRESS}:8080/resetTranscriptionFile`);
      setFileData("");
      setGeneratedResponse("");
    } catch (error) {
      console.error("Error resetting transcription file:", error);
      alert("Error resetting transcription file. Please try again.");
    }
  };

  //Summariser for general notes
  const generateResponseNote = async (Transcription) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:'You are a summarizing tool for general audio-notes that a person might make at any time of their day. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio.'},{ role: "user", content:Transcription }],
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

  //Summariser for lectures
  const generateResponseLecture = async (Transcription) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:'You are a summarizing tool for university lectures that a person might record for any class/subject/course or level of study. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio.'},{ role: "user", content:Transcription }],
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

  //Summariser for discussions
  const generateResponseDiscussion = async (Transcription) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:'You are a summarizing tool for general discussions about anything that a person might have with anyone at any one or multiple people. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio.'},{ role: "user", content:Transcription }],
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

  //Summariser for meetings
  const generateResponseMeeting = async (Transcription) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:'You are a summarizing tool for formal or informal meetings that a person might record at any time of their day. Your responsibility is to summarize those audionotes without cutting any important information out of them. Keep in mind that these are audionotes, and some words might be unclear or seem out of context because of being a direct transcription of the audio.'},{ role: "user", content:Transcription }],
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
  }

  const updateWaveform = async () => {
    const newWaveform = generateMockWaveform(40);
    setWaveform(newWaveform);
  };

  const generateMockWaveform = (length) => {
    const points = [];
    for (let i = 0; i < length; i++) {
      points.push(Math.random() * 100);
    }
    return points;
  };

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

  useEffect(() => {
    const initializeRecording = async () => {
      console.log("Initializing recording...");
      handleResetFile();
      startRecording();
    };

    initializeRecording();
  }, []);

  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      if (isListening) {
        setProgress((prevProgress) => prevProgress + 0.5);
        updateWaveform();
      }
    }, 500);
    return () => clearInterval(id);
  }, [isListening]);

  const pauseRecording = async () => {
    if (recordingVar) {
      console.log("Pausing recording...");
      await recordingVar.pauseAsync();
      setIsListening(false);
    }
  };

  const resumeRecording = async () => {
    if (recordingVar) {
      console.log("Resuming recording...");
      await recordingVar.startAsync();
      setIsListening(true);
    }
  };

  const handleStopButton = async () => {
    setIsListening(false);
    await stopRecording();
  };

  const handleSave = (newFileUri) => {
    setUri(newFileUri);
    isRenameVisible(false);
    navigation.navigate("home");
  };

  return isRecording ? (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignContent: "center", justifyContent: "center" }}>
        <Waveform waveform={waveform} />
      </View>
      <Text>{fileData}</Text>
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
            <TouchableOpacity
              onPress={isListening ? pauseRecording : resumeRecording}
            >
              <Image
                source={
                  isListening
                    ? require("../assets/images/pauseButton.png")
                    : require("../assets/images/playButton.png")
                }
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <RenameModal
        visible={isRenameVisible}
        onClose={() => setIsRenameVisible(false)}
        onSave={handleSave}
        fileUri={uri}
      /> */}
    </SafeAreaView>
  );
}
