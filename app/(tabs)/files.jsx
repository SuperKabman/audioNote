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

  const listDirectories = async () => {
    try {
      const items = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "recordings"
      );
      const dirs = [];

      for (const item of items) {
        const itemPath = `${FileSystem.documentDirectory}recordings/${item}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath);

        if (itemInfo.isDirectory) {
          const metadataPath = `${itemPath}/metadata.json`;
          const metadataRaw = await FileSystem.readAsStringAsync(metadataPath);
          const metadata = JSON.parse(metadataRaw);

          dirs.push({
            name: item,
            path: itemPath,
            recordingLength: metadata.recordingLength,
            recordingDate: metadata.recordingDate,
          });
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
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "black",
    padding: 10,
  },
  heading: {
    color: "white",
    textAlign: "left",
    fontFamily: "IBMPlexMono-Medium",
  },
  metadata: {
    color: "white",
    textAlign: "left",
    fontFamily: "IBMPlexMono-Medium",
  },
});

export default Files;
