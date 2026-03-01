import type { OnboardingFormData } from './index';

export type OnboardingStackParamList = {
  WelcomeForm: undefined;
  VoiceOnboarding: { form: OnboardingFormData };
  Summary: { form: OnboardingFormData; transcript: string };
};

/** Params for the Personalized Roadmap screen (one per priority action). */
export type RoadmapParams = {
  actionId: string;
  title: string;
  subtitle: string;
  tag?: 'urgent' | 'this_week' | 'opportunity';
};

export type HomeStackParamList = {
  Home: undefined;
  Roadmap: RoadmapParams;
  DailyReminders: undefined;
  PrioritiesList: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Mental: undefined;
  Resources: undefined;
  Community: undefined;
};

/** Params for Resource detail screen (script + more details). */
export type ResourceDetailParams = {
  name: string;
  address: string;
  distance: string;
  categoryLabel: string;
  placeId?: string;
  phone?: string;
  website?: string;
};

export type ResourcesStackParamList = {
  Resources: undefined;
  ResourceDetail: ResourceDetailParams;
};

export type RootStackParamList = {
  SignIn: undefined;
  Onboarding: undefined;
  Main: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
