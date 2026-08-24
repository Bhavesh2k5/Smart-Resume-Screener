# Smart Resume Screener

An AI-powered, full-stack application built to intelligently parse resumes (PDFs) and match them with specific job descriptions using a semantic matching engine powered by Gemini.

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [LLM Prompts](#llm-prompts)
- [How to Run (Docker)](#how-to-run-docker)
- [Features](#features)

## Architecture

The application is structured as a decoupled full-stack application running in Docker containers, utilizing a PostgreSQL database for persistence.

### Components
1. **Frontend (React + Vite + Tailwind CSS)**: 
   - A multi-page Single Page Application (SPA) utilizing `react-router-dom`.
   - Designed with **Material You (MD3)** design principles (tonal surfaces, rounded cards, transition states).
   - Pages: Dashboard, Jobs List, Candidate Talent Pool, Job Details, and a unified Smart Screener workspace.
   - Features client-side file reading, Excel exports (`xlsx`), and responsive layout components.

2. **Backend (FastAPI + Python)**:
   - A high-performance REST API.
   - Handles PDF parsing (using `pdfplumber`).
   - Integrates with the Google Gemini API (`google-genai` SDK) to extract structured JSON data from resumes and compute matching scores against job descriptions.
   - Utilizes `SQLAlchemy` (with Alembic for migrations) to interface with the PostgreSQL database.
   - Features robust error handling, JSON repair fallback mechanisms for LLM outputs, and CORS support.

3. **Database (PostgreSQL)**:
   - Stores normalized data models: `jobs`, `candidates`, and `matches`.
   - The `matches` table maps a many-to-many relationship containing the computed matching score and the LLM-generated justification.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS 3.4, React Router 6, Lucide React (Icons), XLSX (Excel Export).
- **Backend**: FastAPI, Uvicorn, SQLAlchemy, Alembic, PDFPlumber, Google GenAI SDK (Gemini 2.5 Flash).
- **Database**: PostgreSQL 15.
- **Infrastructure**: Docker, Docker Compose.

## LLM Prompts

The core intelligence of the application relies on two carefully crafted prompts sent to the `gemini-2.5-flash` model. We strictly enforce `response_mime_type="application/json"` to ensure programmatic interoperability.

### 1. Data Extraction Prompt (Resume Parsing)
This prompt converts unstructured PDF text into a predictable JSON schema representing a candidate's profile.

```text
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

### 2. Semantic Matching Prompt (Fit Scoring)
This prompt compares the structured candidate profile against a raw job description string to determine a semantic fit score and a human-readable justification.

```text
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

## How to Run (Docker)

1. **Clone the repository.**
2. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. **Build and Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
4. **Access the Application**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

*Note: The database migrations are applied automatically upon backend startup via the `entrypoint.sh` script.*

## Features
- **Job Management**: Create, read, and delete job postings.
- **Candidate Talent Pool**: Bulk-upload PDFs to instantly parse and store candidates in a searchable database.
- **AI Matching**: Compute match scores and read justifications explaining *why* a candidate fits a role.
- **Excel Export**: Download shortlisted candidates to a cleanly formatted `.xlsx` spreadsheet directly from the Job Details page.
- **Smart Screener Workspace**: A unified workflow to create a job, upload resumes, and view results in one step.
