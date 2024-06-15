import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio, setProgressUpdateIntervalMillis } from "expo-av";
import * as FileSystem from "expo-file-system";
import Slider from "@react-native-community/slider";
import Back_icon from "../assets/images/caret-left-solid.svg";
import PlayIcon from "../assets/images/play-solid.svg";
import PauseIcon from "../assets/images/pause-solid.svg";
import { useNavigation } from "expo-router";


const showTranscription = () => {
  const navigation = useNavigation();
  const { path, targetSentence, startTime, endTime } = useLocalSearchParams();
  const [transcription, setTranscription] = useState("");
  const [wordTimeMapping, setWordTimeMapping] = useState([]);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState({});
  const soundRef = useRef(new Audio.Sound());

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const transcriptionPath = `${path}/transcription.txt`;
        const transcriptionRaw =
          await FileSystem.readAsStringAsync(transcriptionPath);
        setTranscription(transcriptionRaw);
      } catch (error) {
        console.error("Failed to fetch transcription", error);
      }
    };

    const fetchWordTimeMapping = async () => {
      try {
        const wordTimeMappingPath = `${path}/word_time_mapping.json`;
        const wordTimeMappingRaw =
          await FileSystem.readAsStringAsync(wordTimeMappingPath);
        const wordTimeMapping = JSON.parse(wordTimeMappingRaw);
        setWordTimeMapping(wordTimeMapping);
        console.log(wordTimeMapping);
      } catch (error) {
        console.error("Failed to fetch word time mapping", error);
      }
    };

    const fetchAudio = async () => {
      try {
        const audioPath =
          Platform.OS === "ios"
            ? `${path}/recording.wav`
            : `${path}/recording.m4a`;
        await soundRef.current.loadAsync(
          { uri: audioPath },
          { progressUpdateIntervalMillis: 500 } // Update every 0.5 seconds
        );
        setSound(soundRef.current);

        const status = await soundRef.current.getStatusAsync();
        setPlaybackStatus(status);
      } catch (error) {
        console.error("Failed to fetch audio", error);
      }
    };

    fetchTranscription();
    fetchWordTimeMapping();
    fetchAudio();

    return () => {
      soundRef.current.unloadAsync();
    };
  }, [path]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        sound.getStatusAsync().then(updateStatus);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isPlaying, playbackStatus]);

  const wordTimeMappingRef = useRef(wordTimeMapping);

  useEffect(() => {
    wordTimeMappingRef.current = wordTimeMapping;
  }, [wordTimeMapping]);

  const updateStatus = (status) => {
    setPlaybackStatus(status);
    setIsPlaying(status.isPlaying);

    if (status.isPlaying) {
      const currentTime = status.positionMillis / 1000;
      const segment = wordTimeMappingRef.current.find(
        (segment) =>
          currentTime >= segment.startTime && currentTime <= segment.endTime
      );
      if (segment) {
        setCurrentSegment(segment);
      } else {
        setCurrentSegment(null);
      }

      // Pause the playback if the end time is reached
      if (endTime && currentTime >= endTime) {
        handlePlayPause();
      }
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playFromPositionAsync(startTime * 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const handleBackButton = () => {
    navigation.goBack();
  };

  const renderTranscription = () => {
    return wordTimeMapping.map((segment, index) => (
      <Text
        key={index}
        style={[
          styles.transcriptionText,
          currentSegment === segment && styles.boldText,
        ]}
      >
        {segment.word.trim()}
      </Text>
    ));
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={handleBackButton}>
          <View style={styles.backButton}>
            <Back_icon height="20" width="20" fill="black" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.transcriptionContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {renderTranscription()}
        </ScrollView>
      </View>
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={handlePlayPause}>
          <View style={styles.controlButton}>
            {isPlaying ? (
              <PauseIcon height="30" width="30" fill="white" />
            ) : (
              <PlayIcon height="30" width="30" fill="white" />
            )}
          </View>
        </TouchableOpacity>
        <Slider
          value={playbackStatus.positionMillis || 0}
          minimumValue={0}
          maximumValue={playbackStatus.durationMillis || 1}
          onSlidingComplete={async (value) => {
            await sound.setPositionAsync(value);
            const status = await sound.getStatusAsync();
            setPlaybackStatus(status);
          }}
          minimumTrackTintColor="white"
          maximumTrackTintColor="lightgrey"
          thumbTintColor="white"
          onValueChange={(value) => {
            setPlaybackStatus((prevStatus) => ({
              ...prevStatus,
              positionMillis: value,
            }));
          }}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(playbackStatus.positionMillis || 0)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(playbackStatus.durationMillis || 1)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: "5%",
    paddingTop: "5%",
  },
  backButtonContainer: {
    position: "absolute",
    top: "5%",
    left: "5%",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  transcriptionContainer: {
    flex: 1,
    marginTop: "20%",
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  transcriptionText: {
    fontFamily: "IBMPlexMono-Regular",
    color: "lightgrey",
    fontSize: 16,
  },
  boldText: {
    fontFamily: "IBMPlexMono-SemiBold",
    color: "white",
  },
  controlButton: {
    borderRadius: 30,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  audioControls: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  controlText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  timeText: {
    color: "white",
  },
});

export default showTranscription