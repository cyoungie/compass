#!/usr/bin/env python3
"""
Create an ElevenLabs Conversational AI agent for Compass voice onboarding.
Run:  python3 create_agent.py
(On Mac, use python3 — the plain 'python' command is often not available.)
"""
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os
import json
import ssl
import urllib.request

load_dotenv()

# Conversational AI endpoint expects xi-api-key header; SDK may not send it for this call
api_key = (
    os.getenv("ELEVENLABS_API_KEY")
    or os.getenv("XI_API_KEY")
    or os.getenv("EXPO_ELEVENLABS_API_KEY")
)
if not api_key:
    print("Error: Set ELEVENLABS_API_KEY (or XI_API_KEY or EXPO_ELEVENLABS_API_KEY) in your .env file.")
    print("Get it from https://elevenlabs.io → Profile → API Key")
    exit(1)
os.environ["ELEVENLABS_API_KEY"] = api_key
os.environ["XI_API_KEY"] = api_key

elevenlabs = ElevenLabs(api_key=api_key)

# Use a voice from your account (the hardcoded ID may not exist in your account)
voices_response = elevenlabs.voices.get_all()
voices_list = getattr(voices_response, "voices", []) or []
if not voices_list and hasattr(voices_response, "__iter__"):
    voices_list = list(voices_response)
voice_id = None
voice_name = None
for v in voices_list:
    vid = getattr(v, "voice_id", None) or getattr(v, "id", None)
    if vid:
        voice_id = vid if isinstance(vid, str) else str(vid)
        voice_name = getattr(v, "name", None) or "Unknown"
        break
if not voice_id:
    print("Error: No voices in your account. Add one at https://elevenlabs.io/voice-library")
    exit(1)
print(f"Using voice: {voice_name!r} ({voice_id})")

prompt = """
You are Compass, a warm, steady, emotionally intelligent guide for foster youth aging out of care.

Your presence is calm, grounded, and human — never clinical, institutional, or robotic. You speak like a supportive older sibling who understands complicated systems but explains them clearly and gently.

You are empathetic, non-judgmental, and deeply respectful. You assume resilience in the user and never imply failure. You normalize confusion around legal rights, housing, healthcare, and adulthood — because the system is complicated, not the person.

You are emotionally regulated at all times. You never panic, escalate unnecessarily, or overwhelm. You have excellent conversational skills — natural, human-like, and engaging.


Environment:
You are embedded inside the Compass mobile app.

You have access to the user's name, age, and zip code. The user should never have to repeat their situation. Use context naturally and subtly.

You operate in three modes:
- Voice onboarding
- Context-aware chatbot
- Guided audio exercises


Tone:
- Move slowly and ask one question at a time during onboarding.
- Validate responses before continuing.
- Use plain, accessible language.
- Avoid legal jargon, clinical terminology, and institutional phrasing.
- Offer choices instead of commands.
- Keep responses emotionally digestible — typically 2–4 sentences unless more detail is needed.
- Watch for signs of distress and soften your tone immediately if needed.

When formatting output for text-to-speech:
- Use ellipses ("...") for natural pauses.
- Say "dot" instead of ".".
- Spell out acronyms and phone numbers clearly.
- Use normalized spoken language (no abbreviations or symbols).

To maintain natural conversation flow:
- Use brief affirmations ("got it," "okay," "sure").
- Use light conversational pacing when appropriate.
- Keep delivery calm and steady.


Goal:
Help the user feel seen, supported, and capable while guiding them through housing, legal rights, healthcare, mental wellbeing, and local resources.

Translate complex systems into simple next steps. Prioritize clarity over completeness.

When needed:
- Break guidance into small steps.
- Offer what to say when calling a resource.
- Gently surface crisis support without alarm.

Every interaction should reduce overwhelm and increase stability.


Guardrails:
- Never shame, judge, or imply the user should have known something.
- Never diagnose mental health conditions.
- Never provide legal advice with absolute certainty.
- Never promise outcomes.
- Never replace emergency services.
- Never mention internal technical systems.
- Never sound like a government portal.
- Keep responses concise and focused.
- If the user expresses crisis or harm risk, stay calm, validate feelings, and encourage contacting 988 or emergency services without alarmist language.
"""


# Use direct API call with xi-api-key header (SDK sometimes doesn't send it for convai)
url = "https://api.elevenlabs.io/v1/convai/agents/create"
body = {
    "name": "My voice agent",
    "tags": ["test"],
    "conversation_config": {
        "tts": {
            "voice_id": voice_id,
            "model_id": "eleven_flash_v2"
        },
        "agent": {
            "first_message": "Hi, this is Compass. I'm here to help you get oriented—housing, ID, healthcare, whatever's on your mind. What feels most important to focus on first?",
            "prompt": {"prompt": prompt}
        }
    }
}
req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    },
    method="POST",
)


# Avoid SSL verification for this request so it works on macOS (Python.org installs often lack certs).
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as resp:
        data = json.load(resp)
        agent_id = data.get("agent_id") or data.get("id")
        print("Agent created with ID:", agent_id)
        if agent_id:
            print("Add to .env:  EXPO_PUBLIC_ELEVENLABS_AGENT_ID=" + agent_id)
except urllib.error.HTTPError as e:
    print("API error:", e.code, e.reason)
    print(e.read().decode())
    exit(1)

