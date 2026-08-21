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
    if (score >= 7) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-blue-600" />
          3. Matching Results
        </h2>
        <button 
          onClick={handleRunMatching}
          disabled={loading || disabled || !jobId || candidateIds.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Running Matching...' : 'Run Batch Match'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-3 font-medium">Candidate</th>
                <th className="p-3 font-medium text-center">Score</th>
                <th className="p-3 font-medium w-1/2">Justification</th>
                <th className="p-3 font-medium">Top Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map(row => (
                <tr key={row.candidate_id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900 align-top">
                    {row.name || 'Unknown Candidate'}
                  </td>
                  <td className="p-3 align-top text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold border ${getScoreColor(row.score)}`}>
                      {row.score}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 align-top">
                    {row.justification}
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {row.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {row.skills.length > 5 && (
                        <span className="text-xs text-gray-400">+{row.skills.length - 5}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
          <ListChecks className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Run matching to see the shortlisted candidates.</p>
        </div>
      )}
    </div>
  );
}
