import React, { useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import HomeScreen from './HomeScreen';
import GroupHomeScreen from './GroupHomeScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeStack() {
  const position = useRef(new Animated.Value(0)).current; // 0 = home, 1 = trip

  const homeTranslateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH],
  });
  const tripTranslateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH, 0],
  });

  function slideToTrip() {
    Animated.timing(position, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function slideToHome() {
    Animated.timing(position, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: homeTranslateX }] }]}>
        <HomeScreen onTripPress={slideToTrip} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: tripTranslateX }] }]}>
        <GroupHomeScreen onBack={slideToHome} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
