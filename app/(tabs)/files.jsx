import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as FileSystem from 'expo-file-system'
import { useNavigation } from '@react-navigation/native'

const Files = () => {
  const [directories, setDirectories] = useState([]);
  const navigation = useNavigation();

  const listDirectories = async () => {
    try {
      const items = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'recordings');
      const dirs = [];

      for (const item of items) {
        const itemPath = `${FileSystem.documentDirectory}recordings/${item}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath);

        if (itemInfo.isDirectory) {
          dirs.push(item);
        }
      }

      console.log("Directories in directory:", dirs);
      setDirectories(dirs);
    } catch (error) {
      console.error("Failed to list directories", error);
    }
  };

  const handleDirectoryClick = (directory) => {
    navigation.navigate('file_details');
    console.log(`Directory ${directory} clicked`);
  };

  useEffect(() => {
    listDirectories();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {directories.map((directory, index) => (
          <TouchableOpacity key={index} style={styles.buttonContainer} onPress={() => handleDirectoryClick(directory)}>
            <Text style={styles.buttonText}>{directory}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: "5%",
    marginVertical: "10%"
  },
  buttonContainer: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'black',
    padding: 10
  },
  buttonText: {
    color: 'white',
    textAlign: 'left',
    fontFamily: 'IBMPlexMono-Medium'
  }
});

export default Files;