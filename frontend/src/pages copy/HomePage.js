import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isSeeker, isEmployer, isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    getAllJobs().then(res => setJobs(res.data.slice(0, 6))).catch(() => {});
  }, []);

  const handleSearch = () => {
    navigate(`/jobs${keyword ? `?keyword=${keyword}` : ''}`);
  };

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin';
    if (isEmployer()) return '/employer';
    if (isSeeker()) return '/seeker';
    return null;
  };

  return (
    <div className="animate-fade-up">
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>Find Your <span>Dream Career</span></h1>
          <p>Next-generation AI-powered job matching connects the world's best talent with premium career opportunities instantly.</p>
          
          <div className="hero-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              placeholder="Search jobs, skills, companies..."
              value={keyword} 
              onChange={e => setKeyword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()} 
            />
            <button className="btn btn-primary btn-md" onClick={handleSearch} style={{ borderRadius: '9999px' }}>
              Search Jobs
            </button>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Full-time', 'Remote', 'Internship', 'Part-time'].map(t => (
              <button 
                key={t} 
                onClick={() => navigate(`/jobs?jobType=${t}`)}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border)',
                  padding: '8px 18px', 
                  borderRadius: '20px', 
                  cursor: 'pointer', 
                  fontSize: 13.5,
                  fontWeight: 600,
                  transition: 'var(--transition)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                className="btn-secondary"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', padding: '36px 0', transition: 'background-color 0.3s' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
            {[
              [
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>, 
                '500+', 
                'Companies Hiring'
              ],
              [
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>, 
                `${jobs.length}+`, 
                'Active Jobs'
              ],
              [
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, 
                'AI Match', 
                'Powered Matching'
              ],
              [
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>, 
                'PDF Parser', 
                'Skills Extraction'
              ]
            ].map(([icon, num, label], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Welcome alert for logged in users */}
      {user && getDashboardLink() && (
        <div style={{ background: 'var(--primary-light)', padding: '16px 0', borderBottom: '1px solid var(--border)', transition: 'background-color 0.3s' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>Welcome back, {user.fullName?.split(' ')[0]}! Continue tracking applications.</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(getDashboardLink())}>
              Go to Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      )}

      {/* Recent Jobs Section */}
      <div className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Explore Latest Openings</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Find roles verified by our recruiting operations team.</p>
          </div>
          <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            View all jobs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <h3>No jobs posted yet</h3>
            <p>Be the first employer to list a career opportunity on our platform.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
                <div className="job-card-header">
                  <div>
                    <div className="job-title">{job.title}</div>
                    <div className="job-company" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"></rect><path d="M9 22V12h6v10M9 8h.01M15 8h.01M9 16h.01M15 16h.01"></path></svg>
                      {job.company}
                    </div>
                  </div>
                  {job.jobType && (
                    <span className={`badge ${
                      job.jobType === 'Full-time' ? 'badge-primary' : 
                      job.jobType === 'Remote' ? 'badge-success' : 
                      job.jobType === 'Internship' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {job.jobType}
                    </span>
                  )}
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
                </div>
                
                {job.skills && (
                  <div className="job-skills">
                    {job.skills.split(',').slice(0, 3).map((s, i) => (
                      <span key={i} className="skill-tag">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features section */}
      <div style={{ background: 'var(--bg-secondary)', padding: '72px 0', borderTop: '1px solid var(--border)', transition: 'background-color 0.3s' }}>
        <div className="container">
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Powerful SaaS Features</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>Optimized mechanisms designed to fast-track recruitment processes.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              [
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line></svg>,
                'TF-IDF AI Matching', 
                'Our AI engine calculates semantic similarity weights using vector space models to score matching ratios accurately.'
              ],
              [
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>,
                'Dynamic PDF Parser', 
                'Upload native PDF resumes to dynamically parse keywords, professional skills, and historical education timelines.'
              ],
              [
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
                'Real-Time WebSockets', 
                'Receive instant reactive push updates the millisecond a hiring team shifts your application status or issues remarks.'
              ],
              [
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>,
                'Automated Email Digests', 
                'Stay updated with prompt transactional email pipelines notifying you of interview selections or active alerts.'
              ],
            ].map(([icon, title, desc], idx) => (
              <div key={idx} className="card card-hover" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--primary-light)', width: '56px', height: '56px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer style={{ background: 'var(--secondary)', color: 'var(--text-muted)', padding: '56px 0 36px', fontSize: 14, borderTop: '1px solid var(--border)', transition: 'background-color 0.3s' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36, marginBottom: 40, textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
                <span>JobPortal</span>
              </div>
              <p style={{ lineHeight: 1.6, fontSize: 13, color: '#94a3b8' }}>Advanced AI-driven matching environment helping companies recruit elite software engineers, designers, and managers seamlessly.</p>
            </div>
            
            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 14.5 }}>For Candidates</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, padding: 0 }}>
                <li><Link to="/jobs" style={{ color: '#94a3b8' }} className="nav-link-footer">Browse Jobs</Link></li>
                <li><Link to="/login" style={{ color: '#94a3b8' }} className="nav-link-footer">AI Profile Setup</Link></li>
                <li><span style={{ color: '#94a3b8' }}>Resume Auto-Extractor</span></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 14.5 }}>For Employers</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, padding: 0 }}>
                <li><Link to="/register" style={{ color: '#94a3b8' }} className="nav-link-footer">Create Recruiter Account</Link></li>
                <li><span style={{ color: '#94a3b8' }}>Vector Profile Search</span></li>
                <li><span style={{ color: '#94a3b8' }}>Spring Boot Integrations</span></li>
              </ul>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #334155', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>© 2026 JobPortal AI Matching platform. All rights reserved.</span>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Spring Boot + React Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
