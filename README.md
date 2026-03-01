# 🧭 Compass

AI life navigation for foster youth aging out of care

Compass is a mobile app that guides foster youth (ages 16–21) through housing, legal rights, healthcare, mental health, and community, powered by ElevenLabs voice AI and a fully contextual assistant.

Globally, an estimated 5.4 million children live in institutional or alternative care systems (Desmond et al., 2020). In the United States alone, roughly 20,000 youth age out each year (U.S. Department of Education, 2025). Worldwide, that number reaches into the hundreds of thousands annually, many aging out without a support system, understanding of their legal rights, access to the benefits designed to protect them, or knowledge of where to turn for help.

Compass ensures no youth has to navigate adulthood alone.

## The Problem

Within a year of aging out, many face extreme challenges, including homelessness, incarceration, or lack of employment. As few as 3% of those who age out of foster care may ever earn a college degree (Somers et al., 2021).

Foster youth aging out of care face:
   - High risk of homelessness
   - Unclaimed education funding
   - Missing critical documents (ID, birth certificate, Social Security card)
   - Unmet mental health needs
   - No trusted, consistent support system

The information and benefits exist, but they’re fragmented, bureaucratic, and difficult to navigate without guidance.

## The Solution

Compass delivers:

### 🎙 Voice Onboarding

Users talk through their situation (housing, documents, healthcare, etc.) via ElevenLabs.
→ Claude generates a structured profile + personalized life plan.

### 📱 Personalized Dashboard

Highlights immediate next steps based on urgency:

“Apply for Extended Care”

“Find housing near you”

“Recover your birth certificate”

### 🏠 Resources + 💬 AI Assistant

A zip-code powered hub that displays real, local support instantly.
Users enter their zip code during onboarding.
From there, Compass pulls nearby:
   - Housing programs
   - Food banks
   - Healthcare clinics
   - Legal aid services
   - Mental health providers

This is combined with a contextual AI guide that remembers your situation.
During onboarding, Compass learns about your housing status, legal gaps, healthcare access, and support network. That information is securely stored and injected into every AI interaction so that you don’t have to re-explain your life every time you ask a question.

It’s not just a chatbot but a guide that understands your context.

### 🧠 Mental Check-In

A private space to check in and talk through your feelings.

Users can speak directly to an AI wellbeing agent powered by ElevenLabs. It responds in real time with warm, human-sounding support, tracks emotional trends, and suggests grounding exercises or resources when needed.

### 👥 Community

The Community tab allows users to share wins, accomplishments, tips, and advice, creating a supportive, peer-driven network. Whether it’s landing a job, finding housing, or navigating paperwork, users can post and learn from others going through similar experiences.

Long term, verified moderators can organize local events and meetups to help users build real-world connections in their area.

## Tech stack

- **React Native** (Expo)
- **ElevenLabs** voice onboarding + conversational AI
- **Claude API (Anthropic)** — profile summary + chatbot
- **Google Maps Places API** — local resources by zipcode
- **AsyncStorage** — secure local profile storage

## MVP Scope (Hackathon Build)

   - Voice onboarding
   - Personalized dashboard (3 priority actions)
   - Resources (housing/food/healthcare)
   - AI Assistant (contextual chatbot)
   - Mental tab (check-in + resources)
   - Community feed

## Setup

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Environment variables**  
   Copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_ANTHROPIC_API_KEY` — Claude API key
   - `EXPO_PUBLIC_ELEVENLABS_AGENT_ID` — (optional) for voice onboarding in dev builds
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — for Resources tab
   - **Firebase (optional):** For auth + cloud profile + real community, add from Firebase Console → Project settings → Your web app: `EXPO_PUBLIC_FIREBASE_*` vars (see `.env.example`). Enable Auth (Email/Password) and Firestore. Create an index on `posts` for `createdAt` desc when prompted.

3. **Run**
   ```bash
   npx expo start --ios
   ```
   In Expo Go, onboarding skips voice and goes straight to the main app. For real voice, use a dev build: `npx expo run:ios`.

## App flow

- **Onboarding:** Name, optional birthday, zip → profile saved → main app. With Firebase, you can create an account (email/password) at the end to sync profile to the cloud.
- **Dashboard:** Home, Mental, Resources, Community (real feed when Firebase configured), floating chat. Sign in/sign out when using Firebase.

## License

Private / your choice.

## Citations

Desmond, C., Watt, K., Saha, A., Huang, J., & Lu, C. (2020). Prevalence and number of children living in institutional care: Global, regional, and country estimates. The Lancet Child & Adolescent Health, 4(5), 370–377. https://doi.org/10.1016/S2352-4642(20)30022-5

Somers, C. L., Goutman, R. L., Day, A., Enright, O., Crosby, S., & Taussig, H. (2020). Academic achievement among a sample of youth in foster care: The role of school connectedness. Psychology in the Schools, 57(12), 1845–1863. https://doi.org/10.1002/pits.22433

U.S. Department of Education. (2025). Students in foster care. https://www.ed.gov/teaching-and-administration/supporting-students/special-populations/students-in-foster-care


