import { useState } from 'react';
import JobForm from './components/JobForm';
import ResumeUpload from './components/ResumeUpload';
import ResultsTable from './components/ResultsTable';
import { Job, Candidate } from './api';

function App() {
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const candidateIds = candidates.map(c => c.candidate_id);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Smart Resume Screener</h1>
          <p className="mt-2 text-gray-600">Intelligently parse resumes and match them with job descriptions using LLM.</p>
        </header>

        <JobForm onJobCreated={setJob} />

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

export default App;
