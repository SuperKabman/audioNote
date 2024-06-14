import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const RenameModal = ({ visible, onClose, onSave, currentName }) => {
  const [newName, setNewName] = useState(currentName);

  const handleSave = () => {
    onSave(newName);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rename File</Text>
          <TextInput
            style={styles.textInput}
            value={newName}
            onChangeText={setNewName}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "black",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "IBMPlexMono-SemiBold",
    fontSize: 18,
    marginBottom: 10,
    color: "white",
  },
  textInput: {
    fontFamily: "IBMPlexMono-Regular",
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    paddingHorizontal: 5,
    paddingVertical: 10,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: "IBMPlexMono-Medium",
    fontSize: 16,
    color: "black",
  },
});

export default RenameModal;
