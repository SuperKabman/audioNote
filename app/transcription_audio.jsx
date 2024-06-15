import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'  
import { ScrollView } from 'react-native'

const transcription_audio = () => {
    const {transcription} = useLocalSearchParams(); 
    return (
      <View style={{ flex: 1, marginHorizontal: "5%", marginTop: "15%"}}>
          <Text
            style={{
              fontFamily: "IBMPlexMono-SemiBold",
              color: "black",
              fontSize: 30,
              textAlign: "center",
              marginBottom: "0%",
              top:'-5%'
            }}
          >
            Transcription Audio Playback
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            
              
                <Text style = {{fontFamily: "IBMPlexMono-Regular",
              color: "grey",
              fontSize: 16,
              textAlign: "center",
              top:'0%'}}>
                  {transcription}
                </Text>
              
            
          </ScrollView>
        </View>
    )
  }

export default transcription_audio

const styles = StyleSheet.create({})