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
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-600" />
        2. Resume Upload
      </h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 mb-4 hover:bg-gray-100 transition-colors">
        <input 
          type="file" 
          multiple 
          accept="application/pdf"
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || disabled}
          className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Uploading & Extracting...' : 'Select PDF Resumes'}
        </button>
        <p className="text-sm text-gray-500 mt-2">Only PDF files are supported.</p>
      </div>

      {candidates.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="font-medium text-gray-700 border-b pb-2">Uploaded Candidates ({candidates.length})</h3>
          {candidates.map(c => (
            <div key={c.candidate_id} className="bg-blue-50 border border-blue-100 p-3 rounded text-sm">
              <div className="flex items-center gap-2 font-medium text-blue-900 mb-1">
                <FileText className="w-4 h-4" />
                {c.name || 'Unknown Candidate'}
                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {c.skills.slice(0, 10).map((skill, i) => (
                  <span key={i} className="bg-white text-blue-800 text-xs px-2 py-0.5 rounded border border-blue-200">
                    {skill}
                  </span>
                ))}
                {c.skills.length > 10 && <span className="text-xs text-blue-600">+{c.skills.length - 10} more</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
