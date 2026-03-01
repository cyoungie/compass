/**
 * User profile derived from onboarding (Claude JSON output).
 */
export interface UserProfile {
  housing_status: string;
  has_id: boolean;
  has_healthcare: boolean;
  education_level: string;
  food_secure: boolean;
  wellbeing_score: number;
  zip_code: string;
  state: string;
  legal_gaps?: string[];
}

/**
 * Onboarding form data (collected slide by slide).
 * name = nickname/alias for privacy; age = approximate age (no specific birthday).
 */
export interface OnboardingFormData {
  name: string;
  birthday: string;
  zipCode: string;
  /** Approximate age (e.g. "17"); optional for backward compat. */
  age?: string;
}

/**
 * Stored app user (form + profile + summary).
 */
export interface StoredUser {
  form: OnboardingFormData;
  transcript?: string;
  profile: UserProfile;
  welcomeSummary: string;
  onboardingCompletedAt: string;
}

/**
 * Placeholder for resources from Google Places.
 */
export interface PlaceResource {
  name: string;
  address: string;
  distance: string;
  phone?: string;
  website?: string;
  placeId?: string;
}

/**
 * Result of geocoding a US zip code (Google Geocoding address_components).
 */
export interface LocationFromZip {
  lat: number;
  lng: number;
  city?: string;
  county?: string;
  state?: string;
  country: string;
  isUS: boolean;
}

/**
 * Community feed post (mocked).
 */
export interface CommunityPost {
  id: string;
  authorName: string;
  avatarColor: string;
  body: string;
  timestamp: string;
  /** Optional for dashboard preview */
  location?: string;
  /** win | meetup for badge display */
  category?: 'win' | 'meetup' | string;
  likes?: number;
  replies?: number;
  /** Set when from Firestore; used to show delete for own posts */
  authorId?: string;
}
