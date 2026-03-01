# Compass

## Inspiration

Globally, an estimated 5.4 million children live in institutional care settings (Desmond et al., 2020). In the United States alone, roughly 20,000 youth turn 18 and age out of foster care each year, and around the world, hundreds of thousands of young people transition out of care annually (U.S. Department of Education, 2025).

**No family. No safety net. No one to call.**

Most of us had someone. A parent who helped us figure out health insurance. A family friend who explained what FAFSA meant. Someone to call when things got hard.

Foster youth don't get that. Within a year of aging out, a shocking number face homelessness, incarceration, or unemployment. As few as 3% ever earn a college degree, not because they aren't capable, but because no one showed them the path (Somers et al., 2021).

One of our team members grew up in Guam, a territory dealing with a severe foster care crisis, and watched as friends in foster care felt cornered into joining the military as their only stable option. Not because it was their dream, but because it felt like the only door left open. She knows her friends were more capable of far more than the limited choices they were given.

The resources exist. The housing programs, the education funding, the legal protections—they're all out there. But they're buried in bureaucracy, scattered across agencies, and impossible to navigate alone.

**That's where Compass comes in.**

---

## What it does

Compass is a mobile app built specifically for foster youth ages 16 to 21. When you open it for the first time, you don't fill out a form. You just talk. You tell Compass where you're at: your housing situation, what documents you're missing, whether you have healthcare. And Compass listens.

Using Claude API, it turns that conversation into a personalized action plan. Clear, manageable next steps. Real resources near you, pulled by your zip code. A guide that actually remembers your situation, so you never have to explain your life from scratch again.

Compass delivers:

### 🎙 Onboarding

Users share their situation (housing, documents, healthcare, etc.) through a chatbot.

→ Claude generates a structured profile + personalized life plan.

### 📱 Personalized Dashboard

Highlights immediate next steps based on urgency:

- "Apply for Extended Care"
- "Find housing near you"
- "Recover your birth certificate"

### 🏠 Resources + 💬 AI Assistant

A zip-code powered hub that displays real, local support instantly.

- Users enter their zip code during onboarding.
- From there, Compass pulls nearby:
  - Housing programs
  - Food banks
  - Healthcare clinics
  - Legal aid services
  - Mental health providers

This is combined with a contextual AI guide that remembers your situation. During onboarding, Compass learns about your housing status, legal gaps, healthcare access, and support network. That information is securely stored and injected into every AI interaction so that you don't have to re-explain your life every time you ask a question.

**It's not just a chatbot but a guide that understands your context.**

### 🧠 Mental Check-In

A private space to check in and talk through your feelings. Users can speak directly to an AI agent powered by Claude. It responds in real time with warm, human-sounding support, tracks emotional trends, and suggests grounding exercises or resources when needed.

### 👥 Community

The Community tab allows users to share wins, accomplishments, tips, and advice, creating a supportive, peer-driven network. Whether it's landing a job, finding housing, or navigating paperwork, users can post and learn from others going through similar experiences.

Long term, verified moderators can organize local events and meetups to help users build real-world connections in their area.

---

## How we built it

Compass is a native iOS application powered by contextual AI reasoning.

### Core stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Swift + SwiftUI — fast, accessible, fully native iOS experience |
| **AI** | Claude API — conversational understanding and dynamic, personalized action planning |
| **Resources** | Location-aware, zip-code–based logic for housing, healthcare, legal, and education |

### System flow

1. User shares their situation through a conversational interface →
2. Claude interprets context and identifies immediate needs →
3. Conversation is structured into clear, prioritized action steps →
4. Resource logic matches services by geography and eligibility →
5. ElevenLabs converts response back into natural voice →
6. App stores context securely for continuity across sessions

We designed Compass to feel conversational. Instead of surfacing a wall of links, it breaks things down into step-by-step guidance like:

- *"First, apply for extended Medicaid. Here's how."*
- *"Next, you qualify for transitional housing within 5 miles of you."*

---

## Challenges we ran into

1. **Building a Voice AI Agent for an iOS App**  
   Incorporating ElevenLabs into a real-time iOS experience was harder than we anticipated. We ran into API authentication issues and eventually decided to use Claude because ElevenLabs was not the best fit.

2. **Context Management**  
   Compass needs to remember a user's situation without storing sensitive information unsafely. Balancing personalization with privacy was both a technical and ethical challenge. We designed our intake process to collect only essential information. Users can choose aliases instead of providing real names, and a clear consent form is presented before any contextual data is saved.

3. **iOS App Development from Scratch**  
   This was our first time building a full iOS application. We learned SwiftUI, debugged networking issues, and worked through many build errors.

---

## Accomplishments that we're proud of

- Built a fully functional native iOS app within a hackathon timeframe
- Successfully integrated the Claude API for contextual reasoning
- Designed a conversational user experience
- Developed a personalized action-plan generator tailored to individual needs
- Implemented zip-code–based resource matching
- Integrated a mental health chat check-in feature
- Built a community chat space
- **Most importantly:** we built a system designed to close a critical gap in the transition out of foster care

---

## What we learned

- How to build and ship a fully functional iOS application under tight constraints
- How to integrate the Claude API into a reliable, production-ready workflow
- How to design AI systems responsibly for vulnerable populations
- How complex foster care systems truly are and how invisible these challenges can be to those outside of them

---

## What's next for Compass

Compass is just the beginning.

### Near-term

- **Real-time, state-specific policy databases** — So guidance reflects the exact benefits, eligibility rules, and deadlines in each state.
- **Partnerships with foster care agencies and nonprofits** — To ensure accuracy, trusted referrals, and direct integration into existing support systems.
- **Stronger privacy architecture** — On-device context storage, minimal data retention, and user-controlled memory.

To sustainably fund Compass, we plan to build a broader life-navigation version for the general population, helping ordinary young adults manage housing, healthcare, and career transitions, and use those proceeds to support free access for foster youth.

**Our overall goal is simple:**  
To put a trusted adult in the pocket of every young person navigating adulthood alone.

We're asking you to help us put a compass in the hands of those who need one most.

---

## Citations

- Desmond, C., Watt, K., Saha, A., Huang, J., & Lu, C. (2020). Prevalence and number of children living in institutional care: Global, regional, and country estimates. *The Lancet Child & Adolescent Health*, *4*(5), 370–377. https://doi.org/10.1016/S2352-4642(20)30022-5

- Somers, C. L., Goutman, R. L., Day, A., Enright, O., Crosby, S., & Taussig, H. (2020). Academic achievement among a sample of youth in foster care: The role of school connectedness. *Psychology in the Schools*, *57*(12), 1845–1863. https://doi.org/10.1002/pits.22433

- U.S. Department of Education. (2025). Students in foster care. https://www.ed.gov/teaching-and-administration/supporting-students/special-populations/students-in-foster-care
