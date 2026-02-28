import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext';
import { getNearbyResources } from '../../services/places';
import type { PlaceResource } from '../../types';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏠', color: '#fef3c7' },
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#fef3c7' },
  { id: 'food', label: 'Food', icon: '🍎', color: '#dcfce7' },
  { id: 'healthcare', label: 'Heal', icon: '💊', color: '#e9d5ff' },
  { id: 'clothing', label: 'Essentials', icon: '👕', color: '#fef9c3' },
  { id: 'legal', label: 'Legal', icon: '⚖️', color: '#e0e7ff' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface ResourceItem extends PlaceResource {
  category: CategoryId;
  categoryLabel: string;
  openStatus?: 'open' | 'closed';
}

const LOCATION_PLACEHOLDER = 'San Jose, CA';
const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';
const RESOURCES_HEADER_HEIGHT = 220;

// Resources to call (static list for call script section)
const CALL_SECTION_RESOURCES: Omit<ResourceItem, 'placeId'>[] = [
  { name: 'Next Door Solutions', address: 'Next Door Solutions, San Jose, CA', distance: '1.2 mi', category: 'housing', categoryLabel: 'HOUSING', openStatus: 'open' },
  { name: 'Sacred Heart Community', address: 'Sacred Heart Community Service Center, San Jose, CA', distance: '1.8 mi', category: 'food', categoryLabel: 'FOOD PANTRY', openStatus: 'open' },
  { name: 'Gardner Health Services', address: 'Gardner Health Services, San Jose, CA', distance: '2.1 mi', category: 'healthcare', categoryLabel: 'FREE HEALTHCARE', openStatus: 'open' },
  { name: 'Goodwill SCC Career Center', address: 'Goodwill SCC Career Center, San Jose, CA', distance: '2.6 mi', category: 'clothing', categoryLabel: 'CLOTHING & ESSENTIALS', openStatus: 'closed' },
  { name: 'Law Foundation of SV', address: 'Law Foundation of Silicon Valley, San Jose, CA', distance: '3.0 mi', category: 'legal', categoryLabel: 'FREE LEGAL AID', openStatus: 'open' },
];

// Mock distances when API doesn't return them
function withMockDistances<T extends { distance?: string }>(
  items: T[],
  startMi = 0.4
): (T & { distance: string })[] {
  return items.map((item, i) => ({
    ...item,
    distance: item.distance || `${(startMi + i * 0.6).toFixed(1)} mi`,
  }));
}

export default function ResourcesScreen() {
  const { user } = useProfile();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [foodBanks, setFoodBanks] = useState<PlaceResource[]>([]);
  const [shelters, setShelters] = useState<PlaceResource[]>([]);
  const [fqhcs, setFqhcs] = useState<PlaceResource[]>([]);

  const zip = user?.form?.zipCode ?? '';

  useEffect(() => {
    if (!zip) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getNearbyResources(zip).then((r) => {
      if (!cancelled) {
        setFoodBanks(r.foodBanks);
        setShelters(r.shelters);
        setFqhcs(r.fqhcs);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [zip]);

  const openAddress = useCallback((address: string) => {
    if (address) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  }, []);

  const allResources: ResourceItem[] = [
    ...withMockDistances(shelters, 0.4).map((p) => ({
      ...p,
      category: 'housing' as CategoryId,
      categoryLabel: 'HOUSING',
      openStatus: 'open' as const,
    })),
    ...withMockDistances(foodBanks, 1.0).map((p) => ({
      ...p,
      category: 'food' as CategoryId,
      categoryLabel: 'FOOD PANTRY',
      openStatus: 'open' as const,
    })),
    ...withMockDistances(fqhcs, 1.5).map((p) => ({
      ...p,
      category: 'healthcare' as CategoryId,
      categoryLabel: 'FREE HEALTHCARE',
      openStatus: 'open' as const,
    })),
  ];

  const filteredResources =
    selectedCategory === 'all'
      ? allResources
      : allResources.filter((r) => r.category === selectedCategory);

  const searchFiltered = searchQuery.trim()
    ? filteredResources.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : filteredResources;

  const closest = allResources[0];
  const showFeatured = closest && selectedCategory === 'all' && !searchQuery.trim();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Finding resources near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[ORANGE, CREAM]}
        style={[styles.headerGradient, { height: RESOURCES_HEADER_HEIGHT }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => {}} style={styles.mapViewButton}>
            <Text style={styles.mapViewButtonText}>Map view</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.resourcesTitle}>Local Resources</Text>
        <Text style={styles.resourcesTagline}>
          Real places near you, with exactly what to say when you call.
        </Text>
      </LinearGradient>

      <View style={styles.contentWrap}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location bar */}
        <View style={styles.locationBar}>
          <Text style={styles.locationText}>Near {zip ? `${zip}` : LOCATION_PLACEHOLDER}</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.mapViewLink}>Map view</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources near you..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => {}} style={styles.searchGear}>
              <Ionicons name="settings-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.chip, isSelected && styles.chipSelected]}
                activeOpacity={0.8}
              >
                <Text style={styles.chipIcon}>{cat.icon}</Text>
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured "Closest to you" card */}
        {showFeatured && closest && (
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => openAddress(closest.address)}
            activeOpacity={0.9}
          >
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>✦ CLOSEST TO YOU ✦</Text>
            </View>
            <Text style={styles.featuredTitle}>{closest.name}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>
              Tap for directions and contact info.
            </Text>
            <View style={styles.featuredRow}>
              <View style={styles.featuredMeta}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featuredMetaText}>{closest.distance}</Text>
              </View>
              <View style={styles.featuredMeta}>
                <Ionicons name="time" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.featuredMetaText}>Open now</Text>
              </View>
              <TouchableOpacity
                style={styles.getDirectionsBtn}
                onPress={() => openAddress(closest.address)}
              >
                <Text style={styles.getDirectionsText}>Get directions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Resource list */}
        {searchFiltered.length === 0 ? (
          <Text style={styles.empty}>
            No resources found. Try another category or search.
          </Text>
        ) : (
          searchFiltered.map((item, i) => {
            const cat = CATEGORIES.find((c) => c.id === item.category) ?? CATEGORIES[0];
            return (
              <TouchableOpacity
                key={item.placeId ?? `${item.category}-${i}`}
                style={styles.resourceCard}
                onPress={() => openAddress(item.address)}
                activeOpacity={0.8}
              >
                <View style={[styles.resourceIconBox, { backgroundColor: cat.color }]}>
                  <Text style={styles.resourceIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceCategory}>{item.categoryLabel}</Text>
                  <Text style={styles.resourceName}>{item.name}</Text>
                  <View style={styles.resourceMeta}>
                    <Ionicons name="location" size={12} color="#64748b" />
                    <Text style={styles.resourceDistance}>{item.distance}</Text>
                    {item.openStatus && (
                      <View
                        style={[
                          styles.statusTag,
                          item.openStatus === 'open' ? styles.statusOpen : styles.statusClosed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            item.openStatus === 'open' ? styles.statusTextOpen : styles.statusTextClosed,
                          ]}
                        >
                          {item.openStatus === 'open' ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            );
          })
        )}

        {/* Call script CTA */}
        <View style={styles.callScriptCard}>
          <View style={styles.callScriptIconWrap}>
            <Ionicons name="call" size={28} color={ORANGE} />
          </View>
          <Text style={styles.callScriptText}>
            Not sure what to say? Tap any resource for a call script.
          </Text>
          <View style={styles.callScriptChat}>
            <Ionicons name="chatbubble" size={22} color="#0ea5e9" />
          </View>
        </View>

        {/* Call section – resources to call */}
        <View style={styles.callSectionHeader}>
          <Text style={styles.callSectionTitle}>Call</Text>
        </View>
        {CALL_SECTION_RESOURCES.map((item, i) => {
          const cat = CATEGORIES.find((c) => c.id === item.category) ?? CATEGORIES[0];
          return (
            <TouchableOpacity
              key={`call-${item.name}-${i}`}
              style={styles.resourceCard}
              onPress={() => item.address && openAddress(item.address)}
              activeOpacity={0.8}
            >
              <View style={[styles.resourceIconBox, { backgroundColor: cat.color }]}>
                <Text style={styles.resourceIcon}>{cat.icon}</Text>
              </View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceCategory}>{item.categoryLabel}</Text>
                <Text style={styles.resourceName}>{item.name}</Text>
                <View style={styles.resourceMeta}>
                  <Ionicons name="location" size={12} color="#64748b" />
                  <Text style={styles.resourceDistance}>{item.distance}</Text>
                  {item.openStatus && (
                    <View
                      style={[
                        styles.statusTag,
                        item.openStatus === 'open' ? styles.statusOpen : styles.statusClosed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.openStatus === 'open' ? styles.statusTextOpen : styles.statusTextClosed,
                        ]}
                      >
                        {item.openStatus === 'open' ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f5' },
  headerGradient: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapViewButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  mapViewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  resourcesTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resourcesTagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
  },
  contentWrap: {
    flex: 1,
    backgroundColor: '#faf8f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf8f5',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24, paddingBottom: 100 },
  locationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  mapViewLink: {
    fontSize: 15,
    fontWeight: '600',
    color: ORANGE,
  },
  searchRow: { marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#0f172a',
    paddingVertical: 0,
  },
  searchGear: { padding: 4 },
  chipsScroll: { marginHorizontal: -20 },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  chipSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  chipIcon: { fontSize: 16, marginRight: 6 },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ORANGE,
  },
  chipLabelSelected: {
    color: '#ffffff',
  },
  featuredCard: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  featuredTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
    lineHeight: 20,
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
  },
  getDirectionsBtn: {
    marginLeft: 'auto',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  getDirectionsText: {
    fontSize: 14,
    fontWeight: '700',
    color: ORANGE,
  },
  empty: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
  resourceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resourceIcon: { fontSize: 24 },
  resourceContent: { flex: 1 },
  resourceCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: ORANGE,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourceDistance: {
    fontSize: 13,
    color: '#64748b',
  },
  statusTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusOpen: { backgroundColor: '#dcfce7' },
  statusClosed: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextOpen: { color: '#166534' },
  statusTextClosed: { color: '#991b1b' },
  callScriptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
  callScriptIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  callScriptText: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  callScriptChat: {
    padding: 4,
  },
  callSectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  callSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});
