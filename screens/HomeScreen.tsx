import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import BrandingLogo from '../assets/Logo/Branding-logo.svg';
import AvatarStack from '../components/AvatarStack';
import NotificationsSheet from '../components/NotificationsSheet';
import { mockTrip, Traveller } from '../data/trips';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const COLLAPSE_HEIGHT_ESTIMATE = 90;

type TripCard = {
  id: string;
  name: string;
  dateRange: string;
  imageUri: string | number;
  travellers: Traveller[];
  isCurrent: boolean;
};

const TRIP_CARDS: TripCard[] = [
  {
    id: '1',
    name: 'Lisbon Group',
    dateRange: 'Jun 02 – 09',
    imageUri: require('../assets/Images/Lisbon shot.jpg'),
    travellers: mockTrip.travellers,
    isCurrent: true,
  },
  {
    id: '2',
    name: 'Globe Trotters',
    dateRange: 'Nov 16 – Jun 16',
    imageUri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    travellers: [
      { id: 'g1', initials: 'AM', color: colors.tertiaryBlue },
      { id: 'g2', initials: 'SC', color: colors.tertiaryPink },
      { id: 'g3', initials: 'TW', color: colors.tertiaryPurple },
      { id: 'g4', initials: 'RK', color: colors.tertiaryGreen },
    ],
    isCurrent: false,
  },
  {
    id: '3',
    name: 'Tokyo Nights',
    dateRange: 'Mar 10 – 18',
    imageUri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    travellers: [
      { id: 't1', initials: 'JP', color: colors.tertiaryPurple },
      { id: 't2', initials: 'MK', color: colors.brandOrange },
      { id: 't3', initials: 'HS', color: colors.tertiaryBlue },
    ],
    isCurrent: false,
  },
];

const currentTrips = TRIP_CARDS.filter((t) => t.isCurrent);
const upcomingTrips = TRIP_CARDS.filter((t) => !t.isCurrent);

type Props = {
  onTripPress: (tripId: string) => void;
};

function TripCard({ card, onPress }: { card: TripCard; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.cardInner}>
        <ImageBackground
          source={typeof card.imageUri === 'number' ? card.imageUri : { uri: card.imageUri }}
          style={styles.cardImage}
          imageStyle={{ borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}
          resizeMode="cover"
        />
        <View style={styles.cardBody}>
          <View style={styles.cardBodyLeft}>
            <Text style={styles.cardTitle}>{card.name}</Text>
            <Text style={styles.cardDate}>{card.dateRange}</Text>
          </View>
          <AvatarStack avatars={card.travellers} size={26} overlap={8} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ onTripPress }: Props) {
  const insets = useSafeAreaInsets();
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Collapsing header animations — same pattern as GroupHomeScreen
  const scrollY = useRef(new Animated.Value(0)).current;
  const [collapseHeight, setCollapseHeight] = useState(COLLAPSE_HEIGHT_ESTIMATE);
  const collapseHeightMeasured = useRef(false);
  const CH = collapseHeight;

  const collapsingHeightAnim = scrollY.interpolate({
    inputRange: [0, CH],
    outputRange: [CH, 0],
    extrapolate: 'clamp',
  });
  const collapsingOpacity = scrollY.interpolate({
    inputRange: [0, CH * 0.7],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const logoOpacity = scrollY.interpolate({
    inputRange: [CH * 0.3, CH * 0.85],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [CH * 0.3, CH * 0.85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const onScrollEvent = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Fixed header with logo ↔ "Home" crossfade */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <View style={styles.headerCenter}>
          <Animated.View style={[styles.headerCenterItem, { opacity: logoOpacity }]}>
            <BrandingLogo width={80} height={28} />
          </Animated.View>
          <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]}>
            Home
          </Animated.Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setNotificationsVisible(true)}>
          <Ionicons name="notifications-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Collapsing greeting row */}
      <Animated.View style={{ height: collapsingHeightAnim, overflow: 'hidden', opacity: collapsingOpacity }}>
        <View
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (!collapseHeightMeasured.current && h > 0) {
              collapseHeightMeasured.current = true;
              setCollapseHeight(h);
            }
          }}
        >
          <View style={styles.greetingRow}>
            <View style={styles.ariAvatar}>
              <Text style={styles.ariAvatarText}>AR</Text>
            </View>
            <View style={styles.greetingText}>
              <Text style={styles.greetingLine}>Welcome Back,</Text>
              <Text style={styles.greetingName}>Ari</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { minHeight: SCREEN_HEIGHT + COLLAPSE_HEIGHT_ESTIMATE }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScrollEvent}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionHeader}>Current Trips</Text>
        {currentTrips.map((card) => (
          <TripCard key={card.id} card={card} onPress={() => onTripPress(card.id)} />
        ))}

        <Text style={styles.sectionHeader}>Upcoming Trips</Text>
        {upcomingTrips.map((card) => (
          <TripCard key={card.id} card={card} onPress={() => {}} />
        ))}
      </Animated.ScrollView>

      <NotificationsSheet
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        notifications={[]}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  headerCenterItem: {
    position: 'absolute',
  },
  headerTitle: {
    ...typography.h3,
    fontFamily: 'OpenSauceOne-SemiBold',
    color: colors.dark,
    textAlign: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 12,
  },
  ariAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brandOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ariAvatarText: {
    ...typography.h2,
    color: colors.white,
    fontFamily: 'OpenSauceOne-Bold',
  },
  greetingText: {
    flex: 1,
  },
  greetingLine: {
    ...typography.bodyLarge,
    color: colors.dark,
  },
  greetingName: {
    ...typography.h1,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-Bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  sectionHeader: {
    ...typography.h2,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-Bold',
    marginBottom: spacing.sm,
    marginTop: 4,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  cardInner: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  cardImage: {
    height: 200,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: 10,
    paddingBottom: 14,
    gap: spacing.sm,
  },
  cardBodyLeft: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.dark,
    fontFamily: 'OpenSauceOne-Bold',
  },
  cardDate: {
    ...typography.bodySmall,
    color: colors.dark,
    opacity: 0.5,
  },
});
