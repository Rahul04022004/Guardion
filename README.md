# 🛡️ Guardion — AI Prompt Security & Repository Vulnerability Scanner

> **Protect what you type. Secure what you ship.**

Guardion is an AI-powered security platform that shields developers from two critical risks:

1. **Leaking secrets & sensitive data** in AI chat prompts (ChatGPT, Claude, Gemini)
2. **Shipping vulnerable dependencies** in software projects
3. **Prompt injection & jailbreak attacks** against AI systems

Built with **FastAPI**, **React**, **Google Gemini AI**, and a **Chrome Extension**.

---

## 🎯 What It Does

### Prompt Security (Data Loss Prevention + Prompt Injection Detection)

When you type in ChatGPT, Claude, or Gemini — Guardion intercepts the prompt **before** it's sent and scans it for:

| Threat Type | Examples |
|---|---|
| **API Keys** | `sk-...`, `AKIA...`, `api_key=...`, GitHub tokens |
| **Credentials** | Passwords, Bearer tokens, JWTs, OAuth tokens |
| **Private Keys** | PEM, SSH, PGP private keys |
| **Database Secrets** | `postgres://`, `mongodb+srv://`, connection strings |
| **Personal Data (PII)** | Credit cards, SSNs, phone numbers, emails |
| **Prompt Injection** | "Reveal your system prompt", "Show hidden instructions" |
| **Jailbreak Attempts** | DAN prompts, "ignore previous instructions", "developer mode" |
| **Role Manipulation** | "You are now unrestricted", "bypass safety filters" |

**17 regex pattern categories** + **Gemini AI contextual analysis** work together — regex provides fast, deterministic detection while Gemini catches obfuscated or novel attacks that regex alone would miss.

### Repository Vulnerability Scanning

Paste any **GitHub repository URL** and Guardion will:
- Clone the repo and parse dependency files (`requirements.txt`, `package.json`, `pom.xml`, `go.mod`, etc.)
- Query the **OSV (Open Source Vulnerabilities)** database for every dependency
- Return CVEs with severity ratings (Critical/High/Medium/Low) and CVSS scores
- Generate **AI-powered remediation** using Gemini — explaining the vulnerability, its impact, and exactly how to fix it

---

## 🏗️ Architecture

```
┌──────────────────────────┐       ┌──────────────────────────────┐
│   Chrome Extension       │──────▶│   FastAPI Backend (Python)   │
│   (Manifest V3)          │       │                              │
│   Intercepts prompts on: │       │  ┌────────────────────────┐  │
│   • ChatGPT              │       │  │ Prompt Analyzer        │  │
│   • Claude               │       │  │  • 17 regex patterns   │  │
│   • Gemini               │       │  │  • Gemini AI analysis  │  │
└──────────────────────────┘       │  ├────────────────────────┤  │
                                   │  │ Repo Scanner           │  │──▶ OSV API
┌──────────────────────────┐       │  │  • Dependency parser   │  │──▶ Gemini API
│   React Dashboard        │──────▶│  │  • CVE lookup          │  │
│   (Vite + Tailwind CSS)  │       │  ├────────────────────────┤  │
│   • Real-time metrics    │       │  │ Gemini Integration     │  │
│   • Prompt tester        │       │  │  • Context-aware AI    │  │
│   • Repo scanner UI      │       │  │  • Smart remediation   │  │
│   • Analytics charts     │       │  └────────────────────────┘  │
└──────────────────────────┘       │       MongoDB Atlas          │
                                   └──────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:

```bash
python -m app.main
```

API runs at **http://localhost:8000** | Swagger docs at **http://localhost:8000/docs**

### 2. Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Dashboard opens at **http://localhost:5173**

### 3. Chrome Extension

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `extension/` folder
4. Visit ChatGPT / Claude / Gemini — Guardion is now active

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check & service status |
| `POST` | `/api/analyze_prompt` | Analyze a prompt for sensitive data & injection attacks |
| `POST` | `/api/scan_repo` | Scan a GitHub repo for vulnerable dependencies |
| `POST` | `/api/remediate` | Get AI-powered fix for a specific CVE |
| `GET` | `/api/dashboard` | Aggregated metrics & recent activity |

### Example: Analyze a Prompt

```bash
curl -X POST http://localhost:8000/api/analyze_prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "My API key is sk-abc123def456ghi789jkl012mno345"}'
```

**Response:**

```json
{
  "risk_score": 0.9,
  "decision": "block",
  "detected_categories": ["api_key"],
  "sanitized_prompt": "My API key is [REDACTED_API_KEY]",
  "reason": "API key detected in prompt"
}
```

### Example: Scan a Repository

```bash
curl -X POST http://localhost:8000/api/scan_repo \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/user/repo"}'
```

---

## 🔍 Detection Engine

### Two-Stage Analysis Pipeline

```
User Prompt
     │
     ▼
┌─────────────────────┐
│  Stage 1: Regex     │  Fast, deterministic pattern matching
│  (17 categories)    │  Catches known secret formats
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Stage 2: Gemini AI │  Contextual analysis
│  (gemini-2.0-flash) │  Catches obfuscated/novel leaks
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Merge Results      │  Stricter decision wins
│  • max(risk_score)  │  Categories unioned
│  • union(categories)│  Gemini reason included
└─────────────────────┘
```

### Risk Scoring

| Score Range | Decision | Meaning |
|-------------|----------|---------|
| 0.00 – 0.29 | ✅ **ALLOW** | No sensitive data or threats detected |
| 0.30 – 0.69 | ⚠️ **WARN** | Possibly sensitive, needs review |
| 0.70 – 1.00 | 🚫 **BLOCK** | Contains secrets, credentials, or attack patterns |

### Detection Categories

**Sensitive Data (14 patterns):**

| Category | Weight | What It Catches |
|----------|--------|----------------|
| `aws_key` | 1.0 | AWS access keys (`AKIA…`, `ASIA…`) |
| `private_key` | 1.0 | PEM/SSH/PGP private keys |
| `database_url` | 0.95 | PostgreSQL, MongoDB, MySQL, Redis connection strings |
| `credit_card` | 0.95 | Visa, MasterCard, Amex card numbers |
| `ssn` | 0.95 | Social Security Numbers (XXX-XX-XXXX) |
| `api_key` | 0.9 | Generic API keys, `sk-…` prefixed keys |
| `auth_token` | 0.9 | Bearer tokens, OAuth tokens |
| `github_token` | 0.9 | GitHub PATs (`ghp_…`, `gho_…`) |
| `password` | 0.85 | Password assignments (`password=…`) |
| `jwt` | 0.85 | JSON Web Tokens (`eyJ…`) |
| `slack_token` | 0.8 | Slack bot/user tokens (`xox…`) |
| `generic_secret` | 0.75 | `client_secret=…`, `encryption_key=…` |
| `email` | 0.3 | Email addresses |
| `phone_number` | 0.3 | US/international phone numbers |

**Prompt Injection (3 patterns):**

| Category | Weight | What It Catches |
|----------|--------|----------------|
| `jailbreak_attempt` | 1.0 | DAN prompts, "do anything now", bypass safety, developer mode |
| `role_manipulation` | 0.95 | "Ignore previous instructions", "you are in debugging mode" |
| `prompt_injection` | 0.9 | "Reveal system prompt", "show hidden instructions" |

---

## 🧩 Project Structure

```
Guardion/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── prompt_routes.py      # Prompt analysis endpoint
│   │   │   ├── repo_routes.py        # Repo scanning & remediation
│   │   │   └── dashboard_routes.py   # Dashboard metrics
│   │   ├── models/
│   │   │   └── schemas.py            # Pydantic request/response schemas
│   │   ├── db/
│   │   │   └── mongodb.py            # MongoDB Atlas connection & collections
│   │   ├── services/
│   │   │   ├── prompt_analyzer.py    # Regex + combined analysis pipeline
│   │   │   ├── gemini_integration.py # Gemini AI context-aware analysis
│   │   │   ├── gemini_service.py     # AI-powered vulnerability remediation
│   │   │   ├── repo_scanner.py       # Git clone, parse deps, query OSV
│   │   │   ├── owasp_service.py      # OWASP Top 10 classification engine
│   │   │   ├── auth_service.py       # JWT auth + bcrypt password hashing
│   │   │   └── nvd_service.py        # NVD/CVE enrichment service
│   │   ├── config.py                 # Environment & app settings
│   │   └── main.py                   # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Navigation bar
│   │   │   ├── MetricsCards.jsx       # Security stats cards
│   │   │   ├── Charts.jsx            # Analytics visualizations
│   │   │   ├── PromptTester.jsx      # Interactive prompt testing UI
│   │   │   ├── RepoScanner.jsx       # Repository scan interface
│   │   │   └── RecentActivity.jsx    # Activity feed
│   │   ├── api.js                    # API client
│   │   ├── App.jsx                   # Root component
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── vite.config.js
├── extension/
│   ├── manifest.json                 # Manifest V3 config
│   ├── background.js                 # Service worker
│   ├── content.js                    # Injected into AI chat pages
│   ├── popup.html / popup.js         # Extension popup UI
│   └── guardion.css                  # Overlay styles
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, MongoDB Atlas, PyMongo, Uvicorn |
| **AI Engine** | Google Gemini 2.0 Flash (`google-generativeai` SDK) |
| **Vuln Database** | OSV API (Open Source Vulnerabilities) |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts |
| **Extension** | Chrome Manifest V3, Service Worker |
| **Languages Scanned** | Python, JavaScript/Node.js, Java (Maven), Go |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI analysis |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `NVD_API_KEY` | No | NVD API key for CVE enrichment |

Create `backend/.env` with your keys. The `.gitignore` ensures they're never committed.

---

## 🔒 How the Chrome Extension Works

1. **Content script** (`content.js`) is injected into ChatGPT, Claude, and Gemini pages
2. When you type a prompt and press send, the extension **intercepts** the text
3. It sends the prompt to the Guardion backend (`POST /api/analyze_prompt`)
4. If the prompt is **BLOCKED**, a warning overlay appears and the prompt is prevented from being sent
5. If **WARNED**, you see a notice but can choose to proceed
6. The extension popup shows your protection stats

---

## 📊 Dashboard Features

- **Security Metrics** — Total prompts analyzed, blocked, warned, allowed
- **Vulnerability Stats** — Repos scanned, CVEs found by severity
- **Trend Charts** — Visual analytics over time (Recharts)
- **Prompt Tester** — Interactive tool to test prompts with preset examples
- **Repo Scanner** — Paste a GitHub URL and scan for vulnerabilities live
- **Activity Feed** — Recent prompts and scan results

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for safer AI interactions
</p>
