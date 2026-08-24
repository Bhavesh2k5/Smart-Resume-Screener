import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJob, fetchShortlist, uploadResumes, runBatchMatch, Job, MatchResult } from '../api';
import { Briefcase, ArrowLeft, Star, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [shortlist, setShortlist] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  const loadData = (jobId: string) => {
    Promise.all([fetchJob(jobId), fetchShortlist(jobId).catch(() => [])])
      .then(([j, s]) => {
        setJob(j);
        setShortlist(s);
      })
      .finally(() => setLoading(false));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !id) return;
    
    setUploading(true);
    try {
      const candidates = await uploadResumes(e.target.files);
      const candidateIds = candidates.map(c => c.candidate_id);
      
      if (candidateIds.length > 0) {
        await runBatchMatch(id, candidateIds);
        const newShortlist = await fetchShortlist(id);
        setShortlist(newShortlist);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload and match resumes.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (!job || shortlist.length === 0) return;
    
    const data = shortlist
      .sort((a, b) => b.score - a.score)
      .map(cand => ({
        Name: cand.name || 'Unknown Candidate',
        Score: cand.score,
        'Matched Skills': cand.skills.join(', '),
        Justification: cand.justification
      }));
      
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    // Excel sheet names are limited to 31 characters
    let sheetName = job.title.substring(0, 31);
    // Remove invalid characters for sheet names (\, /, ?, *, [, ])
    sheetName = sheetName.replace(/[\/\\\?\*\[\]]/g, '');
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Candidates');
    XLSX.writeFile(wb, `${job.title} - Candidates.xlsx`);
  };

  if (loading) return <div className="p-8 animate-pulse text-md-on-surface-variant">Loading job details...</div>;
  if (!job) return <div className="p-8 text-red-500">Job not found.</div>;

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-[#146c2e] text-white'; 
    if (score >= 4) return 'bg-[#8f4e00] text-white'; 
    return 'bg-[#ba1a1a] text-white'; 
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <Link to="/jobs" className="inline-flex items-center text-sm font-medium text-md-primary hover:bg-md-primary/10 px-4 py-2 rounded-full transition-colors mb-4 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-md-primary text-white rounded-full shadow-md">
               <Briefcase className="w-8 h-8" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-md-on-background">{job.title}</h1>
           </div>
           
           <div className="flex items-center gap-3">
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
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-md-tertiary text-white font-medium hover:bg-md-tertiary/90 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
              >
                {uploading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {uploading ? 'Processing...' : 'Upload & Match'}
              </button>
           </div>
        </div>
      </div>

      <div className="bg-md-surface-container p-8 rounded-[32px] shadow-sm border border-md-outline/5">
        <h2 className="text-lg font-semibold text-md-on-background mb-4">Job Description</h2>
        <p className="whitespace-pre-wrap text-md-on-surface-variant leading-relaxed">
          {job.description}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-md-on-background flex items-center gap-2">
            <Star className="w-6 h-6 text-md-tertiary" /> Shortlisted Candidates
          </h2>
          
          {shortlist.length > 0 && (
            <button 
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-container-highest active:scale-95 transition-all shadow-sm border border-md-outline/10 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          )}
        </div>
        
        {shortlist.length > 0 ? (
          <div className="space-y-4">
            {shortlist.sort((a,b) => b.score - a.score).map(cand => (
              <div key={cand.candidate_id} className="bg-md-surface-container-low p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                 <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full font-bold text-2xl shadow-md ${getScoreColor(cand.score)}`}>
                      {cand.score}
                    </span>
                    <span className="text-xs font-medium text-md-on-surface-variant mt-2">Match Score</span>
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xl font-bold text-md-on-background mb-2">{cand.name || 'Unknown Candidate'}</h3>
                    <p className="text-sm text-md-on-surface-variant mb-4">{cand.justification}</p>
                    <div className="flex flex-wrap gap-2">
                      {cand.skills.map((skill, i) => (
                        <span key={i} className="bg-md-surface text-md-on-surface-variant text-xs font-medium px-3 py-1 rounded-full border border-md-outline/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-md-surface-container-low rounded-[24px] border-2 border-dashed border-md-outline/20">
            <p className="text-md-on-surface-variant">No candidates have been shortlisted for this job yet.</p>
            <button onClick={() => fileInputRef.current?.click()} className="inline-block mt-4 text-sm font-medium text-md-primary hover:underline">
              Upload resumes now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
