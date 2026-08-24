<div align="center">

# 🧠 Smart Resume Screener

### *AI-powered hiring intelligence, built for the modern recruiter.*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-smart--resume--screener-6750A4?style=for-the-badge&logoColor=white)](https://smart-resume-screener-olive.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Bhavesh2k5-181717?style=for-the-badge&logo=github)](https://github.com/Bhavesh2k5/Smart-Resume-Screener)
[![Backend](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://resume-screener-api-67ap.onrender.com/docs)
[![Powered By](https://img.shields.io/badge/Powered%20By-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

<br/>

> Upload a job description. Drop in resumes. Get an AI-ranked shortlist in seconds.  
> No spreadsheets. No manual screening. Just results.

<br/>

![Demo Banner](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Gemini](https://img.shields.io/badge/Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## ✨ What Makes This Special?

<table>
<tr>
<td width="50%">

### 🤖 AI-Driven Parsing
Drop in any PDF resume and Gemini 2.5 Flash instantly extracts structured data — name, skills, experience, education, and a concise summary — all formatted as clean, queryable JSON.

</td>
<td width="50%">

### 🎯 Semantic Matching
Forget keyword matching. Our LLM engine *understands* job descriptions and candidate profiles, rating fit on a **1–10 scale** with a written justification of strengths and gaps.

</td>
</tr>
<tr>
<td width="50%">

### 📊 Excel Export
One-click export of your entire shortlisted talent pool to a beautifully formatted `.xlsx` spreadsheet, automatically named after the job role.

</td>
<td width="50%">

### 🎨 Material You Design
A stunning, fully responsive UI built on Google's **Material Design 3** system — organic blur shapes, tonal surfaces, pill buttons, and smooth transitions throughout.

</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                        │
│          React 18 + Vite + Tailwind CSS (Material You)      │
│   Dashboard │ Jobs │ Candidates │ Job Detail │ Screener     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (VITE_API_URL)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────┐   │
│  │ PDF Parser  │──▶│ LLM Extractor│──▶│  LLM Matcher   │   │
│  │ (pdfplumber)│   │   (Gemini)   │   │   (Gemini)     │   │
│  └─────────────┘   └──────────────┘   └────────────────┘   │
│                           │                    │            │
│                           ▼                    ▼            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SQLAlchemy ORM + Alembic                  │ │
│  └──────────────────────────┬─────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DB                          │
│                                                             │
│    ┌──────────┐    ┌─────────────┐    ┌──────────────┐     │
│    │   jobs   │───▶│   matches   │◀───│  candidates  │     │
│    │          │    │ score, why  │    │  skills, exp │     │
│    └──────────┘    └─────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 LLM Prompt Engineering

The two core prompts are designed with strict JSON enforcement (`response_mime_type="application/json"`) and temperature tuning for precision and consistency.

<details>
<summary><b>📄 Prompt 1 — Resume Extraction (temp: 0.1)</b></summary>

```
You are a resume parser. Extract the following from this resume text
and return ONLY valid JSON, no commentary, no markdown code fences:

{
  "name": string or null,
  "skills": [string],
  "experience": [{ "role": string, "company": string, "years": number }],
  "education": [{ "degree": string, "institution": string }],
  "summary": string (maximum 2 sentences)
}

Resume text:
<<<{resume_text}>>>
```

> **Why it works:** Low temperature (0.1) enforces deterministic, factual extraction. The `<<<` delimiters clearly separate the instruction from the user-supplied content to prevent prompt injection.

</details>

<details>
<summary><b>🎯 Prompt 2 — Semantic Fit Scoring (temp: 0.2)</b></summary>

```
Compare the following candidate profile with this job description
and rate fit on a scale of 1 to 10. Return ONLY valid JSON, no
commentary, no markdown code fences:

{
  "score": number (1-10),
  "justification": string (2-3 sentences explaining strengths and gaps)
}

Candidate profile:
<<<{structured_candidate_json}>>>

Job description:
<<<{job_description}>>>
```

> **Why it works:** The structured JSON candidate profile gives Gemini a clean semantic understanding of the candidate. Requesting a written `justification` forces the model to reason before scoring, improving accuracy. The score is clamped server-side to `[1, 10]` as a safety net.

</details>

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 18 + Vite | Fast, modern SPA |
| **Styling** | Tailwind CSS 3.4 + Material You | Visual design system |
| **Routing** | React Router 6 | Multi-page navigation |
| **Icons** | Lucide React | Consistent icon set |
| **Excel Export** | SheetJS (xlsx) | Client-side spreadsheet generation |
| **API** | FastAPI + Uvicorn | High-performance Python backend |
| **ORM** | SQLAlchemy + Alembic | Database abstraction & migrations |
| **PDF Parsing** | pdfplumber | Text extraction from resumes |
| **AI** | Google Gemini 2.5 Flash | Resume parsing & semantic matching |
| **Database** | PostgreSQL 15 | Relational data persistence |
| **Containers** | Docker + Docker Compose | Local development environment |

---

## 🚀 Run It Locally (2 minutes)

**Prerequisites:** Docker Desktop installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/Bhavesh2k5/Smart-Resume-Screener.git
cd Smart-Resume-Screener

# 2. Create your environment file
cp .env.example .env
# Then open .env and add your GEMINI_API_KEY

# 3. Launch everything with one command
docker-compose up --build
```

| Service | URL |
|---|---|
| 🖥️ Frontend App | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 API Swagger Docs | http://localhost:8000/docs |

> Database migrations run automatically on backend startup. No manual setup needed!

---

## 📱 App Pages

| Page | Description |
|---|---|
| **🏠 Dashboard** | Overview metrics — total jobs, candidates, and recent activity |
| **💼 Jobs** | Create, browse, and delete job postings |
| **🔍 Job Detail** | Upload resumes for a specific job, view AI match scores, export to Excel |
| **👥 Talent Pool** | Searchable database of all parsed candidates with skill filtering |
| **⚡ Smart Screener** | Unified 3-step workspace: create job → upload resumes → view results |

---

## 🌐 Deployment

| Service | Provider | URL |
|---|---|---|
| Frontend | Vercel | [smart-resume-screener-olive.vercel.app](https://smart-resume-screener-olive.vercel.app) |
| Backend API | Render | [resume-screener-api-67ap.onrender.com](https://resume-screener-api-67ap.onrender.com/docs) |
| Database | Neon (PostgreSQL) | Managed serverless Postgres |

---

<div align="center">

Built with ❤️ by **Bhavesh**  

*Powered by Google Gemini · Deployed on Vercel & Render*

</div>
