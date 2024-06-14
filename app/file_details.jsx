import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Back_icon from "../assets/images/caret-left-solid.svg";
import Ai_icon from "../assets/images/robot-solid.svg";
import axios from "axios";
import { LOCAL_IP_ADDRESS } from "../keys/config";

const FileDetails = () => {
  const { path, file_name } = useLocalSearchParams();

  const [transcription, setTranscription] = useState("");
  const [wordTimeMapping, setWordTimeMapping] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedSentence, setSelectedSentence] = useState(null);
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const transcriptionPath = `${path}/transcription.txt`;
        const transcriptionRaw = await FileSystem.readAsStringAsync(transcriptionPath);
        setTranscription(transcriptionRaw);
        console.log("transcription fetched");
      } catch (error) {
        console.error("Failed to fetch transcription", error);
      }
    };

    const fetchWordTimeMapping = async () => {
      try {
        const wordTimeMappingPath = `${path}/word_time_mapping.json`;
        const wordTimeMappingRaw = await FileSystem.readAsStringAsync(wordTimeMappingPath);
        setWordTimeMapping(wordTimeMappingRaw);
        console.log("word time mapping fetched");
      } catch (error) {
        console.error("Failed to fetch word time mapping", error);
      }
    };

    const fetchSummary = async () => {
      try {
        const summaryPath = `${path}/summary.txt`;
        const summaryRaw = await FileSystem.readAsStringAsync(summaryPath);
        setSummary(summaryRaw);
        console.log("summary fetched");
      } catch (error) {
        console.error("Failed to fetch summary", error);
      }
    };

    fetchTranscription();
    fetchWordTimeMapping();
    fetchSummary();
  }, [path]);

  const handleSentenceClick = (sentence) => {
    console.log(`Sentence clicked: ${sentence}`);
    setSelectedSentence(sentence);
    setTimeout(() => {
      setSelectedSentence(null);
    }, 1200);
  };

  const handleSentenceLongPress = async (sentence) => {
    console.log(`Sentence long pressed: ${sentence}`);

    const requestData = {
      summaryLine: sentence,
      transcription: transcription,
    };
  
    try {
      const response = await axios.post(
        `http://${LOCAL_IP_ADDRESS}:8080/find-summary-line`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const targetSentence = response.data.matchingSentence;
      console.log("target sentence: \n", targetSentence);

      router.push({
        pathname: "showTranscription",
        params: { targetSentence: targetSentence},
      });
    }
    catch (error) {
      console.error("Failed to fetch summary line", error);
    }
  };

  const handleBackButton = () => {
    console.log("Back button clicked");
    navigation.navigate("files");
  };

  const handleAiButton = () => {
    console.log("AI button clicked");
    router.push({
      pathname: "local_chat",
      params: { transcription: transcription}
    });
  };

  const sentenceStyle = (sentence) => {
    return {
      fontFamily: selectedSentence === sentence ? "IBMPlexMono-SemiBold" : "IBMPlexMono-Regular",
      fontSize: 17,
      color: selectedSentence === sentence ? "black" : "grey",
      textAlign: "left",
    };
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ position: "absolute", top: "5%", left: "5%" }}>
        <TouchableOpacity onPress={handleBackButton}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "black",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Back_icon height="20" width="20" fill="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, marginHorizontal: "5%", marginTop: "15%"}}>
        <Text
          style={{
            fontFamily: "IBMPlexMono-SemiBold",
            color: "black",
            fontSize: 30,
            textAlign: "center",
            marginBottom: "7%",
          }}
        >
          {file_name}
        </Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {summary.split(".").map((sentence, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSentenceClick(sentence)}
              onLongPress={() => handleSentenceLongPress(sentence)}
              delayLongPress={300}
            >
              <Text
                style={sentenceStyle(sentence)}
              >
                {sentence.trim()}.{" "}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={handleAiButton}>
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "black",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ai_icon height="40" width="40" fill="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FileDetails;
