import React, { useState, useEffect } from 'react';
import { createJob, fetchJobs, Job } from '../api';
import { Briefcase } from 'lucide-react';

interface Props {
  onJobSelected: (job: Job) => void;
}

export default function JobForm({ onJobSelected }: Props) {
  const [mode, setMode] = useState<'create' | 'select'>('select');
  const [jobs, setJobs] = useState<Job[]>([]);
  
  const [selectedJobId, setSelectedJobId] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs().then(j => {
      setJobs(j);
      if (j.length > 0) setSelectedJobId(j[0].job_id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'select') {
      const j = jobs.find(x => x.job_id === selectedJobId);
      if (j) onJobSelected(j);
      return;
    }
    
    if (!title || !description) return;
    
    setLoading(true);
    setError('');
    try {
      const job = await createJob(title, description);
      onJobSelected(job);
      // Update local cache
      setJobs(prev => [...prev, job]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-md-surface-container p-8 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 ease-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-md-on-background flex items-center gap-3">
          <div className="p-2 bg-md-primary/10 rounded-full">
            <Briefcase className="w-5 h-5 text-md-primary" />
          </div>
          1. Select or Create Job
        </h2>
        <div className="flex bg-md-surface-container-low rounded-full p-1 border border-md-outline/10">
          <button 
            type="button"
            onClick={() => setMode('select')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${mode === 'select' ? 'bg-md-primary text-white shadow-sm' : 'text-md-on-surface-variant hover:text-md-on-background'}`}
          >
            Select Existing
          </button>
          <button 
            type="button"
            onClick={() => setMode('create')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${mode === 'create' ? 'bg-md-primary text-white shadow-sm' : 'text-md-on-surface-variant hover:text-md-on-background'}`}
          >
            Create New
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50/50 text-red-600 p-4 rounded-[12px] mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'select' ? (
          <div>
            <label className="block text-sm font-medium text-md-on-surface-variant mb-2">
              Choose a Job
            </label>
            {jobs.length > 0 ? (
              <select 
                className="w-full bg-md-surface-container-low border-b-2 border-md-outline focus:border-md-primary rounded-t-[12px] rounded-b-none px-4 py-3 outline-none transition-colors duration-200 text-md-on-background cursor-pointer"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobs.map(j => (
                  <option key={j.job_id} value={j.job_id}>{j.title}</option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-md-surface-container-low rounded-[12px] text-md-on-surface-variant text-sm border border-md-outline/10 text-center">
                No jobs available. Please create one.
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-md-on-surface-variant mb-2">
                Job Title
              </label>
              <input 
                type="text"
                className="w-full bg-md-surface-container-low border-b-2 border-md-outline focus:border-md-primary rounded-t-[12px] rounded-b-none px-4 py-3 outline-none transition-colors duration-200 text-md-on-background placeholder:text-md-on-surface-variant/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-md-on-surface-variant mb-2">
                Job Description
              </label>
              <textarea 
                className="w-full bg-md-surface-container-low border-b-2 border-md-outline focus:border-md-primary rounded-t-[12px] rounded-b-none px-4 py-3 outline-none transition-colors duration-200 h-40 resize-y text-md-on-background placeholder:text-md-on-surface-variant/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                disabled={loading}
              />
            </div>
          </>
        )}
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading || (mode === 'create' && (!title || !description)) || (mode === 'select' && jobs.length === 0)}
            className="w-full h-12 bg-md-primary text-md-on-primary font-medium rounded-full hover:bg-md-primary/90 active:bg-md-primary/80 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all duration-300 ease-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'create' ? 'Creating...' : 'Selecting...'}
              </>
            ) : mode === 'create' ? 'Create Job' : 'Select Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
