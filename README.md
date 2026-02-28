# Compass – AI for Foster Care Youth

Starter project for an AI-powered app that helps foster care youth, using the Claude API.

## Where the code lives

| File | Purpose |
|------|--------|
| `quickstart.py` | First API call (Anthropic quickstart) – run this to verify your setup |
| `app_example.py` | Same idea, with a foster-care–oriented prompt – starting point for your app logic |
| `requirements.txt` | Python dependencies (Anthropic SDK) |

As you build out the app, you can add:

- `src/` or `app/` – main application code (API routes, prompts, helpers)
- `backend/` – if you add a web API (e.g. FastAPI/Flask)
- `frontend/` – if you add a web or mobile UI

## Setup

1. **API key**  
   Get a key from [Claude Console](https://console.anthropic.com/) and set it:

   **PowerShell (Windows):**
   ```powershell
   $env:ANTHROPIC_API_KEY = "your-api-key-here"
   ```

   **Or** copy `.env.example` to `.env`, add your key there, and use a package like `python-dotenv` to load it (don’t commit `.env`).

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the quickstart**
   ```bash
   python quickstart.py
   ```

4. **Run the foster care example**
   ```bash
   python app_example.py
   ```

Once these run successfully, you can start moving your real app logic into `src/` or `app/` and keep `quickstart.py` as a reference.
