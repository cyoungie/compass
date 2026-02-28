import type { UserProfile } from '../types';

export interface PriorityAction {
  id: string;
  title: string;
  subtitle: string;
  tag?: 'urgent' | 'this_week' | 'opportunity';
}

/**
 * Derive up to 3 priority action cards from the user's JSON profile.
 * Copy is warm and supportive.
 */
export function getPriorityActions(profile: UserProfile): PriorityAction[] {
  const actions: PriorityAction[] = [];

  if (!profile.has_id) {
    actions.push({
      id: 'id',
      tag: 'urgent',
      title: 'Get your State ID',
      subtitle: 'DMV on Market St - Free for foster youth.',
    });
  }
  if (!profile.has_healthcare) {
    actions.push({
      id: 'healthcare',
      tag: 'this_week',
      title: 'Enroll in Medicaid',
      subtitle: 'You qualify until age 26 - Takes 10 min.',
    });
  }
  if (!profile.food_secure) {
    actions.push({
      id: 'food',
      tag: 'this_week',
      title: 'Find food resources',
      subtitle: 'Check the Resources tab for nearby food banks and pantries.',
    });
  }
  if (profile.wellbeing_score <= 2 && actions.length < 3) {
    actions.push({
      id: 'mental',
      tag: 'this_week',
      title: 'Check in on your wellbeing',
      subtitle: 'Your mental health matters - we are in your corner.',
    });
  }
  if (profile.legal_gaps && profile.legal_gaps.length > 0 && actions.length < 3) {
    actions.push({
      id: 'legal',
      tag: 'opportunity',
      title: 'Address legal gaps',
      subtitle: 'Head to the Resources tab to see your rights and next steps.',
    });
  }
  if (actions.length < 3 && profile.housing_status?.toLowerCase().includes('unstable')) {
    actions.push({
      id: 'housing',
      tag: 'opportunity',
      title: 'Explore housing options',
      subtitle: 'Extended foster care can include housing support. Shelters in Resources.',
    });
  }

  return actions.slice(0, 3);
}
