import { Platform } from 'react-native';

export const fontFamily = {
  regular: 'OpenSauceOne-Regular',
  medium: 'OpenSauceOne-Medium',
  semiBold: 'OpenSauceOne-SemiBold',
  bold: 'OpenSauceOne-Bold',
} as const;

// System-font fallback used in fontFamily values when Open Sauce One hasn't loaded
const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  h1: { fontSize: 24, fontFamily: fontFamily.bold },
  h2: { fontSize: 15, fontFamily: fontFamily.semiBold },
  h3: { fontSize: 15, fontFamily: fontFamily.semiBold },
  bodyLarge: { fontSize: 16, fontFamily: fontFamily.regular },
  bodySmall: { fontSize: 14, fontFamily: fontFamily.regular },
  label: { fontSize: 12, fontFamily: fontFamily.medium },
} as const;

export const fontFiles = {
  'OpenSauceOne-Regular': require('../assets/fonts/OpenSauceOne-Regular.ttf'),
  'OpenSauceOne-Medium': require('../assets/fonts/OpenSauceOne-Medium.ttf'),
  'OpenSauceOne-SemiBold': require('../assets/fonts/OpenSauceOne-SemiBold.ttf'),
  'OpenSauceOne-Bold': require('../assets/fonts/OpenSauceOne-Bold.ttf'),
} as const;
