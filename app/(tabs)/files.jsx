import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";



const Files = () => {
  const [directories, setDirectories] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    listDirectories();
  }, []);

  const listDirectories = async () => {
    console.log("Listing directories: " + FileSystem.documentDirectory);
    try {
      const recordingsPath = FileSystem.documentDirectory + "recordings";
      const items = await FileSystem.readDirectoryAsync(recordingsPath);
      const dirs = [];

      for (const item of items) {
        const itemPath = `${recordingsPath}/${item}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath);

        if (itemInfo.isDirectory) {
          const metadataPath = `${itemPath}/metadata.json`;
          try {
            const metadataRaw = await FileSystem.readAsStringAsync(metadataPath);
            const metadata = JSON.parse(metadataRaw);

            dirs.push({
              name: item,
              path: itemPath,
              recordingLength: metadata.recordingLength,
              recordingDate: metadata.recordingDate,
            });
          } catch (readError) {
            console.error(`Failed to read metadata for ${item}:`, readError);
          }
        }
      }
      console.log("Directories in directory:", dirs);
      setDirectories(dirs);
    } catch (error) {
      console.error("Failed to list directories", error);
    }
  };

  const handleDirectoryClick = (path) => {
    navigation.navigate("file_details", { path });
    console.log(`Directory ${path} clicked`);
  };

  const deleteAllFiles = async () => {
    try {
      const recordingsPath = FileSystem.documentDirectory + "recordings";
      await FileSystem.deleteAsync(recordingsPath, { idempotent: true });
      console.log('All files in recordings directory have been deleted');
      listDirectories(); // Refresh the list of directories
    } catch (error) {
      console.error('Failed to delete files', error);
    }
  };

  useEffect(() => {
    listDirectories();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {directories.map((directory, index) => (
          <TouchableOpacity
            key={index}
            style={styles.buttonContainer}
            onPress={() => handleDirectoryClick(directory.path)}
          >
            <Text style={styles.heading}>{directory.name}</Text>
            <Text style={styles.metadata}>{directory.recordingLength}</Text>
            <Text style={styles.metadata}>{directory.recordingDate}</Text>
          </TouchableOpacity>
          
        ))}
        <TouchableOpacity onPress={deleteAllFiles}>
          <Text>Delete All Files</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: "5%",
    marginVertical: "10%",
  },
  buttonContainer: {
    margin: 10,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "black",
    padding: 15,
  },
  heading: {
    color: "white",
    textAlign: "left",
    fontFamily: "IBMPlexMono-Medium",
    fontSize: 18,
    marginBottom: 5,
  },
  metadata: {
    color: "grey",
    textAlign: "left",
    fontFamily: "IBMPlexMono-Medium",
  },
});

export default Files;
