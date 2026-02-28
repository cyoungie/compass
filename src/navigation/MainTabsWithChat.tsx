import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatModal from '../components/ChatModal';
import HomeScreen from '../screens/main/HomeScreen';
import LegalScreen from '../screens/main/LegalScreen';
import MentalScreen from '../screens/main/MentalScreen';
import ResourcesScreen from '../screens/main/ResourcesScreen';
import CommunityScreen from '../screens/main/CommunityScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabsWithChat() {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#eaeaea',
          tabBarStyle: { backgroundColor: '#1a1a2e' },
          tabBarActiveTintColor: '#7dd3fc',
          tabBarInactiveTintColor: '#94a3b8',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Compass', tabBarLabel: 'Home' }} />
        <Tab.Screen name="Legal" component={LegalScreen} options={{ tabBarLabel: 'Legal' }} />
        <Tab.Screen name="Mental" component={MentalScreen} options={{ tabBarLabel: 'Mental' }} />
        <Tab.Screen name="Resources" component={ResourcesScreen} options={{ tabBarLabel: 'Resources' }} />
        <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: 'Community' }} />
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
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
