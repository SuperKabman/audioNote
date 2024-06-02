import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const home = () => {
  return (
    <View>
      <Link href= '/recording'>Recording</Link>
    </View>
  )
}

export default home