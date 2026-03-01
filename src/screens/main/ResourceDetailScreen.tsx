import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getPlaceDetails } from '../../services/places';
import type { ResourcesStackParamList } from '../../types/navigation';
import { FONT_HEADING, FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD } from '../../constants/fonts';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

/** Call scripts and tips by category (categoryLabel key). */
const CALL_SCRIPTS: Record<string, { intro: string; script: string[]; tips?: string }> = {
  HOUSING: {
    intro: 'When you call a shelter or housing program, you can say:',
    script: [
      '"Hi, I’m calling to ask about housing or shelter options."',
      '"I’m a young adult / former foster youth and I’m looking for a safe place to stay."',
      '"Do you have any openings or a waitlist I can get on?"',
      '"What documents do I need to bring when I come in?"',
    ],
    tips: 'Have your ID and any foster care paperwork ready. Ask about extended foster care if you’re under 21.',
  },
  'FOOD PANTRY': {
    intro: 'When you call or visit a food bank or pantry:',
    script: [
      '"Hi, I’d like to get food from your pantry. Is it open today?"',
      '"Do I need to bring anything or sign up first?"',
      '"What are your hours and address?"',
    ],
    tips: 'Many pantries don’t require proof of need—just show up during open hours. Some offer fresh produce and hot meals.',
  },
  'FREE HEALTHCARE': {
    intro: 'When calling a health center or FQHC:',
    script: [
      '"Hi, I’d like to make an appointment. I don’t have insurance / I’m on Medicaid."',
      '"I’m a young adult and need a primary care doctor."',
      '"Do you offer mental health or dental here too?"',
    ],
    tips: 'You can stay on Medicaid until 26. FQHCs offer sliding-scale or free care.',
  },
  'CLOTHING & ESSENTIALS': {
    intro: 'When you call a clothing bank or resource center:',
    script: [
      '"Hi, I’m looking for free clothing or essentials. Are you open today?"',
      '"Do I need an appointment or can I just come in?"',
      '"What do you have—clothes, toiletries, other items?"',
    ],
    tips: 'Some places also offer job interview clothes and hygiene kits.',
  },
  'FREE LEGAL AID': {
    intro: 'When calling a legal aid organization:',
    script: [
      '"Hi, I need help with [housing / benefits / custody / record]. I’m a young adult."',
      '"Do you help with [your issue]? Is it free?"',
      '"How do I get an appointment or intake?"',
    ],
    tips: 'Legal aid is free and confidential. Have a short summary of your situation ready.',
  },
  default: {
    intro: 'When you call, you can say:',
    script: [
      '"Hi, I’m calling to ask about your services."',
      '"I’d like to know your hours and what I need to bring."',
      '"Is there a waitlist or can I come in soon?"',
    ],
    tips: 'Write down the name of who you spoke to and any next steps.',
  },
};

type RouteType = RouteProp<ResourcesStackParamList, 'ResourceDetail'>;

export default function ResourceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const params = route.params;
  const [details, setDetails] = useState<{ phone?: string; website?: string } | null>(null);

  useEffect(() => {
    if (params.placeId) {
      getPlaceDetails(params.placeId).then(setDetails);
    } else {
      setDetails({ phone: params.phone, website: params.website });
    }
  }, [params.placeId, params.phone, params.website]);

  const phone = details?.phone ?? params.phone;
  const website = details?.website ?? params.website;
  const scriptContent = CALL_SCRIPTS[params.categoryLabel] ?? CALL_SCRIPTS.default;

  const openDirections = () => {
    if (params.address) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(params.address)}`);
  };

  const openCall = () => {
    if (phone) Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const openWebsite = () => {
    if (website) Linking.openURL(website);
  };

  const copyAddress = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(params.address);
    } else {
      try {
        Share.share({ message: params.address, title: 'Address' });
      } catch {
        // iOS can throw if share sheet fails; ignore
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[ORANGE, CREAM]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.categoryLabel}>{params.categoryLabel}</Text>
        <Text style={styles.title} numberOfLines={2}>{params.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color="#475569" />
          <Text style={styles.distance}>{params.distance}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.address}>{params.address}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={openDirections}>
              <Ionicons name="navigate" size={20} color={ORANGE} />
              <Text style={styles.actionBtnText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={copyAddress}>
              <Ionicons name="copy-outline" size={20} color={ORANGE} />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(phone || website) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {phone && (
              <TouchableOpacity style={styles.contactRow} onPress={openCall}>
                <Ionicons name="call" size={20} color={ORANGE} />
                <Text style={styles.contactText}>{phone}</Text>
              </TouchableOpacity>
            )}
            {website && (
              <TouchableOpacity style={styles.contactRow} onPress={openWebsite}>
                <Ionicons name="globe-outline" size={20} color={ORANGE} />
                <Text style={styles.contactLink}>Open website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to say when you call</Text>
          <Text style={styles.scriptIntro}>{scriptContent.intro}</Text>
          {scriptContent.script.map((line, i) => (
            <View key={i} style={styles.scriptLine}>
              <Text style={styles.scriptBullet}>•</Text>
              <Text style={styles.scriptText}>{line}</Text>
            </View>
          ))}
          {scriptContent.tips && (
            <View style={styles.tipsBox}>
              <Ionicons name="bulb-outline" size={18} color={ORANGE} />
              <Text style={styles.tipsText}>{scriptContent.tips}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f5' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 12, padding: 4 },
  categoryLabel: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 12,
    color: 'rgba(30,41,59,0.8)',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: 22,
    color: '#1e293b',
    marginBottom: 8,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distance: { fontFamily: FONT_BODY, fontSize: 14, color: '#475569' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: FONT_HEADING_SEMIBOLD,
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 10,
  },
  address: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  actionBtnText: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 14, color: ORANGE },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingRight: 12,
  },
  contactText: { fontFamily: FONT_BODY, fontSize: 15, color: '#334155' },
  contactLink: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 15, color: ORANGE },
  scriptIntro: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  scriptLine: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  scriptBullet: { fontFamily: FONT_BODY, fontSize: 15, color: ORANGE, marginRight: 8 },
  scriptText: { flex: 1, fontFamily: FONT_BODY, fontSize: 15, color: '#334155', lineHeight: 22, fontStyle: 'italic' },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  tipsText: { flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: '#9a3412', lineHeight: 20 },
});
