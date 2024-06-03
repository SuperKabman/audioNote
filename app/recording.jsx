import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  button: {
    width: 90,
    height: 90,
    margin: 40,
  },
});

const Recording = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity >
        <Image
          style={styles.button}
          source={require('../assets/images/startButton.png')}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image
          style={styles.button}
          source={require('../assets/images/stopButton.png')}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Recording;