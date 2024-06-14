import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const local_chat = () => {

    const {transcription} = useLocalSearchParams(); // imported transcription for you to setup chat

  return (
    <View>
      <Text>{transcription}</Text>
    </View>
  )
}

export default local_chat