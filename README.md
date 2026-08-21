# Smart Resume Screener

Intelligently parse resumes, extract skills, and match them with job descriptions using an LLM.

## Architecture Diagram

```
                        ┌─────────────────────┐
                        │   Frontend Dashboard │
                        │  (React + Tailwind)  │
                        └──────────┬───────────┘
                                   │ REST/JSON
                        ┌──────────▼───────────┐
                        │     Backend API      │
                        │ (Python / FastAPI)   │
                        └───┬───────────┬───────┘
                            │           │
              ┌─────────────▼──┐   ┌────▼─────────────┐
              │ Resume Parser  │   │  LLM Match Engine │
              │ (pdfplumber)   │   │  (Gemini API)     │
              └─────────────┬──┘   └────┬─────────────┘
                            │           │
                        ┌───▼───────────▼───┐
                        │      Database     │
                        │ (PostgreSQL)      │
                        └───────────────────┘
```

## Tech Stack
- **Backend:** Python 3.11, FastAPI
- **Database:** PostgreSQL, SQLAlchemy, Alembic
- **LLM provider:** Gemini API (substituted from Anthropic Claude API as requested)
- **PDF parsing:** pdfplumber
- **Frontend:** React (Vite) + TypeScript + Tailwind CSS

## Setup Instructions

1. `cp .env.example .env` and fill in `GEMINI_API_KEY`
2. `docker-compose up --build -d`
3. Wait for the database to be ready. Then run the migrations:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```
4. Access the frontend at `http://localhost:5173`
5. Access the backend Swagger UI at `http://localhost:8000/docs`

## API Reference

- `POST /api/jobs` - Create a job description
- `POST /api/resumes/upload` - Upload PDF resumes and extract structured data
- `POST /api/match` - Match a single candidate against a job
- `POST /api/match/batch` - Run batch matching for multiple candidates
- `GET /api/jobs/{job_id}/shortlist` - Get ranked shortlist

## Exact LLM Prompts Used

### Extraction Prompt
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

### Match Scoring Prompt
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

## Sample Input / Output
- **Input**: A PDF file and a text-based job description.
- **Output**: JSON containing a match score out of 10 and a textual justification for the score.

## Known Limitations
- Batch matching is sequential, not parallelized.
- PDF parsing may fail on scanned/image-only resumes.
- We swapped the Anthropic API for the Gemini API as per user constraints.

## Testing Instructions
Run tests in the backend folder or container:
```bash
docker-compose exec backend pytest tests/
```
