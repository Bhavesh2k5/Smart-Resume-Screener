import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJob, fetchShortlist, Job, MatchResult } from '../api';
import { Briefcase, ArrowLeft, Star } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [shortlist, setShortlist] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchJob(id), fetchShortlist(id).catch(() => [])])
      .then(([j, s]) => {
        setJob(j);
        setShortlist(s);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading job details...</div>;
  if (!job) return <div className="p-8">Job not found.</div>;

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
        <div className="flex items-center gap-4 mb-4">
           <div className="p-3 bg-md-primary text-white rounded-full shadow-md">
             <Briefcase className="w-8 h-8" />
           </div>
           <h1 className="text-4xl font-bold tracking-tight text-md-on-background">{job.title}</h1>
        </div>
      </div>

      <div className="bg-md-surface-container p-8 rounded-[32px] shadow-sm border border-md-outline/5">
        <h2 className="text-lg font-semibold text-md-on-background mb-4">Job Description</h2>
        <p className="whitespace-pre-wrap text-md-on-surface-variant leading-relaxed">
          {job.description}
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-md-on-background mb-6 flex items-center gap-2">
          <Star className="w-6 h-6 text-md-tertiary" /> Shortlisted Candidates
        </h2>
        
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
            <Link to="/screener" className="inline-block mt-4 text-sm font-medium text-md-primary hover:underline">Go to Screener to run matching</Link>
          </div>
        )}
      </div>
    </div>
  );
}
