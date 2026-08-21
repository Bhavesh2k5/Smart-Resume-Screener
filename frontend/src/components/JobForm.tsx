import React, { useState } from 'react';
import { createJob, Job } from '../api';
import { Briefcase } from 'lucide-react';

interface Props {
  onJobCreated: (job: Job) => void;
}

export default function JobForm({ onJobCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setLoading(true);
    setError('');
    try {
      const job = await createJob(title, description);
      onJobCreated(job);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-md-surface-container p-8 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 ease-md">
      <h2 className="text-2xl font-medium text-md-on-background mb-6 flex items-center gap-3">
        <div className="p-2 bg-md-primary/10 rounded-full">
          <Briefcase className="w-5 h-5 text-md-primary" />
        </div>
        1. Job Description
      </h2>
      
      {error && (
        <div className="bg-red-50/50 text-red-600 p-4 rounded-[12px] mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading || !title || !description}
            className="w-full h-12 bg-md-primary text-md-on-primary font-medium rounded-full hover:bg-md-primary/90 active:bg-md-primary/80 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all duration-300 ease-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
