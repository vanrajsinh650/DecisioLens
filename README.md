# DecisioLens

### *Was this AI decision fair to you?*

**DecisioLens** is an open-source counterfactual simulation tool that lets anyone test whether an AI decision — in hiring, lending, education, health insurance, or government welfare — would have been different if they were a different gender, from a different city, or from a different social background.

> Unlike traditional fairness tools that analyze datasets, DecisioLens tests **individual decision behavior** through profile-level simulation — so anyone can check if an AI was fair to them.

---

## 🌍 UN Sustainable Development Goals

This project directly addresses **6 UN SDGs**:

| SDG | Goal | How DecisioLens Helps |
|-----|------|-----------------------|
| **SDG 10** | Reduced Inequalities | Detects demographic bias in AI decisions across gender, location, and caste |
| **SDG 16** | Peace, Justice & Strong Institutions | Enables algorithmic accountability and generates formal appeal documentation |
| **SDG 8** | Decent Work & Economic Growth | Audits AI hiring systems to surface unfair candidate rejection patterns |
| **SDG 4** | Quality Education | Tests college admission algorithms for bias against reserved categories and rural students |
| **SDG 3** | Good Health & Well-Being | Exposes age and condition-based discrimination in insurance claim AI |
| **SDG 1** | No Poverty | Surfaces regional bias in automated government welfare eligibility systems |

---

## 🔥 The Problem

Every day, millions of people are **rejected by AI systems** they cannot see, question, or challenge.

- A woman applies for a software job. AI rejects her. She doesn't know if it was her skills — or her gender.
- A farmer in a remote district applies for PM-KISAN. The automated system denies him. He has no recourse.
- A 65-year-old submits a health insurance claim. AI flags it as high-risk and rejects it. His younger neighbor with the same policy gets approved.

These people have **no tool** to understand what happened — and no way to fight back.

**DecisioLens gives them one.**

---

## 💡 What DecisioLens Does

DecisioLens uses **counterfactual simulation** to answer three questions about any AI decision:

| Question | What We Do |
|---|---|
| **Is it stable?** | Test the decision at 9 different threshold cutpoints — see exactly where it flips from ACCEPT to REJECT |
| **Is it fair?** | Swap gender, location, category, age, or employment type — check if the outcome changes when it shouldn't |
| **Can you appeal it?** | Get a plain-language explanation of every risk signal + a formal appeal letter written by Gemini AI |

---

## 🗂️ Supported Domains

| Domain | Who Uses It | Key Bias Variables Tested |
|---|---|---|
| 🧑‍💼 **Hiring** | Job applicant rejected by an AI recruiter | Gender, city, college tier |
| 🏦 **Lending** | Loan applicant denied by a bank AI | Gender, employment type, city |
| 🎓 **Education** | Student rejected from a private college admission AI | Gender, city, caste category, family income |
| 🏥 **Health Insurance** | Patient whose insurance claim was auto-rejected | Age, pre-existing condition, city tier |
| 🌾 **Govt. Welfare** | Citizen denied PM-KISAN or other benefit scheme | Category (SC/OBC/ST/EWS), region tier, gender |

Each domain has **domain-specific scoring** where demographic variables genuinely influence the outcome — making bias detection real, not theatrical.

---

## 🔬 How It Works

```
User enters profile  →  Domain-specific AI scorer  →  Baseline decision
        ↓
Threshold sensitivity test (9 cutpoints: 0.1 → 0.9)
        ↓
Counterfactual variation generator
  [gender swap] [location change] [category/employment change] [age group change]
        ↓
Instability detection (how many variations flip the outcome?)
Bias pattern detection (which demographic swaps cause score deltas > 5%?)
        ↓
Risk score (0–100) + Confidence zone classification
        ↓
Gemini 2.5 Flash → Plain-language explanation + Formal appeal letter
```

### The AI Pipeline (Backend)

```
POST /audit/run
  │
  ├─ validate_profile()          # Pydantic schema — multi-domain flexible
  ├─ compute_score_from_validated()  # Domain-specific scoring formula
  ├─ make_decision(score, threshold)
  ├─ analyze_threshold_sensitivity()  # 9 threshold test points
  ├─ generate_variations()       # Domain-aware counterfactual generator
  ├─ evaluate_variations()       # Score + decide each clone
  ├─ detect_instability()        # Count decision flips
  ├─ detect_bias_patterns()      # Flag suspicious score deltas
  ├─ classify_confidence()       # High / Borderline / Unstable zone
  ├─ compute_risk_score()        # 0–100 band: Low / Medium / High
  ├─ build_reason_tags()         # Structured flags for UI rendering
  └─ asyncio.gather(             # Parallel Gemini calls
       generate_explanation(),
       generate_appeal()
     )
```

---

## 🏗️ Architecture

```
decisiolens/
├── backend/                    # Python FastAPI
│   ├── ai/
│   │   └── gemini.py           # Google Gemini 2.5 Flash integration (async, singleton)
│   ├── core/
│   │   ├── model.py            # 5 domain-specific scoring engines
│   │   ├── scenario.py         # Domain-aware counterfactual generator
│   │   ├── analysis.py         # Instability + bias detection
│   │   ├── threshold.py        # Threshold sensitivity analysis
│   │   ├── cache.py            # LRU in-memory cache (256 entries, 5-min TTL)
│   │   ├── middleware.py       # Request timing + structured error handling
│   │   └── config.py           # Pydantic BaseSettings (env-based)
│   ├── schemas/
│   │   ├── request.py          # Flexible multi-domain profile schema
│   │   └── response.py         # Typed AuditResponse model
│   ├── services/
│   │   └── audit_service.py    # Pipeline orchestrator (async)
│   └── routers/
│       └── audit.py            # FastAPI route — thin HTTP controller
│
└── frontend/                   # Next.js 14 + TypeScript
    └── src/
        ├── app/                # Next.js App Router pages
        ├── features/
        │   ├── audit/          # Instrument panel + real-time results
        │   ├── results/        # Scrollable verdict narrative (7 sections)
        │   ├── history/        # Audit session history
        │   ├── batch/          # CSV batch audit
        │   └── landing/        # Hero + feature highlights
        ├── lib/
        │   ├── domains/        # Per-domain field configs + presets
        │   │   ├── hiring.ts
        │   │   ├── lending.ts
        │   │   ├── education.ts
        │   │   ├── insurance.ts
        │   │   └── welfare.ts
        │   └── api.ts          # Typed fetch client
        └── hooks/              # useAudit, useAuditHistory, useOnboarding
```

---

## 🤖 Google Technology Used

| Technology | Usage |
|---|---|
| **Google Gemini 2.5 Flash** | Generates plain-language audit explanations and formal appeal letters |
| **Google GenAI SDK (`google-genai`)** | Async Gemini client with fallback mode when API is unavailable |
| **Google AI Studio** | API key provisioning and model testing during development |

The Gemini integration uses `asyncio.gather` to fire explanation and appeal generation **concurrently**, halving the round-trip latency for the two AI calls.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/vanrajsinh650/DecisioLens.git
cd DecisioLens
```

### 2. Start the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# Create .env file
echo GEMINI_API_KEY=your_api_key_here > .env

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be live at `http://127.0.0.1:8000`
Interactive docs at `http://127.0.0.1:8000/docs`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

---

## 📡 API Reference

### `POST /audit/run`

Run a full counterfactual audit simulation.

**Request body:**

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
- `original` — baseline score + decision
- `threshold_analysis` — decision at each of 9 threshold points
- `variations` — counterfactual scores and decisions (gender swap, location change, etc.)
- `insights` — instability flag, bias flag, risk score (0–100), reason tags
- `explanation` — Gemini-generated plain-language audit summary
- `appeal` — Gemini-generated formal appeal letter
- `ai_jury_view` — auditor / challenger / judge verdict panel

### `GET /health`
```json
{ "status": "ok" }
```

---

## 📊 Sample Audit Output

**Profile:** Riya Shah | Score: 66 | 3 yrs experience | Female | Mumbai | Tier 1 college  
**Decision:** `REJECT` at threshold 0.50

| Variation | Score | Decision | Changed? |
|---|---|---|---|
| ✅ Baseline (Riya) | 0.481 | REJECT | — |
| 🔄 Gender → Male | 0.511 | **ACCEPT** | ✅ Yes |
| 🔄 Location → Nagpur | 0.441 | REJECT | No |
| 🔄 College → Tier 2 | 0.461 | REJECT | No |

**Risk Score:** 72 / 100 — **HIGH**  
**Flags:** `demographic_sensitive`, `threshold_sensitive`  
**Gemini Explanation:** *"The decision is highly sensitive to gender variation. A male candidate with identical qualifications would have been accepted at this threshold. This is a high-risk pattern consistent with gender proxy bias..."*

---

## ✨ Key Features

- **5 Domains** — Hiring, Lending, Education, Health Insurance, Government Welfare
- **Counterfactual Testing** — 3–4 controlled demographic swaps per audit
- **Threshold Sensitivity** — Tested across 9 cutpoints from 0.1 → 0.9
- **Gemini AI Explanation** — Plain-language verdict + formal appeal letter
- **Dynamic AI Jury** — Auditor / Challenger / Judge panel computed from real analysis
- **Audit History** — Local session persistence with full replay
- **Batch Audit** — CSV upload for bulk profile testing
- **Shareable Reports** — URL-encoded audit sessions you can share as a link
- **Print / PDF Export** — Download a formatted audit report
- **Onboarding Walkthrough** — First-time user guide built into the UI
- **Fully Offline Fallback** — Deterministic explanations when Gemini API is unavailable

---

## 🗺️ Roadmap

- [ ] Deploy to Vercel (frontend) + Google Cloud Run (backend)
- [ ] Upload real AI model predictions (CSV) for external system auditing
- [ ] Healthcare domain — medical treatment eligibility
- [ ] Housing / rental AI bias simulation
- [ ] SHAP-style feature importance visualization
- [ ] Multilingual support (Hindi, Gujarati, Tamil)
- [ ] WhatsApp / SMS interface for low-tech users in rural areas

---

## 📁 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| AI | Google Gemini 2.5 Flash via `google-genai` SDK |
| Async | `asyncio.gather` for concurrent Gemini calls |
| Caching | LRU in-memory cache (256 slots, 5-min TTL) |
| Validation | Pydantic BaseSettings + BaseModel |
| Logging | Structured JSON logging with request timing middleware |

---

## 🏆 Google Solution Challenge 2026

This project was built for the **Google Solution Challenge 2026** under the **Open Innovation** track.

**Core Innovation:**  
Counterfactual fairness simulation at the individual profile level — not aggregate dataset analysis. Any person who received an AI decision can test it themselves, without needing access to the underlying system.

**Impact Focus:**  
India-specific bias patterns: city tier penalties, caste category discrimination, gender gaps in STEM hiring, age discrimination in insurance AI, regional friction in welfare disbursement.

**Google Tech:**  
Google Gemini 2.5 Flash powers the explanation and appeal generation — turning raw statistical findings into human-readable accountability documents.

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 💙 for people who deserve to know why the AI said no.**

*DecisioLens — Counterfactual Simulation for AI Fairness*

</div>
