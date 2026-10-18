# CallSaarthi AI 🟣
### Every Voice Matters. Every Detail Counts.

**An AI-powered multilingual helpline complaint analysis assistant designed to help human operators turn unstructured conversations into clearer, structured, evidence-backed insights.**

> **Smarter Insights. Stronger Communities.**

Built with purpose by **Team StackForge** for the hackathon.

---

## 🌍 The Problem

Every complaint tells a story. But when that story arrives through a helpline conversation, important details can be difficult to identify quickly.

Helpline transcripts may contain:
- Multiple languages, including Hindi, English, and Hinglish.
- Important details scattered across a long conversation.
- References to threats, previous incidents, and locations.
- Ambiguous statements, incomplete information, and conflicting details.
- Time-sensitive information that deserves careful human review.

Manually interpreting lengthy conversations can place a significant cognitive burden on operators. Important context may be difficult to locate, particularly when conversations are multilingual or emotionally complex.

**The challenge isn't simply understanding what was said. It's helping operators identify what matters, understand why it matters, and verify it in the original conversation.**

## 💡 Our Solution

**CallSaarthi AI** is a multilingual, AI-powered complaint analysis and decision-support assistant designed to make helpline transcript review more structured, transparent, and efficient.

It aims to help human operators identify relevant information from Hindi, English, and Hinglish conversations, organize it into a structured case report, and connect extracted findings to their supporting text.

Instead of replacing human judgment with an automated decision, CallSaarthi AI is designed to help people make better-informed decisions with clearer evidence.

### What makes CallSaarthi different?

- **Multilingual by design:** Built around the realities of Hindi, English, and Hinglish conversations.
- **Evidence-linked insights:** Findings should be traceable to the original transcript so operators can verify the context.
- **Uncertainty-aware analysis:** Missing, ambiguous, or uncertain information should be identified rather than presented as fact.
- **Human-in-the-loop decision-making:** AI assists with analysis; authorized human operators retain responsibility for decisions.
- **Structured information:** Unstructured conversation content can be organized into a consistent case-report format.

## ✨ Key Capabilities

| Capability | Purpose |
|---|---|
| 🗣️ Multilingual transcript analysis | Support analysis of Hindi, English, and Hinglish complaint transcripts. |
| 🔎 Key detail extraction | Identify explicitly stated information such as locations, threats, and prior incidents. |
| ⚠️ Potential urgency indicators | Highlight information that may warrant further human review. |
| 🔗 Evidence traceability | Connect findings to relevant portions of the original transcript where supported. |
| 🧩 Missing-information awareness | Flag details that are absent, unclear, or require verification. |
| 📋 Structured case reports | Organize relevant findings into a readable format for operator review. |
| 👤 Human oversight | Keep final assessment and action decisions with human operators. |

*These capabilities describe the intended system behavior. Refer to the current implementation and demo to distinguish completed features from work in progress.*

## 🔄 How It Works

The proposed workflow follows five steps:

**1. Input**

A complaint transcript is provided for analysis.

**2. AI-powered analysis**

The backend processes the transcript using the configured AI model and analysis instructions.

**3. Information extraction**

Relevant details, potential urgency indicators, and information requiring clarification are organized.

**4. Evidence and verification**

Extracted findings are presented with supporting transcript context where available. Operators can review the source instead of blindly trusting an AI-generated summary.

**5. Human decision-making**

The operator reviews the analysis, verifies important details, and decides what action—if any—is appropriate.

```text
Complaint Transcript
        ↓
Multilingual AI Analysis
        ↓
Key Details + Potential Urgency Indicators
        ↓
Evidence + Missing Information
        ↓
Structured Case Report
        ↓
Human Review and Decision
```

## 🧠 Responsible AI by Design

In a helpline environment, an incorrect interpretation can have serious consequences. For this reason, CallSaarthi AI follows a human-centered approach.

- **AI supports; humans decide.** The system is intended for decision support, not autonomous dispatch or final incident classification.
- **Evidence matters.** Important findings should be verifiable against the original transcript.
- **Uncertainty must remain visible.** Ambiguous statements should not be silently converted into confirmed facts.
- **Context matters.** A potential urgency indicator is a prompt for review, not proof that an emergency exists.
- **Privacy matters.** Sensitive transcripts should be handled carefully, with access controls, secure configuration, and appropriate data-retention practices.
- **No fabricated certainty.** Missing information should be reported as missing rather than guessed.

Our principle is simple:

**Technology should strengthen human judgment—not replace it.**

## 🏗️ Technical Architecture

The planned architecture separates the user interface, backend processing, and AI integration.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React.js | User interface and presentation of analysis results. |
| Build tooling | Vite | Frontend development and production builds. |
| Backend API | Python + FastAPI | Request handling, analysis orchestration, and structured responses. |
| AI integration | Google Gemini API | Language understanding and transcript analysis. |

### Architecture Overview

```text
┌──────────────────────────────┐
│       React + Vite UI        │
│ Transcript / Analysis View   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
│ Validation + Orchestration   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Google Gemini API       │
│ Transcript Interpretation    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Structured Analysis Results  │
│ Evidence + Uncertainty       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Human Review in the UI       │
└──────────────────────────────┘
```

*The diagram represents the intended architecture. Update it if the current implementation uses a different request flow.*

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python 3.10+ if using the FastAPI backend
- A Google Gemini API key if the backend calls Gemini
- Git

### 1. Clone the repository

```bash
git clone https://github.com/prathamjain27106-ux/CallSaarthi-AI.git
cd CallSaarthi-AI
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure environment variables

Keep API keys on the backend. Never expose a private Gemini API key in React code or commit it to GitHub.

For example, a backend environment file might contain:

```env
GEMINI_API_KEY=your_api_key_here
```

Use your backend's actual environment-variable name and configuration. Keep `.env` out of version control, and provide a sanitized `.env.example` if needed.

### 4. Start the frontend

```bash
npm run dev
```

Open the local URL printed in your terminal.

### 5. Start the backend

If your FastAPI backend is maintained in a separate directory, enter that directory, create and activate a Python virtual environment, and install its declared dependencies.

For a typical FastAPI application, the development server command may look like this:

```bash
uvicorn main:app --reload
```

Use this command only if your backend entry point is actually `main.py` and exposes an `app` object. Follow the project's real backend instructions if they differ.

## 📁 Project Structure

The current frontend repository is organized around the following structure:

```text
CallSaarthi-AI/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── .gitignore
```

The exact contents may evolve as the project develops. Add the backend directory to this tree once it exists in the repository.

## 🎯 Potential Impact

CallSaarthi AI is designed to support a more consistent and reviewable approach to complaint analysis.

Its intended benefits include:

- Helping operators locate important information in lengthy transcripts.
- Making multilingual conversations easier to review.
- Improving the visibility of evidence and missing details.
- Supporting more consistent documentation.
- Keeping human judgment at the center of consequential decisions.

These are intended benefits, not measured outcomes. Any claims about time saved, accuracy, or operational improvement should be supported by testing.

## 🧪 Evaluation and Future Improvements

The system can be evaluated using representative, consented or appropriately anonymized test transcripts.

Useful evaluation dimensions include:

- **Extraction quality:** Are the identified details explicitly supported by the transcript?
- **Evidence accuracy:** Does the supporting text justify each finding?
- **Uncertainty handling:** Are ambiguous or missing details clearly identified?
- **Multilingual robustness:** Does the system handle Hindi, English, and Hinglish appropriately?
- **Human usability:** Can an operator understand and verify the report?
- **Privacy and security:** Are sensitive data and credentials handled appropriately?

Potential future improvements include broader multilingual evaluation, stronger evidence highlighting, configurable reporting formats, improved privacy controls, and feedback workflows for human reviewers.

## 🔐 Privacy and Security

Helpline transcripts may contain personal and sensitive information.

CallSaarthi AI should be developed and demonstrated using synthetic or properly anonymized sample data wherever possible. API credentials should be stored securely on the backend, and access to sensitive information should be limited to authorized users.

Before real-world deployment, the system would require appropriate security testing, privacy review, operational safeguards, and validation with relevant stakeholders.

## 👥 Team

**Team Name:** StackForge  
**Project:** CallSaarthi AI

Built with a shared goal: using AI to help people interpret important information more clearly and responsibly.

## 🌟 Our Vision

We envision a future where language differences and lengthy conversations are less of a barrier to understanding a complaint.

CallSaarthi AI aims to help turn conversations into organized, verifiable insights—so human operators can focus on understanding the situation and making informed decisions.

**Every Voice Matters. Every Detail Counts.**

---

## 📌 Project Status

CallSaarthi AI is being developed as a hackathon project. Features, integrations, and deployment status should be assessed against the current codebase and demonstration.

**Built by StackForge | AI for Social Good**
