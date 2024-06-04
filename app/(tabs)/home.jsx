import { View, Text, Alert } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import 'nativewind'
import useStartRecording from '@/components/startRecording.jsx'

const RecordingLink = ({ startRecording, ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    startRecording();
  };

  return <Link {...props} onClick={handleClick} />;
};

const Home = () => {
  

  return (
    
    
    <View>
      {console.log('recording started')}
      <RecordingLink href='/recording' onClick={useStartRecording()} className='items-center justify-center'>Recording</RecordingLink>
      {console.log('recording stopped')}
    </View>
    
  )
}

export default Home