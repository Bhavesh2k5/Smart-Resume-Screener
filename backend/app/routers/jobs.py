from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("", response_model=schemas.JobResponse, status_code=201)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(title=job.title, description=job.description)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return schemas.JobResponse(job_id=db_job.id, title=db_job.title, description=db_job.description)

@router.get("/{job_id}/shortlist", response_model=list[schemas.ShortlistResponse])
def get_shortlist(job_id: str, db: Session = Depends(get_db)):
    matches = db.query(models.Match).filter(models.Match.job_id == job_id).order_by(models.Match.score.desc()).all()
    results = []
    for match in matches:
        candidate = db.query(models.Candidate).filter(models.Candidate.id == match.candidate_id).first()
        results.append(schemas.ShortlistResponse(
            candidate_id=candidate.id,
            name=candidate.name,
            score=match.score,
            justification=match.justification,
            skills=candidate.skills
        ))
    return results
