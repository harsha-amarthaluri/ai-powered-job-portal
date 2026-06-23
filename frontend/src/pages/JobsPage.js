import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchJobs, getAllJobs } from '../services/api';

const statusColor = { 
  'Full-time': 'badge-primary', 
  'Part-time': 'badge-info', 
  'Remote': 'badge-success', 
  'Internship': 'badge-warning' 
};

const JobCard = ({ job, onClick }) => (
  <div className="job-card" onClick={() => onClick(job.id)}>
    <div className="job-card-header">
      <div>
        <div className="job-title">{job.title}</div>
        <div className="job-company" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"></rect><path d="M9 22V12h6v10M9 8h.01M15 8h.01M9 16h.01M15 16h.01"></path></svg>
          {job.company}
        </div>
      </div>
      {job.jobType && <span className={`badge ${statusColor[job.jobType] || 'badge-gray'}`}>{job.jobType}</span>}
    </div>
    
    <div className="job-meta">
      <span className="job-meta-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {job.location}
      </span>
      {job.salary && (
        <span className="job-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          {job.salary}
        </span>
      )}
      {job.experience && (
        <span className="job-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          {job.experience}
        </span>
      )}
      {job.category && (
        <span className="job-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          {job.category}
        </span>
      )}
    </div>

    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
      {job.description}
    </p>

    {job.skills && (
      <div className="job-skills">
        {job.skills.split(',').slice(0, 4).map((s, i) => (
          <span key={i} className="skill-tag">{s.trim()}</span>
        ))}
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
        Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}
      </span>
      <span className="badge badge-gray">{job.applicationCount || 0} applicants</span>
    </div>
  </div>
);

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', location: '', category: '', jobType: '' });

  const categories = ['IT', 'Finance', 'Marketing', 'Healthcare', 'Education', 'Design', 'Sales', 'Engineering'];
  const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Internship'];

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await getAllJobs();
      setJobs(res.data);
    } catch { } finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchJobs(filters);
      setJobs(res.data);
    } catch { } finally { setLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="animate-fade-up">
      {/* Header Banner */}
      <div style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)', padding: '56px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Find Your Dream Job</h1>
          <p style={{ color: '#94a3b8', fontSize: 14.5, marginBottom: 28, fontWeight: 500 }}>Explore open positions across industry-leading teams.</p>
          
          <div className="search-bar">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-control" 
                  placeholder="Job title, skills, keywords..."
                  value={filters.keyword} 
                  onChange={e => setFilters({ ...filters, keyword: e.target.value })}
                  onKeyPress={handleKeyPress} 
                  style={{ paddingLeft: '36px' }}
                />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-control" 
                  placeholder="Location"
                  value={filters.location} 
                  onChange={e => setFilters({ ...filters, location: e.target.value })}
                  onKeyPress={handleKeyPress} 
                  style={{ paddingLeft: '36px' }}
                />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <select className="form-control" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <select className="form-control" value={filters.jobType} onChange={e => setFilters({ ...filters, jobType: e.target.value })}>
                <option value="">All Types</option>
                {jobTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSearch} style={{ height: '42px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Available Jobs list */}
      <div className="container page">
        <div className="page-header" style={{ alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <div className="page-title">Available Positions</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>Showing {jobs.length} relevant listings</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadJobs} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.72 2.78L21 8"></path><polyline points="21 3 21 8 16 8"></polyline></svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3>No positions found</h3>
            <p>Try broadening your query keyword or resetting categories filter.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onClick={(id) => navigate(`/jobs/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
