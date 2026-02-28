"""
Example: Claude call tailored for a foster care youth app.
Run: python app_example.py
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
            "content": "I'm a teen in foster care. What are some simple, supportive things I can do when I'm feeling stressed or alone?",
        },
    ],
)

# Get the text from the response
for block in message.content:
    if hasattr(block, "text"):
        print(block.text)
