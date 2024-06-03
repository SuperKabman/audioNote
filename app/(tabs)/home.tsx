// import { View, StyleSheet } from 'react-native';
// import React, { useEffect } from 'react';
// import Svg, { Path } from 'react-native-svg';
// import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

// const AnimatedPath = Animated.createAnimatedComponent(Path);

// const shapes = [
//   "M19.2,-21.6C25.7,-17.4,32.2,-12.1,32.9,-6.1C33.6,-0.1,28.3,6.6,23.7,12.9C19.2,19.2,15.2,25.1,9.7,27.6C4.1,30.1,-3.1,29.2,-9.8,26.8C-16.6,24.5,-22.9,20.7,-28.5,14.7C-34,8.7,-38.9,0.5,-39.1,-8.4C-39.3,-17.2,-34.9,-26.8,-27.6,-30.7C-20.3,-34.7,-10.1,-33.1,-1.9,-30.9C6.4,-28.6,12.7,-25.7,19.2,-21.6Z",
//   "M25.1,-30.4C29.7,-26.1,28.7,-15.5,28.3,-6.6C28,2.3,28.5,9.5,25.2,14C22,18.6,15.1,20.5,8.1,23.6C1.2,26.7,-5.8,31,-11.9,30C-18,29,-23.1,22.7,-26.4,15.8C-29.6,9,-31,1.6,-30,-5.5C-28.9,-12.6,-25.6,-19.5,-20.2,-23.7C-14.8,-27.8,-7.4,-29.3,1.4,-31C10.3,-32.7,20.5,-34.7,25.1,-30.4Z",
//   "M14,-21C16.7,-14.3,16.7,-8.6,17.8,-3C18.9,2.6,21.3,8.1,20,12.6C18.6,17,13.7,20.4,7.4,24.6C1.1,28.8,-6.5,33.8,-14.2,33.4C-21.9,33.1,-29.6,27.3,-31.6,20.1C-33.6,12.8,-30,4.1,-28.7,-5.4C-27.4,-14.8,-28.4,-25,-24.1,-31.4C-19.7,-37.8,-9.8,-40.5,-2.1,-37.9C5.6,-35.4,11.2,-27.7,14,-21Z",
//   "M23.8,-28.5C30.9,-22.5,36.5,-15,36.3,-7.7C36.1,-0.4,30,6.7,25,13.6C20,20.5,16.2,27.2,10.6,29.3C5.1,31.4,-2.3,28.8,-9.7,26.3C-17.1,23.7,-24.6,21.1,-27.1,16C-29.7,10.9,-27.4,3.2,-25.3,-3.8C-23.3,-10.8,-21.6,-17.3,-17.4,-23.8C-13.3,-30.3,-6.6,-37,0.9,-38C8.4,-39.1,16.8,-34.5,23.8,-28.5Z",
//   "M21.6,-25C28.9,-19.6,36.5,-13.7,37.2,-7C37.9,-0.3,31.7,7.3,26.8,15.1C21.8,22.9,18,31,11.6,34.4C5.3,37.7,-3.7,36.3,-12.5,33.5C-21.3,30.7,-29.9,26.5,-32.8,19.8C-35.6,13.1,-32.7,3.9,-29.4,-3.5C-26.1,-10.9,-22.4,-16.6,-17.4,-22.4C-12.4,-28.2,-6.2,-34.1,0.5,-34.6C7.1,-35.2,14.3,-30.3,21.6,-25Z"
// ];

// const Home: React.FC = () => {
//   const currentIndex = useSharedValue(0);

//   const animatedProps = useAnimatedProps(() => {
//     const interpolatedPath = shapes[currentIndex.value];
//     return {
//       d: interpolatedPath,
//     };
//   });

//   useEffect(() => {
//     const loopAnimation = () => {
//       currentIndex.value = withTiming(
//         (currentIndex.value + 1) % shapes.length,  // Cycle through the shapes
//         {
//           duration: 1000,
//           easing: Easing.linear,
//         },
//         () => {
//           loopAnimation();  // Continue the loop
//         }
//       );
//     };

//     loopAnimation();
//   }, [currentIndex]);

//   return (
//     <View style={styles.container}>
//       <Svg height="200" width="400">
//         <AnimatedPath
//           animatedProps={animatedProps}
//           fill="black"
//           stroke="black"
//           strokeWidth="0"
//         />
//       </Svg>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default Home;


import { View, Text } from 'react-native'
import React from 'react'

const home = () => {
  return (
    <View>
      <Text>home</Text>
    </View>
  )
}

export default home