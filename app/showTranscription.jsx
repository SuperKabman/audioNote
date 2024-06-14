import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const showTranscription = () => {
    const {targetSentence} = useLocalSearchParams(); 
  return (
    <View>
      <Text>{targetSentence}</Text>
    </View>
  )
}

export default showTranscription