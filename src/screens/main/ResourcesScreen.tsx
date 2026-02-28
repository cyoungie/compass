import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { getNearbyResources } from '../../services/places';
import type { PlaceResource } from '../../types';

export default function ResourcesScreen() {
  const { user } = useProfile();
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7dd3fc" />
        <Text style={styles.loadingText}>Finding resources near you...</Text>
      </View>
    );
  }

  const renderList = (title: string, items: PlaceResource[]) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No results. Try another zip or check your API key.</Text>
      ) : (
        items.map((p, i) => (
          <TouchableOpacity
            key={p.placeId ?? i}
            style={styles.card}
            onPress={() => openAddress(p.address)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardName}>{p.name}</Text>
            {p.distance ? <Text style={styles.distance}>{p.distance}</Text> : null}
            <Text style={styles.address}>{p.address}</Text>
            {p.phone ? (
              <Text style={styles.phone} onPress={() => Linking.openURL(`tel:${p.phone}`)}>
                {p.phone}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resources near you</Text>
      {zip ? (
        <Text style={styles.subtitle}>Zip: {zip}</Text>
      ) : (
        <Text style={styles.subtitle}>Add your zip in onboarding to see nearby places.</Text>
      )}
      {renderList('Food banks', foodBanks)}
      {renderList('Shelters', shelters)}
      {renderList('Community health (FQHCs)', fqhcs)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#94a3b8' },
  title: { fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#cbd5e1', marginBottom: 10, marginTop: 16 },
  empty: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardName: { fontSize: 16, fontWeight: '600', color: '#f1f5f9', marginBottom: 4 },
  distance: { fontSize: 12, color: '#7dd3fc', marginBottom: 4 },
  address: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  phone: { fontSize: 14, color: '#0ea5e9' },
});
