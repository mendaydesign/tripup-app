import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏠</Text>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.sub}>Your trips overview lives here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.5,
    textAlign: 'center',
  },
});
