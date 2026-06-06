import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';

type Props = {
  tripName: string;
  onBack: () => void;
  onImageCaptured: (uri: string) => void;
};

export default function ScanReceiptScreen({ tripName, onBack, onImageCaptured }: Props) {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<'launching' | 'denied' | 'idle'>('launching');

  useEffect(() => {
    launchCamera();
  }, []);

  async function launchCamera() {
    setStatus('launching');

    // On web, fall back to photo library (no camera API)
    const launcher =
      Platform.OS === 'web'
        ? ImagePicker.launchImageLibraryAsync
        : ImagePicker.launchCameraAsync;

    // Request permission first
    const { status: perm } =
      Platform.OS === 'web'
        ? { status: 'granted' }
        : await ImagePicker.requestCameraPermissionsAsync();

    if (perm !== 'granted') {
      setStatus('denied');
      return;
    }

    const result = await launcher({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImageCaptured(result.assets[0].uri);
    } else {
      // User cancelled — go back
      onBack();
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{tripName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        {status === 'launching' && (
          <>
            <ActivityIndicator size="large" color={colors.brandOrange} />
            <Text style={styles.hint}>Opening camera…</Text>
          </>
        )}

        {status === 'denied' && (
          <>
            <Ionicons name="camera-outline" size={56} color={`${colors.dark}30`} />
            <Text style={styles.deniedTitle}>Camera access needed</Text>
            <Text style={styles.deniedBody}>
              Go to Settings › TripUp and enable Camera to scan receipts.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={launchCamera} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  hint: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.45,
  },
  deniedTitle: {
    ...typography.h2,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    textAlign: 'center',
  },
  deniedBody: {
    ...typography.bodyLarge,
    color: colors.dark,
    opacity: 0.45,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryBtn: {
    backgroundColor: colors.brandOrange,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  retryBtnText: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.white,
  },
});
