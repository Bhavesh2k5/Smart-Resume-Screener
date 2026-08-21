from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, models
from ..services.pdf_parser import parse_pdf
from ..services.llm_extractor import extract_resume_data

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

@router.post("/upload", response_model=List[schemas.CandidateResponse], status_code=201)
def upload_resumes(file: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    results = []
    for f in file:
        try:
            content = f.file.read()
            raw_text = parse_pdf(content)
            extracted_data = extract_resume_data(raw_text)
            
            db_candidate = models.Candidate(
                name=extracted_data.get("name") or f.filename,
                raw_resume_text=raw_text,
                skills=extracted_data.get("skills", []),
                experience=extracted_data.get("experience", []),
                education=extracted_data.get("education", []),
                summary=extracted_data.get("summary")
            )
            db.add(db_candidate)
            db.commit()
            db.refresh(db_candidate)
            
            results.append(schemas.CandidateResponse(
                candidate_id=db_candidate.id,
                name=db_candidate.name,
                skills=db_candidate.skills,
                experience=db_candidate.experience,
                education=db_candidate.education,
                summary=db_candidate.summary
            ))
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to process resume upload: {str(e)}")
    return results
