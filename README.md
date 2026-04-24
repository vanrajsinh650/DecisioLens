# DecisioLens

### *Was this AI decision fair to you?*

**DecisioLens** is a free, open-source tool that helps you test whether an AI decision was fair. Pick a domain (hiring, lending, education, health insurance, or government welfare), fill in a profile, and find out what happens when you change the gender, city, or social category. Does the outcome stay the same? Or does the AI treat people differently based on who they are?

You don't need access to the real AI system. You don't need to be a developer. Just enter your details and run the test.

---

## The UN Goals We're Working Toward

| SDG | Goal | What DecisioLens Does About It |
|-----|------|-------------------------------|
| **SDG 10** | Reduced Inequalities | Shows when AI decisions change based on gender, location, or caste |
| **SDG 16** | Peace, Justice and Strong Institutions | Helps people document unfair AI decisions and write formal appeals |
| **SDG 8** | Decent Work and Economic Growth | Tests hiring AI systems for unfair candidate rejection |
| **SDG 4** | Quality Education | Checks college admission tools for bias against reserved categories and rural students |
| **SDG 3** | Good Health and Well-Being | Finds age and health-based discrimination in insurance claim processing |
| **SDG 1** | No Poverty | Surfaces regional bias in automated welfare eligibility checks |

---

## The Problem

Every year, millions of people get rejected by AI systems they cannot see or question.

- A woman applies for a software job. The AI rejects her. She has no idea if it was her skills or her gender.
- A farmer in a remote district applies for PM-KISAN. The system denies him. He has no recourse.
- A 65-year-old files a health insurance claim. The AI marks it high-risk and rejects it. His younger neighbor with the same policy gets approved.

These people don't have a tool to understand what happened. DecisioLens is that tool.

---

## What DecisioLens Does

Three questions. One simulation. Clear answers.

| Question | What Happens |
|---|---|
| **Is it stable?** | We test the same profile at 9 different threshold levels and show you exactly where the outcome flips |
| **Is it fair?** | We swap gender, city, category, age, or employment type and check if the result changes when it shouldn't |
| **Can you appeal it?** | We generate a plain-language breakdown of every risk signal, plus a formal appeal letter you can send |

---

## Supported Domains

| Domain | Who Uses It | What We Test |
|---|---|---|
| Hiring | Job applicant rejected by an automated recruiter | Gender, city, college tier |
| Lending | Loan applicant denied by a bank AI | Gender, employment type, city |
| Education | Student rejected from a private college admission system | Gender, city, caste category, family income |
| Health Insurance | Patient whose claim was auto-rejected | Age, pre-existing condition, city tier |
| Govt. Welfare | Citizen denied PM-KISAN or another benefit scheme | Category (SC/OBC/ST/EWS), region, gender |

Every domain has its own scoring formula where your demographic details actually change the outcome. The bias you find is real, not made up.

---

## How It Works

```
You enter a profile
        |
Domain-specific scorer runs the numbers
        |
We try 9 different decision thresholds (0.1 to 0.9)
        |
We create 3 profile clones (gender swap, location change, category change)
        |
We score every clone and compare results
        |
We flag: flips (same person, different outcome) and suspicious score gaps
        |
Risk score (0-100) + confidence zone label
        |
Gemini 2.5 Flash writes a plain-language explanation and a formal appeal letter
```

### The Full API Pipeline

```
POST /audit/run
  |
  |- validate_profile()               Accepts any domain's fields
  |- compute_score_from_validated()   Domain-specific scoring
  |- make_decision(score, threshold)  ACCEPT or REJECT
  |- analyze_threshold_sensitivity()  9 threshold test points
  |- generate_variations()            Domain-aware counterfactual clones
  |- evaluate_variations()            Score and decide each clone
  |- detect_instability()             Count how many decisions flipped
  |- detect_bias_patterns()           Flag suspicious score differences
  |- classify_confidence()            High / Borderline / Unstable
  |- compute_risk_score()             0-100 risk band
  |- build_reason_tags()              Labels for the UI
  |- asyncio.gather(                  Both Gemini calls run at the same time
       generate_explanation(),
       generate_appeal()
     )
```

---

## Project Structure

```
decisiolens/
|-- backend/                    Python, FastAPI
|   |-- ai/
|   |   `-- gemini.py           Gemini 2.5 Flash (async, singleton, fallback mode)
|   |-- core/
|   |   |-- model.py            5 domain-specific scoring formulas
|   |   |-- scenario.py         Domain-aware counterfactual generator
|   |   |-- analysis.py         Instability and bias detection logic
|   |   |-- threshold.py        9-point threshold sensitivity tester
|   |   |-- cache.py            LRU cache (256 slots, 5-min TTL)
|   |   |-- middleware.py       Request timing and error handling
|   |   `-- config.py           Pydantic settings (reads from .env)
|   |-- schemas/
|   |   |-- request.py          Flexible multi-domain input schema
|   |   `-- response.py         Typed audit response model
|   |-- services/
|   |   `-- audit_service.py    Full pipeline, step by step
|   `-- routers/
|       `-- audit.py            HTTP route layer only
|
`-- frontend/                   Next.js 14, TypeScript
    `-- src/
        |-- app/                Next.js App Router pages
        |-- features/
        |   |-- audit/          Input form and live results
        |   |-- results/        Full verdict report (7 sections)
        |   |-- history/        Past audit sessions
        |   |-- batch/          CSV bulk testing
        |   `-- landing/        Home page
        |-- lib/
        |   |-- domains/        Per-domain field configs and test presets
        |   |   |-- hiring.ts
        |   |   |-- lending.ts
        |   |   |-- education.ts
        |   |   |-- insurance.ts
        |   |   `-- welfare.ts
        |   `-- api.ts          Typed fetch client
        `-- hooks/              useAudit, useAuditHistory, useOnboarding
```

---

## Google Technology Used

| Technology | What We Use It For |
|---|---|
| **Google Gemini 2.5 Flash** | Writes the plain-language audit explanation and formal appeal letter |
| **Google GenAI SDK (`google-genai`)** | Async client with graceful fallback when the API is offline |
| **Google AI Studio** | API key setup and model testing |

Both Gemini calls (explanation and appeal) run at the same time using `asyncio.gather`, which cuts the response time roughly in half.

---

## Run It Yourself

### What You Need

- Python 3.11 or higher
- Node.js 18 or higher
- A free [Google AI Studio](https://aistudio.google.com/) API key

### 1. Clone the repo

```bash
git clone https://github.com/vanrajsinh650/DecisioLens.git
cd DecisioLens
```

### 2. Start the backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac or Linux

pip install -r requirements.txt

# Create your .env file
echo GEMINI_API_KEY=your_api_key_here > .env

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

API is live at `http://127.0.0.1:8000`
Swagger docs at `http://127.0.0.1:8000/docs`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

---

## API Reference

### POST /audit/run

Send a profile and get a full fairness report back.

**Request:**

```json
{
  "domain": "hiring",
  "threshold": 0.5,
  "profile": {
    "name": "Riya Shah",
    "score": 66,
    "experience": 3,
    "gender": "Female",
    "location": "Mumbai",
    "college": "Tier 1"
  }
}
```

**Response includes:**
- `original` - baseline score and decision
- `threshold_analysis` - decision at each of 9 threshold points
- `variations` - what happens when we swap the demographic fields
- `insights` - instability flag, bias flag, risk score (0-100), reason tags
- `explanation` - Gemini's plain-language summary of the audit
- `appeal` - a formal letter you can send to request a review
- `ai_jury_view` - a three-part verdict from the auditor, challenger, and judge

### GET /health
```json
{ "status": "ok" }
```

---

## A Real Example

**Profile:** Riya Shah, Score 66, 3 years experience, Female, Mumbai, Tier 1 college
**Decision at threshold 0.50:** REJECT

| What We Tested | Score | Result | Changed? |
|---|---|---|---|
| Original (Riya) | 0.481 | REJECT | No |
| Gender changed to Male | 0.511 | ACCEPT | Yes |
| Location changed to Nagpur | 0.441 | REJECT | No |
| College changed to Tier 2 | 0.461 | REJECT | No |

**Risk Score:** 72 out of 100 (HIGH)
**Flags:** gender_sensitive, threshold_sensitive
**Gemini wrote:** *"The decision is sensitive to gender. A male candidate with the same qualifications would have been accepted at this threshold. This is a high-risk pattern and the applicant has grounds to request a manual review."*

---

## Features

- 5 domains: Hiring, Lending, Education, Health Insurance, Government Welfare
- 3 to 4 demographic swaps per audit (gender, city, category, employment type, age)
- Threshold tested at 9 points from 0.1 to 0.9
- Gemini writes the explanation and the appeal letter
- AI Jury panel computed from actual analysis results
- Audit history saved locally with full replay
- CSV batch upload for testing many profiles at once
- Shareable report links via URL
- Print to PDF
- First-time user walkthrough built into the UI
- Works offline: falls back to rule-based explanations if Gemini is unavailable

---

## What's Next

- Deploy on Vercel (frontend) and Google Cloud Run (backend)
- Let users upload CSV predictions from their own AI systems
- Add healthcare and housing/rental domains
- SHAP-style feature importance charts
- Hindi, Gujarati, and Tamil language support
- WhatsApp interface for users in rural areas with limited internet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| AI | Google Gemini 2.5 Flash via `google-genai` SDK |
| Async | asyncio.gather for parallel Gemini calls |
| Caching | LRU cache with 256 slots and 5-minute TTL |
| Validation | Pydantic BaseModel and BaseSettings |
| Logging | Structured JSON logs with request timing |

---

## Google Solution Challenge 2026

Built for the **Google Solution Challenge 2026** under the **Open Innovation** track.

**What makes it different:**
Most AI fairness tools need access to a full dataset or the underlying model. DecisioLens works at the level of a single person and a single decision. Anyone who got an AI decision they didn't understand can use it, without technical knowledge and without access to the system that rejected them.

**Who it's for:**
People who got rejected. Students who didn't get admitted. Farmers who lost benefits. Anyone who got a "no" from an algorithm and wants to know if it was fair.

**Google tech:**
Gemini 2.5 Flash turns statistical findings into something any person can read and act on.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for everyone who got a "no" from an algorithm and deserved to know why.**

*DecisioLens - AI Fairness Simulation*

</div>
