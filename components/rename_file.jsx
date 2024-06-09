import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';

const RenameModal = ({ visible, onClose, onSave, fileUri }) => {
  const [newFileName, setNewFileName] = useState('');

  const ensureDirExists = async (dir) => {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      console.log('Directory does not exist, creating...');
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  };

  const handleSave = async () => {
    const fileExtension = fileUri.split('.').pop();
    const newFileUri = `${FileSystem.documentDirectory}${newFileName}.${fileExtension}`;
    
    try {
        await ensureDirExists(newFileUri);
  
        await FileSystem.moveAsync({
          from: fileUri,
          to: newFileUri,
        });
        onSave(newFileUri);
      } catch (error) {
        console.error('Failed to rename file:', error);
        Alert.alert('Error', 'Failed to rename the file.');
      }
    };
  

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Rename Recording</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new file name"
            value={newFileName}
            onChangeText={setNewFileName}
          />
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
});

export default RenameModal;
