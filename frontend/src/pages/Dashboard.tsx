import React, { useEffect, useState } from 'react';
import { fetchJobs, fetchCandidates, Job, Candidate } from '../api';
import { Briefcase, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchJobs(), fetchCandidates()])
      .then(([j, c]) => {
        setJobs(j);
        setCandidates(c);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-8">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Jobs', value: jobs.length, icon: <Briefcase className="w-8 h-8 text-md-primary" />, bg: 'bg-md-primary/10' },
    { title: 'Total Candidates', value: candidates.length, icon: <Users className="w-8 h-8 text-md-tertiary" />, bg: 'bg-md-tertiary/10' },
    { title: 'Active Screenings', value: 'Ready', icon: <Activity className="w-8 h-8 text-md-on-surface-variant" />, bg: 'bg-md-surface-container' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold text-md-on-background tracking-tight mb-2">Welcome Back</h1>
        <p className="text-md-on-surface-variant text-lg">Here's an overview of your recruitment pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-md-surface-container p-6 rounded-[24px] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-md flex items-center gap-6">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-md-on-surface-variant mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-md-on-background">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-md-surface-container-low p-8 rounded-[32px] border border-md-outline/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-md-on-background">Recent Jobs</h2>
            <Link to="/jobs" className="text-sm font-medium text-md-primary hover:bg-md-primary/10 px-4 py-2 rounded-full transition-colors">View All</Link>
          </div>
          <div className="space-y-3">
            {jobs.slice(-3).reverse().map(job => (
              <Link to={`/jobs/${job.job_id}`} key={job.job_id} className="block group">
                <div className="bg-md-surface p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-md-outline/5">
                  <h3 className="font-medium text-md-on-background group-hover:text-md-primary transition-colors">{job.title}</h3>
                  <p className="text-sm text-md-on-surface-variant truncate mt-1">{job.description}</p>
                </div>
              </Link>
            ))}
            {jobs.length === 0 && <p className="text-md-on-surface-variant text-center py-4">No jobs created yet.</p>}
          </div>
        </div>

        <div className="bg-md-surface-container-low p-8 rounded-[32px] border border-md-outline/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-md-on-background">Recent Candidates</h2>
            <Link to="/candidates" className="text-sm font-medium text-md-primary hover:bg-md-primary/10 px-4 py-2 rounded-full transition-colors">View All</Link>
          </div>
          <div className="space-y-3">
            {candidates.slice(-3).reverse().map(cand => (
              <div key={cand.candidate_id} className="bg-md-surface p-4 rounded-2xl shadow-sm border border-md-outline/5 flex justify-between items-center">
                <span className="font-medium text-md-on-background">{cand.name || 'Unknown'}</span>
                <span className="text-xs font-medium px-3 py-1 bg-md-secondary-container text-md-on-secondary-container rounded-full">
                  {cand.skills.length} skills
                </span>
              </div>
            ))}
            {candidates.length === 0 && <p className="text-md-on-surface-variant text-center py-4">No candidates uploaded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
