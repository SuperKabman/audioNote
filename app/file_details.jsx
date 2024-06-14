import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import FileSystem from 'expo-file-system'
import { TouchableOpacity } from 'react-native';
// the directory contains the following files: 
//transcription.txt
//audio.mp3
//word_time_mapping.json
//summary.txt
//metadata.txt

const FileDetails = ({ route }) => {
  console.log(route.parms.dir);
  const { path } = route.params;

  const [transcription, setTranscription] = useState("");
  const [wordTimeMapping, setWordTimeMapping] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const transcriptionPath = `${path}/transcription.txt`;
        const transcriptionRaw = await FileSystem.readAsStringAsync(transcriptionPath);
        setTranscription(transcriptionRaw);
      } catch (error) {
        console.error("Failed to fetch transcription", error);
      }
    };

    const fetchWordTimeMapping = async () => {
      try {
        const wordTimeMappingPath = `${path}/word_time_mapping.json`;
        const wordTimeMappingRaw = await FileSystem.readAsStringAsync(wordTimeMappingPath);
        setWordTimeMapping(wordTimeMappingRaw);
      } catch (error) {
        console.error("Failed to fetch word time mapping", error);
      }
    };

    const fetchSummary = async () => {
      try {
        const summaryPath = `${path}/summary.txt`;
        const summaryRaw = await FileSystem.readAsStringAsync(summaryPath);
        setSummary(summaryRaw);
      } catch (error) {
        console.error("Failed to fetch summary", error);
      }
    };

    fetchTranscription();
    fetchWordTimeMapping();
    fetchSummary();
  }, [path]); // Ensure useEffect runs when 'path' changes

  const handleSentenceClick = (sentence) => {
    console.log(`Sentence clicked: ${sentence}`);
    // Add your functionality here
  };

  const handleSentenceLongPress = (sentence) => {
    console.log(`Sentence long pressed: ${sentence}`);
    // Add your functionality here
  };

  return (
    <View>
      {summary.split(".").map((sentence, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleSentenceClick(sentence)}
          onLongPress={() => handleSentenceLongPress(sentence)}
          delayLongPress={1000}
        >
          <Text>{sentence}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FileDetails;
