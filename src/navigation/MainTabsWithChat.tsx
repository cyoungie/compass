import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import ChatModal from '../components/ChatModal';
import HomeScreen from '../screens/main/HomeScreen';
import MentalScreen from '../screens/main/MentalScreen';
import ResourcesScreen from '../screens/main/ResourcesScreen';
import CommunityScreen from '../screens/main/CommunityScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_WIDTH = 300;
const TAB_BAR_ICON_SIZE = 15;

function TabBarCentered(props: React.ComponentProps<typeof BottomTabBar>) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarInner}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.glassOverlay} />
        <BottomTabBar {...props} style={[props.style, styles.tabBarGlass]} />
      </View>
    </View>
  );
}

function DashboardHeaderRight() {
  const { user } = useProfile();
  const firstName = user?.form?.name?.trim()?.split(/\s+/)[0] || user?.form?.name?.trim() || '?';
  const initial = (firstName[0] || '?').toUpperCase();

  return (
    <View style={styles.headerRight}>
      <TouchableOpacity
        onPress={() => {}}
        style={styles.headerIconButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="notifications-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>{initial}</Text>
      </View>
    </View>
  );
}

export default function MainTabsWithChat() {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <View style={styles.wrapper}      >
        <Tab.Navigator
        tabBar={TabBarCentered}
        screenOptions={{
          headerStyle: { backgroundColor: '#E68D33' },
          headerTintColor: '#ffffff',
          headerTitleAlign: 'left',
          tabBarStyle: {
            height: 64,
            borderRadius: 24,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.25)',
            shadowColor: 'rgba(0, 0, 0, 0.15)',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 32,
            elevation: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#E68D33',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIconStyle: { marginBottom: -2 },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'COMPASS',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <Ionicons name="compass-outline" size={TAB_BAR_ICON_SIZE} color={color} />
            ),
            headerTitleStyle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5, color: '#ffffff' },
            headerRight: () => (
              <DashboardHeaderRight />
            ),
          }}
        />
        <Tab.Screen
          name="Resources"
          component={ResourcesScreen}
          options={{
            tabBarLabel: 'Resources',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={TAB_BAR_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Mental"
          component={MentalScreen}
          options={{
            tabBarLabel: 'Mental check-in',
            tabBarIcon: ({ color }) => (
              <Ionicons name="leaf-outline" size={TAB_BAR_ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            tabBarLabel: 'Community',
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-outline" size={TAB_BAR_ICON_SIZE} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setChatVisible(true)}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>
      <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarInner: {
    width: TAB_BAR_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  tabBarGlass: {
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  headerIconButton: {
    marginRight: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E68D33',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E68D33',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: { fontSize: 24 },
});
