from pydantic import BaseModel, Field
from typing import List, Optional, Any
from uuid import UUID

class JobCreate(BaseModel):
    title: str
    description: str

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class JobResponse(BaseModel):
    job_id: UUID
    title: str
    description: str

class Experience(BaseModel):
    role: str
    company: str
    years: float

class Education(BaseModel):
    degree: str
    institution: str

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    summary: Optional[str] = None

class CandidateResponse(BaseModel):
    candidate_id: UUID
    name: Optional[str]
    skills: List[str]
    experience: List[dict]
    education: List[dict]
    summary: Optional[str]

class MatchRequest(BaseModel):
    job_id: UUID
    candidate_id: UUID

class BatchMatchRequest(BaseModel):
    job_id: UUID
    candidate_ids: List[UUID]

class MatchUpdate(BaseModel):
    score: Optional[int] = None
    justification: Optional[str] = None

class MatchResponse(BaseModel):
    match_id: UUID
    candidate_id: UUID
    job_id: UUID
    score: int
    justification: str

class ShortlistResponse(BaseModel):
    candidate_id: UUID
    name: Optional[str]
    score: int
    justification: str
    skills: List[str]
