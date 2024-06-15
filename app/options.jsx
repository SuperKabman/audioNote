import { View, Text } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native'

const options = () => {
  return (
    <View style={{ flex: 1, marginHorizontal: "5%", marginTop: "15%"}}>
        <Text
          style={{
            fontFamily: "IBMPlexMono-SemiBold",
            color: "black",
            fontSize: 30,
            textAlign: "center",
            marginBottom: "0%",
            top:'2%'
          }}
        >
          Recording Options
        </Text>
      
      </View>
  )
}

export default options