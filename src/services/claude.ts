import Anthropic from '@anthropic-ai/sdk';
import type { UserProfile } from '../types';
import { config } from '../constants/config';

const MODEL = 'claude-sonnet-4-20250514';

export interface ProfileResult {
  profile: UserProfile;
  welcomeSummary: string;
}

const PROFILE_SYSTEM_PROMPT = `You are a supportive assistant for foster youth aging out of care. Given a transcript of a voice onboarding conversation, you must produce exactly two things in your response:

1) A valid JSON object (and only that object, no markdown or extra text around it) with these exact keys and types:
- housing_status: string (brief description of current housing)
- has_id: boolean
- has_healthcare: boolean
- education_level: string (e.g. "in high school", "GED", "some college")
- food_secure: boolean
- wellbeing_score: number (1-5)
- zip_code: string (from context or "unknown")
- state: string (e.g. "California", infer from zip if possible)
- legal_gaps: string[] (optional list of missing documents/rights to address)

Infer from the conversation; if something is unclear use reasonable defaults (e.g. has_id: false if not mentioned).

2) A warm welcome summary in second person, 3-4 sentences, that reflects what you learned and feels supportive. Place it after the JSON in the form:
WELCOME_SUMMARY:
<your 3-4 sentence summary here>`;

export async function generateProfileFromTranscript(transcript: string): Promise<ProfileResult> {
  const apiKey = config.anthropicApiKey;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');
  }
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: PROFILE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Transcript of onboarding conversation:\n\n${transcript}`,
      },
    ],
  });

  const text =
    response.content?.find((b) => b.type === 'text')?.type === 'text'
      ? (response.content.find((b) => b.type === 'text') as { type: 'text'; text: string }).text
      : '';
  if (!text) throw new Error('No text in Claude response');

  const welcomeMarker = 'WELCOME_SUMMARY:';
  const summaryIndex = text.indexOf(welcomeMarker);
  let jsonStr = text;
  let welcomeSummary = '';
  if (summaryIndex >= 0) {
    jsonStr = text.slice(0, summaryIndex).trim();
    welcomeSummary = text.slice(summaryIndex + welcomeMarker.length).trim();
  }
  // Extract first {...} as JSON if there's extra text
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  const profile = JSON.parse(jsonStr) as UserProfile;
  if (!welcomeSummary) welcomeSummary = `Welcome. We're here to support you.`;
  return { profile, welcomeSummary };
}

export async function chatWithClaude(
  userMessage: string,
  systemContext: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const apiKey = config.anthropicApiKey;
  if (!apiKey) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');
  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are a supportive, warm chatbot for foster youth aging out of care. You have the following context about the user (use it to personalize responses):\n\n${systemContext}\n\nBe concise, kind, and practical.`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const block = response.content?.find((b) => b.type === 'text');
  const text = block && block.type === 'text' ? block.text : '';
  return text;
}

const COACH_SYSTEM = `You are a warm, supportive AI coach for a young person (often a foster youth). They are sharing how they feel today in a short daily check-in. Reply in 2–4 sentences: validate their feelings, offer brief encouragement or a small reframe, and keep the tone gentle and hopeful. Do not lecture or give long advice. No bullet points or labels.`;

/**
 * Get supportive coach feedback for a "how are you feeling" message. Used for daily mental check-in.
 */
export async function getCoachFeedback(userMessage: string): Promise<string> {
  const apiKey = config.anthropicApiKey;
  if (!apiKey) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: COACH_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content?.find((b) => b.type === 'text');
  const text = block && block.type === 'text' ? block.text : '';
  return text || "You're doing a good job checking in with yourself. Be kind to yourself today.";
}
