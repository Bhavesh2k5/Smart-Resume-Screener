from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models
from typing import List

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("", response_model=schemas.JobResponse, status_code=201)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(title=job.title, description=job.description)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return schemas.JobResponse(job_id=db_job.id, title=db_job.title, description=db_job.description)

@router.get("", response_model=List[schemas.JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.Job).all()
    return [schemas.JobResponse(job_id=j.id, title=j.title, description=j.description) for j in jobs]

@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return schemas.JobResponse(job_id=job.id, title=job.title, description=job.description)

@router.put("/{job_id}", response_model=schemas.JobResponse)
def update_job(job_id: str, job_update: schemas.JobUpdate, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_update.title is not None:
        job.title = job_update.title
    if job_update.description is not None:
        job.description = job_update.description
        
    db.commit()
    db.refresh(job)
    return schemas.JobResponse(job_id=job.id, title=job.title, description=job.description)

@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return None

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
