import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const Waveform = ({ waveform }) => {
  const height = 100;
  const width = 300;
  const dataset = waveform.slice(-40); 
  const barWidth = width / dataset.length; 

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        {dataset.map((value, index) => {
          const barHeight = (value / 100) * height;
          return (
            <Rect
              key={index}
              x={(index * (barWidth))} 
              y={(height - barHeight) / 2}
              width={barWidth}
              height={barHeight}
              fill="black"
              stroke="black"
              strokeWidth="1"
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: "20%",
  },
});

export default Waveform;