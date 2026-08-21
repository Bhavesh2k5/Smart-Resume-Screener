from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    raw_resume_text = Column(Text, nullable=False)
    skills = Column(JSONB, default=[])
    experience = Column(JSONB, default=[])
    education = Column(JSONB, default=[])
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Match(Base):
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    score = Column(Integer, CheckConstraint('score BETWEEN 1 AND 10'), nullable=False)
    justification = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("Candidate")
    job = relationship("Job")
