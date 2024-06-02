import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import 'nativewind'

const Home = () => {
  return (
    <View>
      <Link href= '/recording' className='items-center justify-center'>Recording</Link>
    </View>
  )
}

export default Home