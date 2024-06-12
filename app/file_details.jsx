import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import FileSystem from 'expo-file-system'
import { TouchableOpacity } from 'react-native';

// the directory contains the following files: 
//transcription.txt
//audio.mp3
//word_time_mapping.json
//summary.txt
//metadata.txt

const file_details = ({route}) => {
  const { directory } = route.params;

  const [transcription, setTranscription] = useState("");
  const [wordTimeMapping, setWordTimeMapping] = useState("");
  const [summary, setSummary] = useState("");


  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const transcriptionPath = `${directory}/transcription.txt`;
        const transcriptionRaw = await FileSystem.readAsStringAsync(transcriptionPath);
        setTranscription(transcriptionRaw);
      }
      catch (error) {
        console.error("Failed to fetch transcription", error);
      }
    }

    const fetchWordTimeMapping = async () => {
      try {
        const wordTimeMappingPath = `${directory}/word_time_mapping.json`;
        const wordTimeMappingRaw = await FileSystem.readAsStringAsync(wordTimeMappingPath);
        setWordTimeMapping(wordTimeMappingRaw);
      }
      catch (error) {
        console.error("Failed to fetch word time mapping", error);
      }
    }

    const fetchSummary = async () => {
      try {
        const summaryPath = `${directory}/summary.txt`;
        const summaryRaw = await FileSystem.readAsStringAsync(summaryPath);
        setSummary(summaryRaw);
      }
      catch (error) {
        console.error("Failed to fetch summary", error);
      }
    }

  }, [directory]);

  const handleSentenceClick = (sentence) => {
    console.log(`Sentence clicked: ${sentence}`);
  }

  const handleScentenceLongPress = (sentence) => {
    console.log(`Sentence long pressed: ${sentence}`);
  }

  return (
    <View>
      {summary.split(".").map((sentence, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => handleSentenceClick(sentence)} // highlight the scentence when clicked
          onLongPress={() => handleScentenceLongPress(sentence)} // go to the audio file and play the sentence
          delayLongPress={1000} // 1 second delay for long press
        >
          <Text>{sentence}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default file_details