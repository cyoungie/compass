"""
Quickstart: first API call to Claude.
Run: python quickstart.py
Set ANTHROPIC_API_KEY in your environment or in a .env file.
"""
from dotenv import load_dotenv
load_dotenv()

import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1000,
    messages=[
        {
            "role": "user",
            "content": "What should I search for to find the latest developments in renewable energy?",
        },
    ],
)

print(message.content)
