import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Reset from "../assets/images/resetButtonSVG.svg";

const App = () => {
  const [language, setLanguage] = React.useState('English');
  const [conversationType, setConversationType] = React.useState('Casual');
  const [translation, setTranslation] = React.useState('None');
  const [summarySize, setSummarySize] = React.useState('Brief');
  const [openLanguage, setOpenLanguage] = React.useState(false);
  const [openConversationType, setOpenConversationType] = React.useState(false);
  const [openTranslation, setOpenTranslation] = React.useState(false);
  const [openSummarySize, setOpenSummarySize] = React.useState(false);

  const isNextInvisible = (index) => {
    if (index === 0) return openLanguage;
    if (index === 1) return openConversationType;
    if (index === 2) return openTranslation;
    if (index === 3) return openSummarySize;
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Reset style={styles.resetIcon} />
      </View>

      <View style={styles.settingContainer}>
        <Text style={styles.label}>Conversation{'\n'}Language</Text>
        <DropDownPicker
          open={openLanguage}
          value={language}
          items={[
            { label: 'English', value: 'English' },
            { label: 'Spanish', value: 'Spanish' },
          ]}
          setOpen={setOpenLanguage}
          setValue={setLanguage}
          containerStyle={styles.pickerContainer}
          style={styles.picker}
          textStyle={styles.pickerText}
          zIndex={4000} 
          zIndexInverse={1000}
        />
      </View>

      <View style={[styles.settingContainer, isNextInvisible(0) && styles.invisible]}>
        <Text style={styles.label}>Conversation{'\n'}Type</Text>
        <DropDownPicker
          open={openConversationType}
          value={conversationType}
          items={[
            { label: 'Casual', value: 'Casual' },
            { label: 'Formal', value: 'Formal' },
          ]}
          setOpen={setOpenConversationType}
          setValue={setConversationType}
          containerStyle={styles.pickerContainer}
          style={styles.picker}
          textStyle={styles.pickerText}
          zIndex={3000} 
          zIndexInverse={2000}
        />
      </View>

      <View style={[styles.settingContainer, isNextInvisible(1) && styles.invisible]}>
        <Text style={styles.label}>Translate{'\n'}Conversation to</Text>
        <DropDownPicker
          open={openTranslation}
          value={translation}
          items={[
            { label: 'None', value: 'None' },
            { label: 'Spanish', value: 'Spanish' },
          ]}
          setOpen={setOpenTranslation}
          setValue={setTranslation}
          containerStyle={styles.pickerContainer}
          style={styles.picker}
          textStyle={styles.pickerText}
          zIndex={2000} 
          zIndexInverse={3000}
        />
      </View>

      <View style={[styles.settingContainer, isNextInvisible(2) && styles.invisible]}>
        <Text style={styles.label}>Summary Size{'\n'}& Depth</Text>
        <DropDownPicker
          open={openSummarySize}
          value={summarySize}
          items={[
            { label: 'Brief', value: 'Brief' },
            { label: 'Detailed', value: 'Detailed' },
          ]}
          setOpen={setOpenSummarySize}
          setValue={setSummarySize}
          containerStyle={styles.pickerContainer}
          style={styles.picker}
          textStyle={styles.pickerText}
          zIndex={1000} 
          zIndexInverse={4000}
        />
      </View>

      <Text style={[styles.summaryText, isNextInvisible(3) && styles.invisible]}>Custom Summary Prompt</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        placeholder=""
      />

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    top: 20,
  },
  resetText: {
    color: '#fff',
    fontFamily: 'IBMPlexMono-Medium',
  },
  settingContainer: {
    marginBottom: 10,
  },
  label: {
    color: '#fff',
    fontFamily: 'IBMPlexMono-Medium',
    marginBottom: 6,
    top: '50%',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#D3D3D3',
    borderRadius: 20,
    width: '40%',
    left: '60%',
  },
  picker: {
    backgroundColor: '#D3D3D3',
    borderRadius: 20,
    zIndex: 5000, 
  },
  pickerText: {
    color: '#000',
    fontFamily: 'IBMPlexMono-Medium',
  },
  textInput: {
    backgroundColor: '#D3D3D3',
    color: '#000',
    fontFamily: 'IBMPlexMono-Medium',
    padding: 10,
    borderRadius: 20,
    height: 100,
    marginBottom: 20,
    top: '5%',
    width: '80%',
    left: '10%',
  },
  saveButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    top: '8%',
    width: '70%',
    left: '14%',
  },
  saveButtonText: {
    color: '#000',
    fontFamily: 'IBMPlexMono-Medium',
  },
  summaryText: {
    color: '#fff',
    fontFamily: 'IBMPlexMono-Medium',
    marginBottom: 6,
    top: '4%',
    left: '21%',
    fontSize: 16,
  },
  invisible: {
    
    left:'300%',
  }
});

export default App;
