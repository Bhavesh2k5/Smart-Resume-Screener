import React, { useState } from 'react';
import JobForm from '../components/JobForm';
import ResumeUpload from '../components/ResumeUpload';
import ResultsTable from '../components/ResultsTable';
import { Job, Candidate } from '../api';

export default function Screener() {
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const candidateIds = candidates.map(c => c.candidate_id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-md-on-background mb-3">
          Smart Screener
        </h1>
        <p className="text-lg text-md-on-surface-variant max-w-2xl leading-relaxed">
          Create a job, upload resumes, and run the semantic matching engine all in one workflow.
        </p>
      </header>

      <div className="space-y-12 max-w-4xl">
        <JobForm onJobSelected={setJob} />

        <ResumeUpload 
          onCandidatesExtracted={(newCandidates) => setCandidates(prev => [...prev, ...newCandidates])} 
          disabled={!job}
        />

        <ResultsTable 
          jobId={job?.job_id || null} 
          candidateIds={candidateIds} 
          disabled={!job || candidates.length === 0}
        />
      </div>
    </div>
  );
}
