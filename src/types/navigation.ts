import type { OnboardingFormData } from './index';

export type OnboardingStackParamList = {
  WelcomeForm: undefined;
  VoiceOnboarding: { form: OnboardingFormData };
  Summary: { form: OnboardingFormData; transcript: string };
};

export type MainTabParamList = {
  Home: undefined;
  Legal: undefined;
  Mental: undefined;
  Resources: undefined;
  Community: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
