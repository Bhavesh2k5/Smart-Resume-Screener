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

@router.get("", response_model=List[schemas.CandidateResponse])
def list_resumes(db: Session = Depends(get_db)):
    candidates = db.query(models.Candidate).all()
    return [
        schemas.CandidateResponse(
            candidate_id=c.id,
            name=c.name,
            skills=c.skills,
            experience=c.experience,
            education=c.education,
            summary=c.summary
        ) for c in candidates
    ]

@router.get("/{candidate_id}", response_model=schemas.CandidateResponse)
def get_resume(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return schemas.CandidateResponse(
        candidate_id=c.id,
        name=c.name,
        skills=c.skills,
        experience=c.experience,
        education=c.education,
        summary=c.summary
    )

@router.put("/{candidate_id}", response_model=schemas.CandidateResponse)
def update_resume(candidate_id: str, candidate_update: schemas.CandidateUpdate, db: Session = Depends(get_db)):
    c = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    if candidate_update.name is not None:
        c.name = candidate_update.name
    if candidate_update.skills is not None:
        c.skills = candidate_update.skills
    if candidate_update.experience is not None:
        c.experience = candidate_update.experience
    if candidate_update.education is not None:
        c.education = candidate_update.education
    if candidate_update.summary is not None:
        c.summary = candidate_update.summary
        
    db.commit()
    db.refresh(c)
    return schemas.CandidateResponse(
        candidate_id=c.id,
        name=c.name,
        skills=c.skills,
        experience=c.experience,
        education=c.education,
        summary=c.summary
    )

@router.delete("/{candidate_id}", status_code=204)
def delete_resume(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(c)
    db.commit()
    return None
