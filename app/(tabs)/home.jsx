import { View, Text, Alert } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import 'nativewind'
import { Audio } from "expo-av";
import axios from "axios";
import { useState } from "react";
import * as Permissions from "expo-permissions";



const [recording, setRecording] = useState(null);
const [progress, setProgress] = useState(0);

const getPermissions = async () => {
  const { status: micStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
  const { status:storageStatus} = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
  if (micStatus !== "granted" || storageStatus !== "granted") {
    Alert.alert(
      "Permissions Denied",
      "This app requires microphone and storage permissions to function correctly.",
      [{ text: "OK" }]
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

    recording.setProgressUpdateInterval(100);
    recording.setOnRecordingStatusUpdate((status) => {
      setProgress(status.durationMillis / 1000);
    });

    setRecording(recording);
  } catch (err) {
    console.error("Failed to start recording", err);
  }
}

const Home = () => {
  return (
    <View>
      <Link href= '/recording' className='items-center justify-center'>Recording</Link>
    </View>
  )
}

export default Home