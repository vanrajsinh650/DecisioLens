<p align="center">
  <img src="assets/logo.png" alt="DecisioLens Logo" width="120" />
</p>

<h1 align="center">DecisioLens</h1>

<p align="center">
  <strong>Test whether an AI decision was fair, without needing access to the AI.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-green.svg" alt="Python" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.136-teal.svg" alt="FastAPI" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js" /></a>
  <a href="https://aistudio.google.com"><img src="https://img.shields.io/badge/Gemini-2.5_Flash-orange.svg" alt="Gemini" /></a>
</p>

---

## Overview

AI systems decide who gets hired, who gets a loan, who gets admitted, who gets their insurance claim paid, and who qualifies for government benefits. Most of the time, the people affected by these decisions have no visibility into why they were rejected and no clear path to challenge the outcome.

DecisioLens is a simulation tool that tests how a decision behaves under small controlled changes. You enter a profile, set a threshold, and we run the numbers swapping gender, city, caste category, employment type, or age group, and show you whether the outcome holds up or falls apart.

If the decision flips when only gender changes, that is a problem worth knowing about.

> We don't need access to the original AI system. We build our own domain-specific scoring model, run the same logic across variation profiles, and surface the patterns. It's simulation-based auditing at the individual level, not aggregate dataset analysis.

---

## How It Works

```
Enter a profile
      |
Domain-specific scoring formula runs
      |
We test 9 different decision thresholds (0.1 to 0.9)
      |
We build 3-4 counterfactual clones (gender swap, city change, category change, etc.)
      |
We score and decide every clone
      |
We flag: outcome flips, suspicious score gaps, borderline zones
      |
Risk score (0-100) + confidence zone classification
      |
Gemini 2.5 Flash writes the explanation and appeal letter
```

Each step is a separate module. The Gemini explanation, appeal, and right-to-explanation calls run in parallel, while circuit-breaker failures are counted once per audit request.

---

## Domains

| Domain | Who It's For | Variables We Swap |
|---|---|---|
| Hiring | Job applicant rejected by an automated screener | Gender, city, college tier |
| Lending | Loan applicant denied by a credit AI | Gender, employment type, city |
| Education | Student rejected by a college admission system | Gender, city, caste category, income band |
| Health Insurance | Patient whose claim was auto-rejected | Age group, pre-existing condition, city tier |
| Govt. Welfare | Citizen denied PM-KISAN or similar schemes | Social category, region, gender |

Every domain has its own scoring formula where the demographic variables actually affect the output. The bias you detect is not manufactured. It reflects the kinds of penalties these systems apply in practice.

---

## What an Audit Returns

```json
{
  "original": { "score": 0.481, "decision": "REJECT", "threshold": 0.5 },
  "threshold_analysis": [ ... ],     // decision at each of 9 threshold points
  "variations": [ ... ],             // outcome for each counterfactual clone
  "insights": {
    "instability": true,
    "bias_detected": true,
    "risk_score": 72,
    "risk_level": "HIGH",
    "reason_tags": ["gender_sensitive", "threshold_sensitive"]
  },
  "human_review": {
    "level": "REQUIRED",             // REQUIRED / RECOMMENDED / NOT_REQUIRED
    "reason": "..."                  // plain-language justification
  },
  "recourse": [                      // concrete steps that could flip the decision
    { "action": "...", "impact": "..." }
  ],
  "explanation": "...",              // Gemini plain-language audit summary
  "appeal": "...",                   // Gemini formal appeal letter
  "explanation_request": "...",      // Gemini formal right-to-explanation letter
  "ai_jury_view": {
    "auditor": "bias detected (1 flag)",
    "challenger": "unstable",
    "judge": "high risk (score=72)"
  }
}
```

### Human Review Recommendation

Every audit ends with a human oversight recommendation based on three criteria:

| Level | Triggers When |
|---|---|
| REQUIRED | Risk score above 70, OR bias detected, OR confidence zone is Unstable |
| RECOMMENDED | Risk score above 35, OR any threshold or variation flips |
| NOT_REQUIRED | Decision is stable across all tests |

This is designed around regulatory expectations in the EU AI Act and India's DPDP Act, which require that high-risk automated decisions include a human review pathway.

### Actionable Recourse

Instead of just saying "this looks risky", DecisioLens tells you what you can actually do. For rejected decisions it generates:

- Which threshold level would have accepted the profile
- How much the primary score needs to improve to cross the threshold
- Which demographic variable to request a review of (when bias was detected)
- Whether to ask for human review (when instability or bias flags are present)

### Right-to-Explanation Letter

Alongside the appeal letter, DecisioLens generates a separate formal Right-to-Explanation request letter. This is grounded in data protection rights (GDPR Article 22, India DPDP Act) that entitle affected people to:

1. A clear explanation of the logic used
2. The main factors and their weights
3. Disclosure of whether human oversight was applied
4. The right to request human review
5. Details of data categories used

Both letters appear in the same card with a tab switcher. Each has a copy button so it can be sent directly.

---

## Real Example

**Profile:** Riya Shah | Score 66 | 3 years experience | Female | Mumbai | Tier 1 college

**Decision at threshold 0.50:** REJECT

| Variation | Score | Decision | Flipped? |
|---|---|---|---|
| Original (Riya) | 0.481 | REJECT | |
| Gender -> Male | 0.511 | ACCEPT | Yes |
| Location -> Nagpur | 0.441 | REJECT | No |
| College -> Tier 2 | 0.461 | REJECT | No |

Risk score: 72/100 (HIGH). The decision changes only when gender changes. That is the finding.

Gemini then writes: *"A male candidate with the same qualifications would have been accepted at this threshold. This is consistent with gender proxy bias and the applicant has grounds to request a manual review."*

---

## Architecture

```
decisiolens/
|-- backend/
|   |-- ai/gemini.py              Gemini 2.5 Flash, async, singleton, offline fallback
|   |-- core/
|   |   |-- model.py              5 domain-specific scoring formulas
|   |   |-- scenario.py           Counterfactual variation generator
|   |   |-- analysis.py           Instability and bias detection
|   |   |-- threshold.py          9-point sensitivity tester
|   |   |-- cache.py              LRU cache (256 slots, 5-min TTL)
|   |   `-- config.py             Pydantic settings via .env
|   |-- schemas/
|   |   |-- request.py            Flexible multi-domain input (extra="forbid")
|   |   `-- response.py           Typed AuditResponse
|   |-- services/audit_service.py Full pipeline orchestrator
|   `-- routers/audit.py          HTTP layer only
|
`-- frontend/
    `-- src/
        |-- features/
        |   |-- audit/            Input form and live results
        |   |-- results/          Verdict report (7 sections)
        |   |-- history/          Past audit sessions
        |   `-- batch/            CSV bulk testing
        `-- lib/domains/
            |-- hiring.ts
            |-- lending.ts
            |-- education.ts
            |-- insurance.ts
            `-- welfare.ts
```

---

## Quick Start

### Docker Compose (production-like)

**Requirements:** Docker Desktop / Docker Engine with Compose.

```bash
copy .env.example .env
docker compose up --build
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/health`

Before deploying, edit `.env` and set:

```env
AUDIT_API_KEY=replace-with-a-long-random-secret
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
CORS_ORIGINS=["https://your-frontend-domain.com"]
ALLOWED_HOSTS=["your-api-domain.com","backend"]
SECURE_HSTS_SECONDS=31536000
```

Keep `SECURE_HSTS_SECONDS=0` unless the backend is served only over HTTPS. API docs are disabled by default in Docker/production; set `API_DOCS_ENABLED=true` only for trusted environments.

### Manual Local Development

**Requirements:** Python 3.11+, Node.js 18+, a free [Google AI Studio](https://aistudio.google.com) API key.

**Backend**

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Create `backend/.env` before starting the API:

```env
GEMINI_API_KEY=your_key_here
AUDIT_API_KEY=replace-with-a-server-only-secret
DEBUG=true
API_DOCS_ENABLED=true
CORS_ORIGINS=["http://localhost:3000"]
ALLOWED_HOSTS=["localhost","127.0.0.1"]
# Optional: keep ingress/proxy limits aligned with this value
MAX_REQUEST_BODY_BYTES=131072
```

API at `http://127.0.0.1:8000`. Swagger docs are available at `/docs` when `API_DOCS_ENABLED=true`.

**Frontend**

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Set `frontend/.env.local` to the backend URL and the same server-only audit key:

```env
BACKEND_API_BASE=http://127.0.0.1:8000
AUDIT_API_KEY=replace-with-a-server-only-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The browser never receives the audit API key. Client calls go to the same-origin Next.js route (`/api/audit/run`), and that server route attaches `X-API-Key` when forwarding to FastAPI.

Open `http://localhost:3000`

### Docker/Production Notes

- `backend/Dockerfile` runs FastAPI with Uvicorn workers as a non-root user and includes a `/health` probe.
- `frontend/Dockerfile` uses Next.js standalone output, runs as a non-root user, and serves through `node server.js`.
- `docker-compose.yml` wires the frontend BFF to the backend over the internal Docker network (`BACKEND_API_BASE=http://backend:8000`).
- The browser only calls same-origin Next.js routes. `AUDIT_API_KEY` stays server-side and is forwarded from the frontend container to the backend container as `X-API-Key`.
- Configure explicit `CORS_ORIGINS` and `ALLOWED_HOSTS` for every deployed domain. Wildcards are rejected when `DEBUG=false`.
- Mirror `MAX_REQUEST_BODY_BYTES` at your load balancer/API gateway so large bodies are rejected before they reach the app.

---

## API

```
POST /audit/run
```

Direct backend calls must include the backend-only header `X-API-Key: <AUDIT_API_KEY>`. Browser clients should call the frontend proxy route instead: `POST /api/audit/run`.

```json
{
  "domain": "hiring",
  "threshold": 0.5,
  "profile": {
    "name": "Riya Shah",
    "score": 66,
    "experience": 3,
    "interview_score": 72,
    "gender": "Female",
    "location": "Mumbai",
    "college": "Tier 1"
  }
}
```

The backend enforces domain-critical fields before scoring; incomplete profiles are rejected instead of being scored from defaults. All profile values must be primitive JSON values (`string`, `number`, `boolean`, or `null`) — nested objects and arrays are rejected.

| Domain | Required business fields |
|---|---|
| Hiring | `score`, `experience`, `interview_score`, plus `college` or `education` |
| Lending | `credit_score`, `income`, `loan_amount`, `employment_type`, `employment_years` |
| Education | `score`, `grade_12`, `income_band`, `category`, `extracurricular`, `college` |
| Insurance | `age`, `claim_amount`, `policy_tenure`, `city_tier`, `pre_existing`, `coverage_amount` |
| Welfare | `annual_income`, `family_size`, `land_holding`, `employment_status`, `housing_status`, `aadhaar_linked`, `state_tier`, `category` |
| Custom | `score` plus any primitive top-level custom fields |

Request bodies are capped before JSON parsing by backend middleware (`MAX_REQUEST_BODY_BYTES`, default `131072`). Mirror this limit at Cloud Run/API Gateway/load-balancer ingress for production deployments.

```
GET /health  ->  { "status": "ok" }
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| AI | Google Gemini 2.5 Flash via google-genai SDK |
| Async | asyncio.gather for concurrent Gemini calls |
| Cache | In-memory LRU (256 slots, 5-minute TTL) |
| Logging | Structured JSON with request timing middleware |

---

## UN Sustainable Development Goals

SDG 10 (Reduced Inequalities) and SDG 16 (Justice and Strong Institutions) are the core. The other domains extend this: SDG 8 for hiring, SDG 4 for education, SDG 3 for health insurance, SDG 1 for welfare.

A single tool that touches six SDGs is only possible because the underlying problem is the same in every domain: an automated decision was made, a person was affected, and there was no accountability layer.

---



## What We're Building Next

- Let users upload real AI predictions via CSV for external system testing
- Housing and rental application domain
- SHAP-style feature importance visualization
- Hindi, Gujarati, Tamil language support

---

## Google Solution Challenge 2026

Built for the Open Innovation track. The core idea is that AI fairness tools typically require model access, training data, or engineering knowledge. DecisioLens requires none of those. Just a profile and a decision. Anyone can use it.

---

## License

MIT. See [LICENSE](LICENSE).

---

*DecisioLens - Built for Google Solution Challenge 2026*
