import React, { useState } from 'react';
import { runBatchMatch, fetchShortlist, MatchResult } from '../api';
import { ListChecks } from 'lucide-react';

interface Props {
  jobId: string | null;
  candidateIds: string[];
  disabled: boolean;
}

export default function ResultsTable({ jobId, candidateIds, disabled }: Props) {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunMatching = async () => {
    if (!jobId || candidateIds.length === 0) return;
    
    setLoading(true);
    setError('');
    try {
      await runBatchMatch(jobId, candidateIds);
      const shortlist = await fetchShortlist(jobId);
      setResults(shortlist);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-[#146c2e] text-white shadow-sm'; // Material Green
    if (score >= 4) return 'bg-[#8f4e00] text-white shadow-sm'; // Material Orange/Yellow
    return 'bg-[#ba1a1a] text-white shadow-sm'; // Material Red
  };

  return (
    <div className={`bg-md-surface-container p-8 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 ease-md ${disabled ? 'opacity-50 pointer-events-none grayscale-[50%]' : ''}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-medium text-md-on-background flex items-center gap-3">
          <div className="p-2 bg-md-tertiary/10 rounded-full">
            <ListChecks className="w-5 h-5 text-md-tertiary" />
          </div>
          3. Matching Results
        </h2>
        <button 
          onClick={handleRunMatching}
          disabled={loading || disabled || !jobId || candidateIds.length === 0}
          className="h-12 bg-md-tertiary text-white font-medium py-2 px-6 rounded-full hover:bg-md-tertiary/90 active:bg-md-tertiary/80 active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-sm transition-all duration-300 ease-md flex items-center justify-center gap-2 min-w-[200px]"
        >
          {loading ? (
             <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
             </>
          ) : 'Run Batch Match'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50/50 text-red-600 p-4 rounded-[12px] mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      {results.length > 0 ? (
        <div className="overflow-x-auto rounded-[16px] bg-md-surface p-2 shadow-sm border border-md-outline/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-md-on-surface-variant text-sm border-b border-md-outline/10">
                <th className="p-4 font-medium rounded-tl-[12px]">Candidate</th>
                <th className="p-4 font-medium text-center">Score</th>
                <th className="p-4 font-medium w-1/2">Justification</th>
                <th className="p-4 font-medium rounded-tr-[12px]">Top Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-outline/10">
              {results.map(row => (
                <tr key={row.candidate_id} className="group hover:bg-md-secondary-container/30 transition-colors duration-200">
                  <td className="p-4 font-medium text-md-on-background align-top rounded-l-[12px]">
                    {row.name || 'Unknown Candidate'}
                  </td>
                  <td className="p-4 align-top text-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-transform duration-300 group-hover:scale-110 ${getScoreColor(row.score)}`}>
                      {row.score}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-md-on-surface-variant align-top leading-relaxed">
                    {row.justification}
                  </td>
                  <td className="p-4 align-top rounded-r-[12px]">
                    <div className="flex flex-wrap gap-1.5">
                      {row.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="bg-md-surface-container-low text-md-on-surface-variant text-xs px-2.5 py-1 rounded-full border border-md-outline/10">
                          {skill}
                        </span>
                      ))}
                      {row.skills.length > 5 && (
                        <span className="text-xs text-md-tertiary font-medium px-1 py-1">
                          +{row.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-md-on-surface-variant bg-md-surface-container-low rounded-[16px] border-2 border-dashed border-md-outline/20">
          <ListChecks className="w-12 h-12 mx-auto mb-4 text-md-outline opacity-50" />
          <p className="font-medium">Run matching to see the shortlisted candidates.</p>
        </div>
      )}
    </div>
  );
}
