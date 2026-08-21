import React, { useState, useRef } from 'react';
import { uploadResumes, Candidate } from '../api';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface Props {
  onCandidatesExtracted: (candidates: Candidate[]) => void;
  disabled: boolean;
}

export default function ResumeUpload({ onCandidatesExtracted, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    setError('');
    try {
      const extracted = await uploadResumes(e.target.files);
      setCandidates(prev => [...prev, ...extracted]);
      onCandidatesExtracted(extracted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-md-surface-container p-8 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 ease-md ${disabled ? 'opacity-50 pointer-events-none grayscale-[50%]' : ''}`}>
      <h2 className="text-2xl font-medium text-md-on-background mb-6 flex items-center gap-3">
        <div className="p-2 bg-md-primary/10 rounded-full">
          <Upload className="w-5 h-5 text-md-primary" />
        </div>
        2. Resume Upload
      </h2>
      
      {error && (
        <div className="bg-red-50/50 text-red-600 p-4 rounded-[12px] mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}
      
      <div className="group border-2 border-dashed border-md-outline/40 hover:border-md-primary/50 rounded-[24px] p-10 text-center bg-md-surface-container-low hover:bg-md-primary/5 transition-all duration-300 ease-md cursor-pointer flex flex-col items-center justify-center" onClick={() => !loading && !disabled && fileInputRef.current?.click()}>
        <input 
          type="file" 
          multiple 
          accept="application/pdf"
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <div className="w-16 h-16 bg-md-surface-container rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-md-primary/10 transition-all duration-300 ease-md shadow-sm">
          {loading ? (
             <svg className="animate-spin h-8 w-8 text-md-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <Upload className="w-8 h-8 text-md-on-surface-variant group-hover:text-md-primary transition-colors" />
          )}
        </div>
        
        <button 
          disabled={loading || disabled}
          className="bg-md-secondary-container text-md-on-secondary-container font-medium py-3 px-6 rounded-full shadow-sm hover:bg-md-secondary-container/80 hover:shadow-md active:scale-95 transition-all duration-300 ease-md pointer-events-none"
        >
          {loading ? 'Uploading & Extracting...' : 'Select PDF Resumes'}
        </button>
        <p className="text-sm text-md-on-surface-variant mt-4">Only PDF files are supported.</p>
      </div>

      {candidates.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-medium text-md-on-background border-b border-md-outline/20 pb-2">Uploaded Candidates ({candidates.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {candidates.map(c => (
              <div key={c.candidate_id} className="group bg-md-surface p-4 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-md border border-md-outline/10">
                <div className="flex items-center gap-3 font-medium text-md-on-background mb-3">
                  <div className="p-1.5 bg-md-secondary-container rounded-full text-md-on-secondary-container">
                    <FileText className="w-4 h-4" />
                  </div>
                  {c.name || 'Unknown Candidate'}
                  <CheckCircle className="w-5 h-5 text-md-primary ml-auto" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {c.skills.slice(0, 8).map((skill, i) => (
                    <span key={i} className="bg-md-surface-container text-md-on-surface-variant text-xs font-medium px-3 py-1 rounded-full border border-md-outline/10">
                      {skill}
                    </span>
                  ))}
                  {c.skills.length > 8 && (
                    <span className="text-xs font-medium px-3 py-1 text-md-tertiary">
                      +{c.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
