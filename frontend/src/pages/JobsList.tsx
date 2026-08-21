import React, { useEffect, useState } from 'react';
import { fetchJobs, Job } from '../api';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, ChevronRight } from 'lucide-react';

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs().then(setJobs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-md-on-background mb-2">Jobs</h1>
          <p className="text-lg text-md-on-surface-variant">Manage your open positions.</p>
        </div>
        <Link 
          to="/screener" 
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-md-primary text-md-on-primary font-medium hover:bg-md-primary/90 active:scale-95 transition-all duration-300 ease-md shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create New Job
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-md-surface-container rounded-[24px]"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Link key={job.job_id} to={`/jobs/${job.job_id}`} className="group block">
              <div className="bg-md-surface-container h-full p-6 rounded-[24px] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-md border border-md-outline/5 flex flex-col">
                <div className="p-3 bg-md-primary/10 rounded-full w-fit mb-4 text-md-primary group-hover:bg-md-primary group-hover:text-white transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-md-on-background mb-2 line-clamp-1">{job.title}</h2>
                <p className="text-sm text-md-on-surface-variant line-clamp-3 mb-6 flex-1">{job.description}</p>
                <div className="mt-auto flex items-center text-sm font-medium text-md-primary group-hover:translate-x-1 transition-transform">
                  View details <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
          {jobs.length === 0 && (
            <div className="col-span-full text-center py-16 bg-md-surface-container-low rounded-[32px] border-2 border-dashed border-md-outline/20">
              <p className="text-md-on-surface-variant text-lg">No jobs found. Create one in the Screener.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
