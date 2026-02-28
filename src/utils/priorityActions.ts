import type { UserProfile } from '../types';

export interface PriorityAction {
  id: string;
  title: string;
  subtitle: string;
}

/**
 * Derive up to 3 priority action cards from the user's JSON profile.
 */
export function getPriorityActions(profile: UserProfile): PriorityAction[] {
  const actions: PriorityAction[] = [];

  if (!profile.has_id) {
    actions.push({
      id: 'id',
      title: 'Get your State ID',
      subtitle: 'You have the right to obtain a free state ID. We can help you with the steps.',
    });
  }
  if (!profile.has_healthcare) {
    actions.push({
      id: 'healthcare',
      title: 'Sign up for Medicaid',
      subtitle: 'In California you can stay on Medicaid until 26. Get covered now.',
    });
  }
  if (!profile.food_secure) {
    actions.push({
      id: 'food',
      title: 'Find food resources',
      subtitle: 'See nearby food banks and pantries in the Resources tab.',
    });
  }
  if (profile.wellbeing_score <= 2 && actions.length < 3) {
    actions.push({
      id: 'mental',
      title: 'Check in on your wellbeing',
      subtitle: 'Use the Mental tab for daily check-ins and local support resources.',
    });
  }
  if (profile.legal_gaps && profile.legal_gaps.length > 0 && actions.length < 3) {
    actions.push({
      id: 'legal',
      title: 'Address legal gaps',
      subtitle: profile.legal_gaps.slice(0, 2).join(', ') + '. See Legal tab for your rights.',
    });
  }
  if (actions.length < 3 && profile.housing_status?.toLowerCase().includes('unstable')) {
    actions.push({
      id: 'housing',
      title: 'Explore housing options',
      subtitle: 'Extended foster care can include housing support. See Resources for shelters.',
    });
  }

  return actions.slice(0, 3);
}
