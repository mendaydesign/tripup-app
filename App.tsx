import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { fontFiles, colors } from './theme';
import TabNavigator from './navigation/TabNavigator';

enableScreens();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontFiles);

  // Block render until fonts load (or fail); fallback to system font on error
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <View style={styles.phone}>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    // On web: centre the phone column; on native: just fill the screen
    ...(Platform.OS === 'web'
      ? { alignItems: 'center', justifyContent: 'center' }
      : {}),
  },
  phone: {
    flex: 1,
    backgroundColor: colors.white,
    // Constrain to phone width on web so it looks like a mobile device
    ...(Platform.OS === 'web'
      ? {
          width: 390,
          maxWidth: 390,
          // Keep the phone column from filling the full browser height on wide screens
          alignSelf: 'center',
        }
      : {}),
    overflow: 'hidden',
  },
});
