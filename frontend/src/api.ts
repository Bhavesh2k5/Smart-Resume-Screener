const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Job {
  job_id: string;
  title: string;
  description: string;
}

export interface Candidate {
  candidate_id: string;
  name: string | null;
  skills: string[];
  experience: any[];
  education: any[];
  summary: string | null;
}

export interface MatchResult {
  candidate_id: string;
  name: string | null;
  score: number;
  justification: string;
  skills: string[];
}

export async function createJob(title: string, description: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function uploadResumes(files: FileList | File[]): Promise<Candidate[]> {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('file', files[i]);
  }
  
  const res = await fetch(`${API_BASE}/api/resumes/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload resumes');
  return res.json();
}

export async function runBatchMatch(job_id: string, candidate_ids: string[]): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/match/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id, candidate_ids }),
  });
  if (!res.ok) throw new Error('Failed to run batch matching');
  return res.json();
}

export async function fetchShortlist(job_id: string): Promise<MatchResult[]> {
  const res = await fetch(`${API_BASE}/api/jobs/${job_id}/shortlist`);
  if (!res.ok) throw new Error('Failed to fetch shortlist');
  return res.json();
}
