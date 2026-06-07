import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, typography } from '../theme';
import HomeStack from '../screens/HomeStack';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';

import HomeActive from '../assets/Icons/Home=Active.svg';
import HomeInactive from '../assets/Icons/Home=Inactive.svg';
import ExploreActive from '../assets/Icons/Explore=Active.svg';
import ExploreInactive from '../assets/Icons/Explore=Inactive.svg';
import ProfileActive from '../assets/Icons/Profile=Active.svg';
import ProfileInactive from '../assets/Icons/Profile=Inactive.svg';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { Active: React.FC<any>; Inactive: React.FC<any> }> = {
  Home: { Active: HomeActive, Inactive: HomeInactive },
  Explore: { Active: ExploreActive, Inactive: ExploreInactive },
  Profile: { Active: ProfileActive, Inactive: ProfileInactive },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          const Icon = focused ? icons.Active : icons.Inactive;
          return <Icon width={26} height={26} />;
        },
        tabBarLabel: route.name,
        tabBarLabelStyle: {
          ...typography.label,
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: `${colors.dark}18`,
          borderTopWidth: 1,
          height: 94,
          paddingTop: 8,
          paddingBottom: 36,
        },
        tabBarActiveTintColor: colors.brandOrange,
        tabBarInactiveTintColor: `${colors.dark}70`,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
