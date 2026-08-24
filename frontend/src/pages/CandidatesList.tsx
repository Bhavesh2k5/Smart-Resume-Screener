import React, { useEffect, useState, useRef } from 'react';
import { fetchCandidates, deleteCandidate, uploadResumes, Candidate } from '../api';
import { Users, FileText, Search, Trash2, Upload } from 'lucide-react';

export default function CandidatesList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCandidates().then(setCandidates).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await deleteCandidate(id);
      setCandidates(candidates.filter(c => c.candidate_id !== id));
    } catch (err) {
      alert('Failed to delete candidate.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const newCandidates = await uploadResumes(e.target.files);
      setCandidates(prev => [...newCandidates, ...prev]);
    } catch (err) {
      alert('Failed to upload resumes.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filtered = candidates.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-md-on-background mb-2">Talent Pool</h1>
          <p className="text-lg text-md-on-surface-variant">View and manage all parsed candidate resumes.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-md-on-surface-variant" />
             <input 
               type="text"
               placeholder="Search by name or skill..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-12 pl-12 pr-4 rounded-full bg-md-surface-container-low border border-md-outline/20 focus:border-md-primary outline-none transition-colors"
             />
          </div>
          <input 
            type="file" 
            multiple 
            accept="application/pdf"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-md-primary text-white font-medium hover:bg-md-primary/90 active:scale-95 disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
          >
            {uploading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Upload className="w-5 h-5" />
            )}
            Upload
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-md-surface-container rounded-[24px]"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(cand => (
            <div key={cand.candidate_id} className="group bg-md-surface-container p-6 rounded-[24px] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-md border border-md-outline/5 relative">
              <button 
                onClick={() => handleDelete(cand.candidate_id)}
                className="absolute top-4 right-4 p-2 text-md-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Candidate"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4 mb-4 pr-10">
                <div className="p-3 bg-md-tertiary/10 rounded-full text-md-tertiary">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-md-on-background">{cand.name || 'Unknown Candidate'}</h3>
                  <p className="text-sm text-md-on-surface-variant line-clamp-2 mt-1">{cand.summary || 'No summary available.'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {cand.experience && cand.experience.length > 0 && (
                  <div className="text-sm">
                     <span className="font-semibold text-md-on-background">Latest Role: </span>
                     <span className="text-md-on-surface-variant">{cand.experience[0].role} @ {cand.experience[0].company} ({cand.experience[0].years}y)</span>
                  </div>
                )}
                
                <div>
                  <div className="flex flex-wrap gap-2">
                    {cand.skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="bg-md-surface text-md-on-surface-variant text-xs font-medium px-3 py-1 rounded-full border border-md-outline/10">
                        {skill}
                      </span>
                    ))}
                    {cand.skills.length > 6 && (
                      <span className="text-xs font-medium px-2 py-1 text-md-primary">+{cand.skills.length - 6} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 bg-md-surface-container-low rounded-[32px] border-2 border-dashed border-md-outline/20">
              <p className="text-md-on-surface-variant text-lg">No candidates found in the pool.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
