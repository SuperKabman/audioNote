import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Svg, { Rect } from "react-native-svg";

const Waveform = ({ waveform }) => {
  const height = 100;
  const width = 300;
  const gap = 2; // Set the gap between bars
  const dataset = waveform.slice(-40);
  const barWidth = (width - gap * (dataset.length - 1)) / dataset.length;
  const borderRadius = 5;

  // Initialize animated values for each bar
  const animatedValues = useRef(dataset.map(() => new Animated.Value(0))).current;

  // Animate the bars when the dataset changes
  useEffect(() => {
    const animations = dataset.map((value, index) => {
      const barHeight = (value / 100) * height;
      return Animated.timing(animatedValues[index], {
        toValue: barHeight,
        duration: 500,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [dataset]);

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        {dataset.map((value, index) => (
          <AnimatedRect
            key={index}
            x={index * (barWidth + gap)} // Adjust x position to add gap
            y={animatedValues[index].interpolate({
              inputRange: [0, height],
              outputRange: [height / 2, 0],
            })}
            width={barWidth}
            height={animatedValues[index]}
            fill="#DADADA"
            stroke="#DADADA"
            strokeWidth="1"
            rx={borderRadius}
            ry={borderRadius}
          />
        ))}
      </Svg>
    </View>
  );
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: "20%",
  },
});

export default Waveform;
