# 🛡️ CodeSentinel AI

> **Intelligent Code Review & Repository Health Analytics — Powered by AI**

CodeSentinel AI is a fully integrated AI-powered code review ecosystem that provides live GitHub integration, dynamic custom rule enforcement, and an enterprise-grade analytics dashboard. It eliminates the bottlenecks of manual code reviews by automatically detecting vulnerabilities, calculating tech debt, and enforcing organizational coding standards in real time.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Core Modules](#-core-modules)
- [Implementation Details](#-implementation-details)
- [Testing & Results](#-testing--results)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚨 Problem Statement

Modern software engineering teams face critical bottlenecks in the code review cycle:

| Problem | Impact |
|---|---|
| **Lack of Real-Time Security Tracking** | Vulnerabilities discovered only after CI/CD pipelines or security audits |
| **Generic AI Advice** | Off-the-shelf AI reviewers conflict with internal engineering guidelines |
| **Tech Debt Blindness** | Managers lack visibility into compounding effects of delayed bug fixes and stale PRs |

**CodeSentinel AI** solves all three with a unified platform — combining live repository analytics, context-aware AI reviews, and custom rule enforcement.

---

## ✨ Key Features

### 🔐 Enterprise Security & Tech Debt Dashboard
- Real-time **Security Health Score** and **Tech Debt Score** computed dynamically from repository data
- Heuristic algorithm analyzes commit history, open PRs, repository staleness, and byte size
- Prevents "fake 100/100" scores on empty or inactive repositories
- Recharts-powered live data visualizations

### 🤖 AI-Powered Code Review
- File-level code analysis using **Cohere / Gemini LLMs**
- Reviews are context-aware, injecting your organization's saved custom rules into the AI prompt dynamically
- Detects vulnerabilities, anti-patterns, and standards violations

### 📋 Custom Organization Style Guides
- Engineering leads can define custom rules (e.g., *"Always use React.FC formatting. Never use absolute imports"*)
- Rules are persisted in SQLite and injected automatically into every AI review session
- No paywalls — universally available to all team members

### 🔗 Seamless GitHub Integration
- Secure OAuth flow with GitHub
- 30-day persistent `httpOnly` cookies for session management
- Fetches live metrics: open issues, PRs, commits, repo size, and staleness

### 📱 Responsive Enterprise UI
- Glassmorphism design with mobile-first responsiveness
- 4-column metric cards snap to a 2×2 grid on mobile automatically
- Built with React + Tailwind CSS

---

## 🏗️ System Architecture

```
User / Developer
       │
       ▼ (Browser / VS Code)
┌─────────────────────┐
│    React Frontend   │  ← Recharts, Tailwind CSS, Glassmorphism UI
└─────────────────────┘
       │  REST API + JWT Auth (Real-Time Scores)
       ▼
┌─────────────────────────┐
│  Node.js / Express API  │  ← Business logic, heuristic engine, prompt builder
└─────────────────────────┘
    /         |          \
   ▼           ▼            ▼
SQLite DB   GitHub API   Cohere / Gemini AI Engine
(Custom     (Live Repo    (File-level Code
  Rules)     Metrics)       Analysis)
```

**Data Flow:**
1. User authenticates via GitHub OAuth
2. Frontend requests repository metrics via REST API
3. Backend calls GitHub API concurrently (using `Promise.all`) for repo details, issues, PRs, and commits
4. Analytics Engine computes Security Score & Tech Debt using heuristic algorithm
5. For code review: custom rules are fetched from SQLite → injected into AI prompt → LLM returns intelligent review
6. Results streamed back to the React dashboard in real time

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite |
| **AI Engine** | Cohere `command-r-plus` / Google Gemini |
| **Authentication** | GitHub OAuth 2.0, JWT, `httpOnly` Cookies |
| **GitHub Integration** | GitHub REST API v3 |
| **Design** | Glassmorphism, Mobile-First Responsive |

---

## 🧩 Core Modules

### 1. Analytics Engine — Security & Tech Debt Scoring

**Endpoint:** `GET /api/github/repo/:owner/:repo/metrics`

The backend uses `Promise.all` to concurrently fetch:
- Repository metadata (size, last updated)
- Up to **100 open issues**
- All **open pull requests**
- The **50 most recent commits**

**Scoring Algorithm Logic:**
```
Base Score = 100

Penalties:
  - Repository size > 5MB           → deduct points (size staleness)
  - Last commit > 30 days ago       → deduct points (age staleness)
  - Commit messages containing keywords like "fix", "bug", "cve", "hotfix"
                                    → estimate bug velocity → deduct accordingly
  - High open PR count              → tech debt indicator

Result: Authentic Security Score + Tech Debt Score (0–100)
```

> Zero-issue repositories do **not** default to a fake 100/100. The commit heuristic ensures realistic scoring always.

---

### 2. AI Code Review Engine

- Accepts file content for analysis
- Fetches user's `custom_rules` from SQLite `users` table
- Constructs a dynamic prompt:

```
You are a code reviewer for [Organization].
Enforce these custom rules strictly: {custom_rules}

Analyze the following code for:
- Security vulnerabilities
- Standards violations
- Tech debt indicators
- Best practice recommendations

Code: {file_content}
```

- Sends to Cohere/Gemini → returns structured, actionable review

---

### 3. Custom Rules Manager

- Stored in the `custom_rules` column of the SQLite `users` table
- Frontend UI allows engineering leads to add/update rules without any paywall restriction
- Rules are injected into every AI review prompt dynamically — no restart required

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm or yarn
- A GitHub OAuth App ([create one here](https://github.com/settings/applications/new))
- Cohere API Key or Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/codesentinel-ai.git
cd codesentinel-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the App

```bash
# Start the backend server
cd backend
npm run dev

# Start the frontend (in a new terminal)
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

Create a `.env` file in the `/backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d

# AI Engine (choose one or both)
COHERE_API_KEY=your_cohere_api_key
GEMINI_API_KEY=your_gemini_api_key

# Database
SQLITE_DB_PATH=./database/codesentinel.db
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/github` | Initiate GitHub OAuth flow |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback |
| `POST` | `/api/auth/logout` | Logout & clear cookie |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Repository Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github/repos` | List user's GitHub repositories |
| `GET` | `/api/github/repo/:owner/:repo/metrics` | Get Security Score & Tech Debt Score |

### AI Code Review

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/review/analyze` | Submit code file for AI review |

### Custom Rules

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rules` | Fetch current user's custom rules |
| `PUT` | `/api/rules` | Update custom rules |

---

## 🧪 Testing & Results

### Testing Strategy

- **Unit & Logic Testing:** Verified that repositories with zero active issues fall back to commit-based heuristic scoring — no fake perfect scores
- **Responsive UI Testing:** Validated 4-column → 2×2 grid snap on mobile for all metric cards
- **Integration Testing:** Confirmed GitHub token persistence survives browser reloads, resolving prior state-disconnection bugs

### Results

| Metric | Result |
|---|---|
| Score Accuracy | 100% dynamic, non-binary scores for all repositories |
| Custom Rules | Instantly saved, immediately applied to AI review prompts |
| Mobile UI | Fully responsive across all screen sizes |
| Token Persistence | GitHub session survives browser reloads ✅ |

---

## 🗺️ Roadmap

- [ ] VS Code Extension for inline CodeSentinel reviews
- [ ] Webhook-based auto-review on PR open events
- [ ] Multi-repository team dashboard
- [ ] Historical trend charts for Security Score over time
- [ ] Slack / Discord notification integration for critical vulnerability alerts
- [ ] Support for GitLab & Bitbucket OAuth
- [ ] Export reports as PDF

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.

---



---

<div align="center">

Built with ❤️ by **Satyam Kadavla and that team**

</div>
