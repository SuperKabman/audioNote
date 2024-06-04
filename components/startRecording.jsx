import { View, Text, Alert } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'expo-router'
import 'nativewind'
import { Audio } from "expo-av";
import axios from "axios";
import * as Permissions from "expo-permissions";

const getPermissions = () => {
  Permissions.askAsync(Permissions.AUDIO_RECORDING)
    .then(({ status: micStatus }) => {
      return Permissions.askAsync(Permissions.MEDIA_LIBRARY).then(
        ({ status: storageStatus }) => ({ micStatus, storageStatus })
      );
    })
    .then(({ micStatus, storageStatus }) => {
      if (micStatus !== "granted" || storageStatus !== "granted") {
        Alert.alert(
          "Permissions Denied",
          "This app requires microphone and storage permissions to function correctly.",
          [{ text: "OK" }]
        );
      }
    })
    .catch((err) => {
      console.error("Failed to get permissions", err);
    });
};

export default function useStartRecording() {
  const [recording, setRecording] = useState(null);
  const [progress, setProgress] = useState(0);

  const startRecording = () => {
    getPermissions();
    Audio.requestPermissionsAsync()
      .then(() => {
        return Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      })
      .then(() => {
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

        return Audio.Recording.createAsync(
          recordingOptions,
          (status) => setProgress(status.durationMillis / 1000)
        );
      })
      .then(({ recording }) => {
        recording.setProgressUpdateInterval(100);
        recording.setOnRecordingStatusUpdate((status) => {
          setProgress(status.durationMillis / 1000);
        });
        setRecording(recording);
      })
      .catch((err) => {
        console.error("Failed to start recording", err);
      });
  };

  return { startRecording, recording, progress };
}


