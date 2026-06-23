import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyToJob, getGapAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSeeker } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);

  // AI Gap Analysis States
  const [gapData, setGapData] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);

  useEffect(() => { 
    loadJob(); 
  }, [id]);

  useEffect(() => {
    if (job && isSeeker()) {
      fetchGapAnalysis();
    }
  }, [job]);

  const loadJob = async () => {
    try { 
      const res = await getJob(id); 
      setJob(res.data);
      // If user is seeker, check if already applied
      if (res.data && res.data.applications) {
        // Fallback or seeker specific checks
      }
    }
    catch { navigate('/jobs'); }
    finally { setLoading(false); }
  };

  const fetchGapAnalysis = async () => {
    setGapLoading(true);
    try {
      const res = await getGapAnalysis(id);
      setGapData(res.data);
    } catch (err) {
      console.error("Failed to load AI Gap Analysis: ", err);
    } finally {
      setGapLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await applyToJob(id, { coverLetter });
      setApplied(true);
      setShowModal(false);
      setMessage('Application submitted successfully!');
      loadJob();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Already applied or error occurred.');
    } finally { Fleming: setApplying(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!job) return null;

  return (
    <div className="container page animate-fade-up">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back
      </button>

      {message && (
        <div 
          className={`alert ${applied || message.includes('success') ? 'alert-success' : 'alert-danger'}`} 
          onClick={() => setMessage('')}
          style={{ cursor: 'pointer' }}
        >
          <span>{message}</span>
          <span style={{ fontWeight: 700 }}>✕</span>
        </div>
      )}

      <div className="sidebar-layout">
        {/* Left Column - Meta Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h1 className="job-title" style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 6 }}>{job.title}</h1>
            <div className="job-company" style={{ fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"></rect><path d="M9 22V12h6v10M9 8h.01M15 8h.01M9 16h.01M15 16h.01"></path></svg>
              {job.company}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="job-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span style={{ fontWeight: 500 }}>{job.location}</span>
              </div>
              
              {job.salary && (
                <div className="job-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  <span style={{ fontWeight: 500 }}>{job.salary}</span>
                </div>
              )}
              
              {job.experience && (
                <div className="job-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Experience: <strong style={{ color: 'var(--text-primary)' }}>{job.experience}</strong></span>
                </div>
              )}
              
              {job.jobType && (
                <div className="job-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
                  <span>Type: <strong style={{ color: 'var(--text-primary)' }}>{job.jobType}</strong></span>
                </div>
              )}
              
              {job.category && (
                <div className="job-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  <span>Category: <strong style={{ color: 'var(--text-primary)' }}>{job.category}</strong></span>
                </div>
              )}
              
              <div className="job-meta-item" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>{job.applicationCount || 0} applicants</span>
              </div>
            </div>

            {isSeeker() && !applied && (
              <button className="btn btn-primary btn-full" onClick={() => setShowModal(true)}>
                Apply Now
              </button>
            )}
            
            {applied && (
              <div className="badge badge-success btn-full" style={{ padding: '12px', fontSize: 14, borderRadius: 'var(--radius-sm)', justifyContent: 'center', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                Applied Successfully
              </div>
            )}
            
            {!user && (
              <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
                Login to Apply
              </button>
            )}
          </div>

          {job.skills && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                Required Skills
              </div>
              <div className="job-skills" style={{ paddingTop: 0 }}>
                {job.skills.split(',').map((s, i) => <span key={i} className="skill-tag" style={{ fontSize: 12 }}>{s.trim()}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Job Description & AI Gap Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AI RESUME GAP ANALYSIS CARD FOR SEEKERS */}
          {isSeeker() && (
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 800, fontSize: 16.5, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2z"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  AI Resume Gap Analysis
                </h3>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>Powered by Cosine Similarity</span>
              </div>

              {gapLoading ? (
                <div className="loading-center" style={{ padding: '20px' }}><div className="spinner" style={{ width: '28px', height: '28px' }}></div></div>
              ) : !gapData ? (
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: 8 }}>
                  <span>Unable to retrieve AI analysis. Make sure you are logged in and have added skills.</span>
                  <button className="btn btn-secondary btn-sm" onClick={fetchGapAnalysis}>Retry Analysis</button>
                </div>
              ) : (
                <div>
                  {/* Readiness Progress Bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13.5, fontWeight: 700 }}>
                      <span>AI Role Readiness Index</span>
                      <span style={{ color: gapData.readinessScore >= 70 ? 'var(--success-dark)' : gapData.readinessScore >= 40 ? 'var(--warning-dark)' : 'var(--danger-dark)' }}>
                        {gapData.readinessScore}% Match
                      </span>
                    </div>
                    
                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${gapData.readinessScore}%`,
                          borderRadius: '4px',
                          background: gapData.readinessScore >= 70 ? 'var(--success)' : gapData.readinessScore >= 40 ? 'var(--warning)' : 'var(--danger)',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Skills tags differences */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Skills Matched</span>
                      <div className="job-skills" style={{ marginTop: 6, paddingTop: 0 }}>
                        {job.skills && job.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => {
                          const candSkills = user?.skills ? user.skills.toLowerCase() : "";
                          return candSkills.includes(s);
                        }).length > 0 ? (
                          job.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => {
                            const candSkills = user?.skills ? user.skills.toLowerCase() : "";
                            return candSkills.includes(s);
                          }).map((s, i) => <span key={i} className="skill-tag" style={{ background: 'var(--success-light)', color: 'var(--success-dark)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{s}</span>)
                        ) : (
                          <span style={{ fontStyle: 'italic', fontSize: 12.5, color: 'var(--text-muted)' }}>0 matches found.</span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identified Skill Gaps</span>
                      <div className="job-skills" style={{ marginTop: 6, paddingTop: 0 }}>
                        {gapData.missingSkills && gapData.missingSkills.length > 0 ? (
                          gapData.missingSkills.map((s, i) => <span key={i} className="skill-tag" style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>{s}</span>)
                        ) : (
                          <span style={{ fontStyle: 'italic', fontSize: 12.5, color: 'var(--success-dark)', fontWeight: 'bold' }}>✓ Fully aligned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations list */}
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 8 }}>AI Personalized Learning Roadmaps</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {gapData.suggestions && gapData.suggestions.map((sug, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--primary)' }}>•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Job Description
            </div>
            
            <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'var(--font)' }}>
              {job.description}
            </div>
          </div>
        </div>
      </div>

      {/* Application Cover Letter Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Apply for {job.title}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Cover Letter (optional)</label>
              <textarea 
                className="form-control" 
                rows={6}
                placeholder="Tell the employer why you're a great fit..."
                value={coverLetter} 
                onChange={e => setCoverLetter(e.target.value)} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: 10, justifyitems: 'flex-end', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
