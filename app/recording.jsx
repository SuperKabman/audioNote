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
import { useNavigation } from "expo-router";
import Back_icon from "../assets/images/caret-left-solid.svg";
import { ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native";

const openai = new OpenAI({
  apiKey: API_KEY,
});

const configureAudio = async () => {
  try {
    console.log("Setting audio mode with the following configuration:");
    console.log({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    });

    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
    });

    console.log("Audio mode configured successfully.");
  } catch (error) {
    console.error("Error configuring audio mode:", error);
    throw error;
  }
};

configureAudio();

export default function App() {
  const [recordingVar, setRecordingVar] = useState(null);
  const [sound, setSound] = useState(null);
  const [uri, setUri] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [transcription, setTranscription] = useState("");
  const [wordTimeMapping, setWordTimeMapping] = useState({});
  const [waveform, setWaveform] = useState(new Array(40).fill(0));
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [filename, setFilename] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    getPermissions();
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

      console.log("Configuring audio...");
      await configureAudio();

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      console.log("Recording started");
      setRecordingVar(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");
      await recordingVar.stopAndUnloadAsync();
      const uri = recordingVar.getURI();
      setUri(uri);
      console.log("Recording stopped and stored");
      console.log("uri", uri);
      console.log("Transcribing audio...");

      // ____________________________ TRANSCRIPTION LOGIC START ______________________________________
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: Platform.OS === "ios" ? "audio/wav" : "audio/m4a",
        name: "recording.m4a",
      });

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${API_KEY}`,
      };

      try {
        const response = await axios.post(
          `http://${LOCAL_IP_ADDRESS}:8080/transcribe`,
          formData,
          { headers: headers }
        );

        setTranscription(response.data.transcription);
        setWordTimeMapping(response.data.wordTimeMapping);
        setGeneratedSummary(response.data.summary);
        setFilename(response.data.title); // generated file name
        console.log("Transcription response:", response.data);
      } catch (error) {
        console.error("Error during transcription:", error);
      }

      // ____________________________ TRANSCRIPTION LOGIC END ______________________________________

      setRecordingVar(null);
      setIsRecording(false);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  // _________________________________ RECORDING LOGIC END ______________________________________

  const handleSave = async () => {
    try {
      // Create the directory
      const recordingDir = `${FileSystem.documentDirectory}recordings/${filename}`;
      console.log("Creating directory:", recordingDir);
      await FileSystem.makeDirectoryAsync(recordingDir, {
        intermediates: true,
      });
  
      // Save the audio file in the directory
      const fileURI =
        Platform.OS === "ios"
          ? `${recordingDir}/recording.wav`
          : `${recordingDir}/recording.m4a`;
      console.log("Moving file from", uri, "to", fileURI);
      await FileSystem.moveAsync({ from: uri, to: fileURI });
      console.log("Recording saved to:", fileURI);
  
      // Save the transcription in a file
      console.log("Saving transcription...");
      const transcriptionFile = `${recordingDir}/transcription.txt`;
      await FileSystem.writeAsStringAsync(transcriptionFile, transcription);
      console.log("Transcription saved to:", transcriptionFile);

      const getFormattedDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
  
        // Append the transcription to the common file
        const commonTranscriptionFile = `${FileSystem.documentDirectory}recordings/common_transcription.txt`;

        let commonTranscriptionContent = await FileSystem.readAsStringAsync(
          commonTranscriptionFile,
          { encoding: FileSystem.EncodingType.UTF8 }
        ).catch(() => "");

        const formattedDateTime = getFormattedDateTime();
        const formattedTranscription = `\n\n[${formattedDateTime}] ${transcription}`;

        commonTranscriptionContent += formattedTranscription;

        await FileSystem.writeAsStringAsync(
          commonTranscriptionFile,
          commonTranscriptionContent
        );

      console.log("appended:", commonTranscriptionContent);
  
      // Save the metadata in a file
      const metadataFile = `${recordingDir}/metadata.json`;
      const recordingLengthSeconds = progress;
      const metadata = {
        recordingDate: new Date().toLocaleDateString(),
        recordingLength: `${recordingLengthSeconds} seconds`,
      };
      console.log("Saving metadata:", metadata);
      await FileSystem.writeAsStringAsync(
        metadataFile,
        JSON.stringify(metadata)
      );
      console.log("Metadata saved to:", metadataFile);
  
      // Save the summary in a file
      console.log("Saving summary...");
      const summaryFile = `${recordingDir}/summary.txt`;
      await FileSystem.writeAsStringAsync(summaryFile, generatedSummary);
      console.log("Summary saved to:", summaryFile);
  
      // Save the word-time mapping
      console.log("Saving word-time mapping...");
      const wordTimeMappingFile = `${recordingDir}/word_time_mapping.json`;
      await FileSystem.writeAsStringAsync(
        wordTimeMappingFile,
        JSON.stringify(wordTimeMapping)
      );
      console.log("Word-time mapping saved to:", wordTimeMappingFile);

      handleBackButton();

    } catch (error) {
      console.error("Error saving recording:", error);
      Alert.alert(
        "Save Error",
        "There was an error saving the recording. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  

  const handleResetFile = async () => {
    setGeneratedResponse("");
    setTranscription({});
    setGeneratedSummary("");
  };

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

  const openRenameModal = () => {
    setIsRenameVisible(true);
  };

  const closeRenameModal = () => {
    setIsRenameVisible(false);
  };

  const handleRenameSave = (newName) => {
    setFilename(newName);
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
      setIsRecording(true);
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

  const navigation = useNavigation();

  const handleBackButton = async () => {
    handleResetFile();
    setRecordingVar(null);
    navigation.navigate("home");
  };

  return isRecording ? (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, alignContent: "center", justifyContent: "center" }}
      >
        <Waveform waveform={waveform} />
      </View>
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
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
  >
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ position: 'absolute', top: '5%', left: "5%" }}>
        <TouchableOpacity onPress={handleBackButton}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'black',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Back_icon height="20" width="20" fill="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, marginHorizontal: '5%', marginTop: '25%' }}>
        <TouchableOpacity onPress={openRenameModal}>
          <Text
            style={{
              fontFamily: 'IBMPlexMono-SemiBold',
              color: 'black',
              fontSize: 30,
              textAlign: 'center',
              marginBottom: '7%',
            }}
          >
            {filename}
          </Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text
            style={{
              fontFamily: 'IBMPlexMono-Regular',
              color: 'grey',
              fontSize: 16,
              flex: 1,
            }}
          >
            {generatedSummary}
          </Text>
        </ScrollView>
      </View>
      
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: '5%',
          marginBottom: '2%',
        }}
      >
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <TouchableOpacity onPress={handleSave}>
            <Image
              source={require('../assets/images/blob_1.gif')}
              style={{ width: 110, height: 110 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontFamily: 'IBMPlexMono-Regular',
                position: 'absolute',
                top: '37%',
                left: '10%',
                color: 'white',
                fontSize: 16,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <RenameModal
        visible={isRenameVisible}
        onClose={closeRenameModal}
        onSave={handleRenameSave}
        currentName={filename}
      />
    </SafeAreaView>
  </KeyboardAvoidingView>
  );
};
