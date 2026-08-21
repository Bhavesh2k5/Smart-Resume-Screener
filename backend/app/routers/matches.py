from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, models
from ..services.llm_matcher import compute_match

router = APIRouter(prefix="/api/match", tags=["matches"])

@router.post("", response_model=schemas.MatchResponse, status_code=201)
def match_single(request: schemas.MatchRequest, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    candidate = db.query(models.Candidate).filter(models.Candidate.id == request.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    candidate_json = {
        "skills": candidate.skills,
        "experience": candidate.experience,
        "education": candidate.education,
        "summary": candidate.summary
    }
    
    try:
        match_result = compute_match(candidate_json, job.description)
        
        db_match = models.Match(
            candidate_id=candidate.id,
            job_id=job.id,
            score=match_result.get("score", 1),
            justification=match_result.get("justification", "")
        )
        db.add(db_match)
        db.commit()
        db.refresh(db_match)
        
        return schemas.MatchResponse(
            match_id=db_match.id,
            candidate_id=db_match.candidate_id,
            job_id=db_match.job_id,
            score=db_match.score,
            justification=db_match.justification
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to compute match")

@router.post("/batch", response_model=List[schemas.MatchResponse], status_code=200)
def match_batch(request: schemas.BatchMatchRequest, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    results = []
    for cid in request.candidate_ids:
        candidate = db.query(models.Candidate).filter(models.Candidate.id == cid).first()
        if not candidate:
            continue
            
        candidate_json = {
            "skills": candidate.skills,
            "experience": candidate.experience,
            "education": candidate.education,
            "summary": candidate.summary
        }
        
        try:
            match_result = compute_match(candidate_json, job.description)
            db_match = models.Match(
                candidate_id=candidate.id,
                job_id=job.id,
                score=match_result.get("score", 1),
                justification=match_result.get("justification", "")
            )
            db.add(db_match)
            db.commit()
            db.refresh(db_match)
            results.append(db_match)
        except Exception:
            db.rollback()
            continue
            
    results.sort(key=lambda x: x.score, reverse=True)
    
    return [
        schemas.MatchResponse(
            match_id=m.id,
            candidate_id=m.candidate_id,
            job_id=m.job_id,
            score=m.score,
            justification=m.justification
        ) for m in results
    ]
