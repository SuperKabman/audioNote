import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { Ionicons } from '@expo/vector-icons';
import JSZip from "jszip";

const Files = () => {
  const [directories, setDirectories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
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

  const handleLongPress = (directory) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(directory.path)) {
        return prevSelectedItems.filter(item => item !== directory.path);
      } else {
        return [...prevSelectedItems, directory.path];
      }
    });
  };

  const handleMenuDelete = async () => {
    for (const item of selectedItems) {
      try {
        await FileSystem.deleteAsync(item, { idempotent: true });
        console.log(`Deleted ${item}`);
      } catch (error) {
        console.error(`Failed to delete ${item}`, error);
      }
    }
    setSelectedItems([]);
    listDirectories(); // Refresh the list of directories
  };

  const handleMenuShare = async () => {
    try {
      const zip = new JSZip();

      for (const directoryPath of selectedItems) {
        const items = await FileSystem.readDirectoryAsync(directoryPath);
        for (const item of items) {
          if (item.endsWith('.m4a') || item.endsWith('.wav') || item === 'summary.txt') {
            const itemPath = `${directoryPath}/${item}`;
            const fileContent = await FileSystem.readAsStringAsync(itemPath, { encoding: FileSystem.EncodingType.Base64 });
            zip.file(item, fileContent, { base64: true });
          }
        }
      }

      const zipContent = await zip.generateAsync({ type: 'base64' });
      const tempZipPath = FileSystem.cacheDirectory + "sharedFiles.zip";
      await FileSystem.writeAsStringAsync(tempZipPath, zipContent, { encoding: FileSystem.EncodingType.Base64 });

      await Sharing.shareAsync(tempZipPath);

      // Cleanup
      await FileSystem.deleteAsync(tempZipPath, { idempotent: true });
    } catch (error) {
      console.error(`Failed to share files`, error);
    }
    setSelectedItems([]);
  };

  useEffect(() => {
    listDirectories();
  }, []);

  return (
    <MenuProvider>
      <SafeAreaView>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.menuContainer}>
              <Menu>
                <MenuTrigger>
                  <Ionicons name="ellipsis-vertical" size={32} color="black" />
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption onSelect={handleMenuDelete} text='Delete' />
                  <MenuOption onSelect={() => alert(`Rename`)} text='Rename' />
                  <MenuOption onSelect={handleMenuShare} text='Share' />
                </MenuOptions>
              </Menu>
            </View>
            {directories.map((directory, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.buttonContainer,
                  selectedItems.includes(directory.path) && styles.selectedButtonContainer
                ]}
                onPress={() => handleDirectoryClick(directory.path)}
                onLongPress={() => handleLongPress(directory)}
                delayLongPress={200}
              >
                <Text
                  style={[
                    styles.heading,
                    selectedItems.includes(directory.path) && styles.selectedText
                  ]}
                >
                  {directory.name}
                </Text>
                <Text
                  style={[
                    styles.metadata,
                    selectedItems.includes(directory.path) && styles.selectedText
                  ]}
                >
                  {directory.recordingLength}
                </Text>
                <Text
                  style={[
                    styles.metadata,
                    selectedItems.includes(directory.path) && styles.selectedText
                  ]}
                >
                  {directory.recordingDate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: "2%",
    marginVertical: "10%",
  },
  menuContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
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
  selectedButtonContainer: {
    backgroundColor: "grey",
    borderColor: "grey",
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
  selectedText: {
    color: "black",
  },
});

export default Files;
