# 🛡️ Guardion — AI Prompt Security + Repository Vulnerability Scanner

A security platform that protects developers from two common risks:
1. **Leaking sensitive information** in AI chat prompts
2. **Using vulnerable dependencies** in software repositories

---

## Architecture

```
┌──────────────────────┐     ┌────────────────────┐
│  Chrome Extension    │────▶│  FastAPI Backend    │
│  (Manifest V3)       │     │  (Python)           │
└──────────────────────┘     │                     │
                             │  ┌───────────────┐  │
┌──────────────────────┐     │  │Prompt Analyzer │  │
│  React Dashboard     │────▶│  │Repo Scanner    │  │──▶ OSV API
│  (Vite + Tailwind)   │     │  │Gemini AI       │  │──▶ Gemini API
└──────────────────────┘     │  └───────────────┘  │
                             │  SQLite Database    │
                             └────────────────────┘
```

---

## Quick Start (3 terminals)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

The API starts at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

### 2. Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Dashboard opens at **http://localhost:5173**

### 3. Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `extension/` folder
4. Visit [chat.openai.com](https://chat.openai.com), [claude.ai](https://claude.ai), or [gemini.google.com](https://gemini.google.com)
5. The extension will analyze prompts before they are sent

---

## Configuration

Copy `backend/.env.example` to `backend/.env` and set:

```env
GEMINI_API_KEY=your_key_here   # Get from https://makersuite.google.com/app/apikey
```

The system works without a Gemini key — remediation falls back to template responses.

---

## API Endpoints

| Method | Endpoint             | Description                          |
|--------|----------------------|--------------------------------------|
| POST   | `/api/analyze_prompt`| Analyze prompt for sensitive data    |
| POST   | `/api/scan_repo`     | Scan GitHub repo for vulnerabilities |
| POST   | `/api/remediate`     | Get AI fix for a vulnerability       |
| GET    | `/api/dashboard`     | Aggregated security metrics          |
| GET    | `/docs`              | Swagger API documentation            |

### Example: Analyze Prompt

```bash
curl -X POST http://localhost:8000/api/analyze_prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "My API key is sk-1234567890abcdef", "source": "test"}'
```

Response:
```json
{
  "risk_score": 0.9,
  "decision": "block",
  "detected_categories": ["api_key"],
  "sanitized_prompt": "My API key is [REDACTED_API_KEY]"
}
```

### Example: Scan Repository

```bash
curl -X POST http://localhost:8000/api/scan_repo \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/expressjs/express"}'
```

---

## Features

### Prompt Security Engine
- Detects: API keys, AWS keys, passwords, tokens, private keys, emails, credit cards, phone numbers, SSNs, JWTs, database URLs, GitHub/Slack tokens
- Actions: **allow** / **warn** / **block** based on risk score
- Auto-sanitization: redacts sensitive values before sending to AI

### Repository Scanner
- Extracts dependencies from `package.json`, `requirements.txt`, `pom.xml`
- Queries [OSV.dev](https://osv.dev) for known CVEs
- Calculates security score (0–100)

### AI Remediation (Gemini)
- Generates human-friendly fix suggestions
- Recommends safe upgrade versions
- Falls back to templates without API key

### Security Dashboard
- Real-time metrics and charts
- Prompt analysis tester
- Repository scanner with inline remediation

---

## Project Structure

```
guardion/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLite + SQLAlchemy
│   │   ├── api/
│   │   │   ├── prompt_routes.py # POST /analyze_prompt
│   │   │   ├── repo_routes.py   # POST /scan_repo, /remediate
│   │   │   └── dashboard_routes.py # GET /dashboard
│   │   ├── models/
│   │   │   ├── db_models.py     # ORM models
│   │   │   └── schemas.py       # Pydantic schemas
│   │   └── services/
│   │       ├── prompt_analyzer.py  # Regex-based sensitive data detection
│   │       ├── repo_scanner.py     # Git clone + OSV API
│   │       └── gemini_service.py   # AI remediation
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── MetricsCards.jsx
│   │       ├── Charts.jsx
│   │       ├── PromptTester.jsx
│   │       ├── RepoScanner.jsx
│   │       └── RecentActivity.jsx
│   ├── package.json
│   └── vite.config.js
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── guardion.css
│   └── icons/
└── README.md
```

---

## Security Score Algorithm

| Severity | Penalty |
|----------|---------|
| Critical | -20     |
| High     | -10     |
| Medium   | -5      |
| Low      | -2      |

**Score = 100 - total penalties** (minimum 0)

---

## Tech Stack

- **Backend:** FastAPI + SQLite + SQLAlchemy
- **Frontend:** React + Tailwind CSS + Recharts
- **Extension:** Chrome Manifest V3
- **APIs:** OSV.dev (CVE data) + Google Gemini (AI remediation)
