import React, { useState, useEffect } from 'react';
import { 
  getEmployerJobs, createJob, updateJob, deleteJob, getJobApplications, updateApplicationStatus, 
  getEmployerAnalytics, getCandidateInsights, optimizeJobDescription,
  getApplicationHistory, addRecruiterNote, getRecruiterNotes, getCandidateTimeline, 
  compareCandidates, getJobPerformance, getJobAiInsights, searchCandidates 
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusOptions = [
  'APPLIED', 'VIEWED', 'SCREENING', 'SHORTLISTED', 
  'INTERVIEW_SCHEDULED', 'TECHNICAL_ROUND', 'HR_ROUND', 
  'SELECTED', 'REJECTED', 'HIRED'
];
const statusColors = { 
  APPLIED: 'badge-info', 
  VIEWED: 'badge-warning',
  SCREENING: 'badge-warning',
  SHORTLISTED: 'badge-primary', 
  INTERVIEW_SCHEDULED: 'badge-info',
  TECHNICAL_ROUND: 'badge-info',
  HR_ROUND: 'badge-info',
  SELECTED: 'badge-success',
  REJECTED: 'badge-danger', 
  HIRED: 'badge-success' 
};

const emptyForm = { title:'', description:'', location:'', salary:'', jobType:'Full-time', experience:'', skills:'', category:'IT' };

const MatchCircle = ({ score }) => {
  const percentage = Math.round(score || 0);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  let color = '#EF4444'; // var(--danger)
  if (percentage >= 70) color = '#22C55E'; // var(--success)
  else if (percentage >= 40) color = '#F59E0B'; // var(--warning)

  return (
    <div className="match-circle-wrap">
      <svg className="match-circle-svg" viewBox="0 0 44 44">
        <circle className="match-circle-bg" cx="22" cy="22" r={radius} />
        <circle 
          className="match-circle-progress" 
          cx="22" 
          cy="22" 
          r={radius} 
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="match-circle-text" style={{ color, fontSize: '10px', fontWeight: '800' }}>
        {percentage}%
      </div>
    </div>
  );
};

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // New AI feature states
  const [candidateInsights, setCandidateInsights] = useState({});
  const [visibleInsights, setVisibleInsights] = useState({});
  const [insightsLoading, setInsightsLoading] = useState({});
  const [optimizingJd, setOptimizingJd] = useState(false);

  // Analytics states
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Advanced recruiter workspace states
  const [searchParams, setSearchParams] = useState({
    skill: '', experience: '', education: '', minAtsScore: '', minMatchScore: '', location: '', certification: '', project: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const [activeInsightTab, setActiveInsightTab] = useState({}); // appId -> 'profile' | 'insights' | 'notes' | 'timeline'
  const [recruiterNotes, setRecruiterNotes] = useState({}); // appId -> notes list
  const [timelineData, setTimelineData] = useState({}); // appId -> timeline list
  const [historyData, setHistoryData] = useState({}); // appId -> history list
  const [evaluationForm, setEvaluationForm] = useState({ stage: 'APPLIED', content: '', rating: 5, interviewComments: '' });
  const [submittingNote, setSubmittingNote] = useState(false);

  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [selectedPerformanceJob, setSelectedPerformanceJob] = useState(null);
  const [jobAiInsights, setJobAiInsights] = useState(null);
  const [jobAiInsightsLoading, setJobAiInsightsLoading] = useState(false);

  useEffect(() => { loadJobs(); }, []);

  const fetchCandidateDetails = async (appId) => {
    try {
      const [notesRes, timelineRes, historyRes] = await Promise.all([
        getRecruiterNotes(appId),
        getCandidateTimeline(appId),
        getApplicationHistory(appId)
      ]);
      setRecruiterNotes(prev => ({ ...prev, [appId]: notesRes.data }));
      setTimelineData(prev => ({ ...prev, [appId]: timelineRes.data }));
      setHistoryData(prev => ({ ...prev, [appId]: historyRes.data }));
    } catch {}
  };

  const handleNoteSubmit = async (appId) => {
    if (!evaluationForm.content.trim()) {
      alert('Please enter evaluation comments first.');
      return;
    }
    setSubmittingNote(true);
    try {
      await addRecruiterNote(appId, {
        stage: evaluationForm.stage,
        content: evaluationForm.content,
        rating: evaluationForm.rating,
        interviewComments: evaluationForm.interviewComments
      });
      // Reload notes, timeline, and history
      await fetchCandidateDetails(appId);
      setEvaluationForm({ stage: evaluationForm.stage, content: '', rating: 5, interviewComments: '' });
      setMsg('Evaluation note securely saved!');
    } catch {
      alert('Error saving evaluation note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSearchCandidates = async () => {
    setIsSearching(true);
    try {
      const params = {};
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v !== '') params[k] = v;
      });
      const res = await searchCandidates(params);
      setApplications(res.data);
      setMsg(`Found ${res.data.length} candidate applications matching filters!`);
    } catch {
      setMsg('Search candidates query failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCompareCandidates = async () => {
    if (selectedApplicants.length < 2) {
      alert('Please select at least 2 candidates to compare side-by-side.');
      return;
    }
    setComparisonLoading(true);
    setShowComparisonModal(true);
    try {
      const res = await compareCandidates({ applicantIds: selectedApplicants });
      setComparisonData(res.data);
    } catch {
      alert('Failed to construct candidate comparison matrix.');
      setShowComparisonModal(false);
    } finally {
      setComparisonLoading(false);
    }
  };

  const loadJobPerformance = async (job) => {
    setSelectedPerformanceJob(job);
    setPerformanceLoading(true);
    setJobAiInsightsLoading(true);
    setShowPerformanceModal(true);
    try {
      const [perfRes, insightsRes] = await Promise.all([
        getJobPerformance(job.id),
        getJobAiInsights(job.id)
      ]);
      setPerformanceData(perfRes.data);
      setJobAiInsights(insightsRes.data);
    } catch {
      alert('Failed to retrieve job performance telemetry and AI insights.');
      setShowPerformanceModal(false);
    } finally {
      setPerformanceLoading(false);
      setJobAiInsightsLoading(false);
    }
  };

  const handleStatusAdvance = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, { status, employerNote: `Pipeline advanced to ${status}.` });
      if (selectedJob) {
        loadApplications(selectedJob.id);
      }
      await fetchCandidateDetails(appId);
      setMsg(`Candidate pipeline status updated to ${status}!`);
    } catch {
      setMsg('Error updating status.');
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try { const res = await getEmployerJobs(); setJobs(res.data); }
    catch {} finally { setLoading(false); }
  };

  const loadApplications = async (jobId) => {
    try { const res = await getJobApplications(jobId); setApplications(res.data); }
    catch {}
  };

  const handleJobSubmit = async () => {
    try {
      if (editingJob) { await updateJob(editingJob.id, jobForm); setMsg('Job updated successfully! Your changes are now live and visible.'); }
      else { await createJob(jobForm); setMsg('Job posted successfully! It is now live and visible to all job seekers.'); }
      setShowJobModal(false); setJobForm(emptyForm); setEditingJob(null);
      loadJobs();
    } catch (err) { setMsg(err.response?.data?.message || 'Error saving job.'); }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobForm({ title: job.title, description: job.description, location: job.location,
      salary: job.salary || '', jobType: job.jobType || 'Full-time', experience: job.experience || '',
      skills: job.skills || '', category: job.category || 'IT' });
    setShowJobModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await deleteJob(id); loadJobs();
  };

  const handleStatusUpdate = async (appId, status, note) => {
    try {
      await updateApplicationStatus(appId, { status, employerNote: note });
      loadApplications(selectedJob.id);
      // Reload analytics if they are expanded
      if (analyticsOpen) {
        fetchAnalytics(selectedJob.id);
      }
      setMsg('Status updated! Candidate notified by email.');
    } catch { setMsg('Error updating status.'); }
  };

  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    loadApplications(job.id);
    setAnalyticsOpen(false);
    setAnalyticsData(null);
    setTab('applicants');
  };

  const fetchAnalytics = async (jobId) => {
    setAnalyticsLoading(true);
    try {
      const res = await getEmployerAnalytics(jobId);
      setAnalyticsData(res.data);
    } catch (err) {
      setMsg('Failed to fetch candidate pool analytics.');
      setAnalyticsOpen(false);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const toggleAnalytics = () => {
    if (!analyticsOpen && selectedJob) {
      fetchAnalytics(selectedJob.id);
    }
    setAnalyticsOpen(!analyticsOpen);
  };

  const toggleInsights = async (appId) => {
    if (candidateInsights[appId]) {
      setVisibleInsights(prev => ({ ...prev, [appId]: !prev[appId] }));
      return;
    }
    
    setInsightsLoading(prev => ({ ...prev, [appId]: true }));
    try {
      const res = await getCandidateInsights(appId);
      setCandidateInsights(prev => ({ ...prev, [appId]: res.data }));
      await fetchCandidateDetails(appId);
      setActiveInsightTab(prev => ({ ...prev, [appId]: 'profile' }));
      setVisibleInsights(prev => ({ ...prev, [appId]: true }));
    } catch (err) {
      setMsg('Failed to load candidate insights.');
    } finally {
      setInsightsLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  const handleOptimizeJd = async () => {
    if (!jobForm.title) {
      alert('Please enter a Job Title first so the AI knows the target role.');
      return;
    }
    if (!jobForm.description) {
      alert('Please enter a basic job description draft to optimize.');
      return;
    }

    setOptimizingJd(true);
    try {
      const res = await optimizeJobDescription({
        title: jobForm.title,
        description: jobForm.description,
        skills: jobForm.skills || '',
        location: jobForm.location || '',
        salary: jobForm.salary || '',
        jobType: jobForm.jobType || 'Full-time',
        experience: jobForm.experience || '',
        category: jobForm.category || 'IT'
      });
      
      if (res.data) {
        setJobForm(prev => ({
          ...prev,
          description: res.data.optimizedDescription,
          skills: prev.skills 
            ? Array.from(new Set([
                ...prev.skills.split(',').map(s => s.trim().toLowerCase()), 
                ...(res.data.suggestedSkills || []).map(s => s.trim().toLowerCase())
              ])).filter(Boolean).map(s => {
                // Capitalize first letter of each skill tag for professional formatting
                return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              }).join(', ')
            : (res.data.suggestedSkills || []).map(s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
        }));
        setMsg('Job description optimized successfully and suggested skills added!');
      }
    } catch (err) {
      setMsg('Failed to optimize job description. Please try again.');
    } finally {
      setOptimizingJd(false);
    }
  };

  return (
    <div className="container page animate-fade-up">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div className="page-title">Employer Panel 🏢</div>
        <button className="btn btn-primary" onClick={() => { setEditingJob(null); setJobForm(emptyForm); setShowJobModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Post a Job
        </button>
      </div>

      {msg && (
        <div className="alert alert-success animate-fade" onClick={() => setMsg('')} style={{ cursor: 'pointer' }}>
          <span>{msg}</span>
          <strong>✕</strong>
        </div>
      )}

      <div className="tabs">
        {[
          { key: 'dashboard', label: '🏠 Overview' },
          { key: 'jobs', label: '💼 My Jobs' },
          { key: 'applicants', label: '👥 Applicant Review' }
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">{jobs.length}</div>
              <div className="stat-label">Total Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{jobs.filter(j => j.approved).length}</div>
              <div className="stat-label">Active Listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{jobs.filter(j => !j.approved).length}</div>
              <div className="stat-label">Awaiting Approval</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{jobs.reduce((s, j) => s + (j.applicationCount || 0), 0)}</div>
              <div className="stat-label">Total Candidates</div>
            </div>
          </div>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                Recent Job Listings
              </h3>
              <button onClick={() => setTab('jobs')} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Manage all Listings →
              </button>
            </div>
            
            {jobs.length === 0 ? (
              <div className="empty-state" style={{ padding: '36px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>You haven't listed any jobs. Post a job opening to start hiring.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {jobs.slice(0, 5).map(job => (
                  <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)' }}>{job.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📍 {job.location}</span>
                        <span>•</span>
                        <span>👥 {job.applicationCount || 0} applications</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className={`badge ${job.approved ? 'badge-success' : 'badge-warning'}`}>
                        {job.approved ? 'Live' : 'Pending Approval'}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewApplicants(job)}>
                        Review Applicants
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'jobs' && (
        <div className="card">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <h3>No jobs posted yet</h3>
              <p>Post your first active position listing to attract applicants.</p>
              <button className="btn btn-primary" onClick={() => setShowJobModal(true)}>Post Your First Job</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Job Type</th>
                    <th>Candidates</th>
                    <th>Status</th>
                    <th>Manage Listing</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</td>
                      <td style={{ fontWeight: 500 }}>{job.location}</td>
                      <td>{job.jobType}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 700 }}>{job.applicationCount || 0}</span>
                      </td>
                      <td>
                        <span className={`badge ${job.approved ? 'badge-success' : 'badge-warning'}`}>
                          {job.approved ? 'Live' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleViewApplicants(job)}>
                            Applicants
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => loadJobPerformance(job)}>
                            📊 Telemetry
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(job)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'applicants' && (
        <div>
          {selectedJob && (
            <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Applicants for: <span style={{ color: 'var(--primary)' }}>{selectedJob.title}</span>
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Candidates ranked in real-time based on profile semantic similarity matching scores.
                </p>
              </div>
              
              {/* TRIGGER AI ANALYTICS BUTTON */}
              <button className="btn btn-secondary" onClick={toggleAnalytics} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                {analyticsOpen ? 'Hide Pool Analytics' : 'Show Pool Analytics'}
              </button>
            </div>
          )}

          {/* NEW FEATURE: RECRUITER ANALYTICS DRAWER PANEL */}
          {analyticsOpen && selectedJob && (
            <div className="card animate-fade" style={{ marginBottom: 24, borderTop: '4px solid var(--primary)', background: 'var(--bg-primary)' }}>
              <h4 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                AI Recruitment Analytics Dashboard
              </h4>

              {analyticsLoading ? (
                <div className="loading-center"><div className="spinner"></div></div>
              ) : !analyticsData ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Failed to calculate pool metrics.</div>
              ) : (
                <div>
                  {/* Summary Metric Counters */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '16px' }}>
                      <div className="stat-num" style={{ fontSize: '24px' }}>{analyticsData.totalApplicants}</div>
                      <div className="stat-label" style={{ fontSize: '11px' }}>Candidates</div>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '16px' }}>
                      <div className="stat-num" style={{ fontSize: '24px' }}>{analyticsData.hiredCount}</div>
                      <div className="stat-label" style={{ fontSize: '11px' }}>Hired</div>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '16px' }}>
                      <div className="stat-num" style={{ fontSize: '24px' }}>{analyticsData.averageScore}%</div>
                      <div className="stat-label" style={{ fontSize: '11px' }}>Avg Match Score</div>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '16px' }}>
                      <div className="stat-num" style={{ fontSize: '24px' }}>
                        {analyticsData.totalApplicants > 0 ? Math.round((analyticsData.hiredCount / analyticsData.totalApplicants) * 100) : 0}%
                      </div>
                      <div className="stat-label" style={{ fontSize: '11px' }}>Conversion Rate</div>
                    </div>
                  </div>

                  {/* Funnel pipeline & score bands maps */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <h5 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 12 }}>Applicant Match Score Ranges</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.entries(analyticsData.scoreDistribution || {}).map(([band, count]) => {
                          const percent = analyticsData.totalApplicants > 0 ? (count / analyticsData.totalApplicants) * 100 : 0;
                          return (
                            <div key={band} style={{ fontSize: 13 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontWeight: 600 }}>
                                <span>{band}% Fit Score</span>
                                <span>{count} candidates ({Math.round(percent)}%)</span>
                              </div>
                              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${percent}%`, background: band.startsWith('80') ? 'var(--success)' : band.startsWith('60') ? 'var(--primary)' : 'var(--warning)', borderRadius: '3px' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <h5 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 12 }}>hiring Funnel Status Pipeline</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {statusOptions.map(status => {
                          const count = analyticsData.applicantsByStatus && analyticsData.applicantsByStatus[status] || 0;
                          return (
                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                              <span style={{ fontWeight: 600 }} className={`badge ${statusColors[status]}`}>{status}</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{count} candidates</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Skills frequency cloud */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 24 }}>
                    <h5 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 12 }}>Applicant Skills Competency Cloud</h5>
                    <div className="job-skills" style={{ paddingTop: 0 }}>
                      {Object.keys(analyticsData.skillsDistribution || {}).length === 0 ? (
                        <div style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)' }}>No applicant skills data extracted.</div>
                      ) : (
                        Object.entries(analyticsData.skillsDistribution || {}).sort((a,b) => b[1] - a[1]).slice(0, 15).map(([skill, count]) => (
                          <span key={skill} className="skill-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.15)', fontSize: '13px' }}>
                            {skill} <strong style={{ color: 'var(--text-secondary)', marginLeft: '2px' }}>({count})</strong>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Hiring Insights */}
                  <div>
                    <h5 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 10 }}>Recruiter Actionable Insights</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {analyticsData.hiringInsights && analyticsData.hiringInsights.map((insight, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
           {!selectedJob ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>Select a job to view applicants</h3>
              <button className="btn btn-secondary" onClick={() => setTab('jobs')}>Go to My Jobs</button>
            </div>
          ) : (
            <div>
              {/* ADVANCED TALENT SEARCH FILTER PANEL */}
              <div className="card animate-fade-up" style={{ marginBottom: 24, padding: 18, border: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <h4 style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🔍 Advanced Talent Search Filter
                  </h4>
                  {selectedApplicants.length > 0 && (
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm animate-fade" 
                      onClick={handleCompareCandidates}
                      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                    >
                      ✨ Compare {selectedApplicants.length} Candidates Side-by-Side
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Skill Requirement</label>
                    <input className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. Java, React" value={searchParams.skill} onChange={e => setSearchParams({...searchParams, skill: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Experience Designation/Company</label>
                    <input className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. Developer, Google" value={searchParams.experience} onChange={e => setSearchParams({...searchParams, experience: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Education Level/College</label>
                    <input className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. B.Tech, Stanford" value={searchParams.education} onChange={e => setSearchParams({...searchParams, education: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Location Keyword</label>
                    <input className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. Bangalore, Remote" value={searchParams.location} onChange={e => setSearchParams({...searchParams, location: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 10 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Min Match Score (%)</label>
                    <input type="number" className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. 60" value={searchParams.minMatchScore} onChange={e => setSearchParams({...searchParams, minMatchScore: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Min ATS Score (%)</label>
                    <input type="number" className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. 70" value={searchParams.minAtsScore} onChange={e => setSearchParams({...searchParams, minAtsScore: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Certification Keyword</label>
                    <input className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. AWS, Cisco" value={searchParams.certification} onChange={e => setSearchParams({...searchParams, certification: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Project Keyword</label>
                    <input className="form-control" style={{ padding: '8px 12px', fontSize: '12.5px' }} placeholder="e.g. Chatbot, React" value={searchParams.project} onChange={e => setSearchParams({...searchParams, project: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm" 
                    onClick={() => {
                      setSearchParams({ skill: '', experience: '', education: '', minAtsScore: '', minMatchScore: '', location: '', certification: '', project: '' });
                      setSelectedApplicants([]);
                      loadApplications(selectedJob.id);
                    }}
                  >
                    Reset Filters
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm" 
                    onClick={handleSearchCandidates}
                    disabled={isSearching}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {isSearching ? <div className="spinner" style={{ width: 12, height: 12, borderWidth: '1.5px', margin: 0 }}></div> : 'Apply Filters'}
                  </button>
                </div>
              </div>

              {/* APPLICANT CARDS */}
              {applications.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-state-icon">📭</div>
                  <h3>No applicants match search filters</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    setSearchParams({ skill: '', experience: '', education: '', minAtsScore: '', minMatchScore: '', location: '', certification: '', project: '' });
                    loadApplications(selectedJob.id);
                  }}>Clear Filters</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {applications.map((app, index) => {
                    // Determine leaderboard medal/badge styling based on index (since sorted by matchScore)
                    let medalBadge = null;
                    if (index === 0) {
                      medalBadge = <span className="badge" style={{ background: '#FEF3C7', color: '#B45309', border: '1.5px solid #F59E0B', fontWeight: 800 }}>🥇 Ranked #1 Candidate</span>;
                    } else if (index === 1) {
                      medalBadge = <span className="badge" style={{ background: '#F1F5F9', color: '#475569', border: '1.5px solid #94A3B8', fontWeight: 800 }}>🥈 Ranked #2 Candidate</span>;
                    } else if (index === 2) {
                      medalBadge = <span className="badge" style={{ background: '#FFEDD5', color: '#C2410C', border: '1.5px solid #EA580C', fontWeight: 800 }}>🥉 Ranked #3 Candidate</span>;
                    } else if (index < 3 || (app.matchScore && app.matchScore >= 80)) {
                      medalBadge = <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800 }}>⭐ Highly Relevant Match</span>;
                    }

                    return (
                      <div key={app.id} className="card animate-fade" style={{ borderLeft: index === 0 ? '4px solid #F59E0B' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            {/* Checkbox for comparisons */}
                            <input 
                              type="checkbox" 
                              checked={selectedApplicants.includes(app.id)} 
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedApplicants(prev => [...prev, app.id]);
                                } else {
                                  setSelectedApplicants(prev => prev.filter(id => id !== app.id));
                                }
                              }} 
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            
                            <div className="profile-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>{app.seekerName?.[0]}</div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{app.seekerName}</div>
                                {medalBadge}
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{app.seekerEmail}</div>
                              {app.seekerSkills && (
                                <div className="job-skills" style={{ marginTop: 8, paddingTop: 0 }}>
                                  {app.seekerSkills.split(',').slice(0, 5).map((s, i) => <span key={i} className="skill-tag" style={{ fontSize: 11.5 }}>{s.trim()}</span>)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            {app.matchScore != null && (
                              <div className="match-score" style={{ fontSize: 15 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Semantic Match:</span>
                                <MatchCircle score={app.matchScore} />
                              </div>
                            )}
                            <span className={`badge ${statusColors[app.status]}`} style={{ minWidth: '90px', textAlign: 'center' }}>{app.status}</span>
                            
                            <button 
                              type="button"
                              className={`btn btn-sm ${visibleInsights[app.id] ? 'btn-primary' : 'btn-secondary'}`} 
                              onClick={() => toggleInsights(app.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, height: '32px', padding: '0 12px', fontSize: '12px', fontWeight: '700' }}
                            >
                              🔍 AI Insights
                            </button>
                          </div>
                        </div>

                        {app.coverLetter && (
                          <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                            <strong>Cover Letter Note:</strong> {app.coverLetter}
                          </div>
                        )}

                        {/* AI Insights Panel */}
                        {insightsLoading[app.id] && (
                          <div style={{ marginTop: 12, padding: 16, textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Analyzing candidate profile using AI...</div>
                          </div>
                        )}

                        {visibleInsights[app.id] && candidateInsights[app.id] && (() => {
                          const activeTab = activeInsightTab[app.id] || 'profile';
                          const setActiveTab = (tabName) => setActiveInsightTab(prev => ({ ...prev, [app.id]: tabName }));
                          const candidateData = candidateInsights[app.id].candidate || {};
                          const seekerProfile = candidateData.seekerProfile || {};
                          
                          return (
                            <div className="animate-fade-up" style={{ marginTop: 14, padding: 18, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                              {/* Horizontal Tabs */}
                              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                                {[
                                  { key: 'profile', label: '👤 Database Profile' },
                                  { key: 'insights', label: '🧠 AI Fit Insights' },
                                  { key: 'timeline', label: '⏳ Unified Timeline' },
                                  { key: 'notes', label: '📝 evaluations & Pipeline' }
                                ].map(t => (
                                  <button 
                                    key={t.key} 
                                    type="button"
                                    className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`} 
                                    onClick={() => setActiveTab(t.key)}
                                    style={{ padding: '8px 14px', fontSize: '12.5px', fontWeight: '700', borderRadius: 'var(--radius-sm)' }}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>

                              {/* Tab Content */}
                              {activeTab === 'profile' && (
                                <div className="animate-fade-up">
                                  <h5 style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', marginBottom: 16 }}>
                                    👤 Candidate Database Profile
                                  </h5>

                                  {/* Contact, Location & Preferred Role Info */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16, fontSize: '13px', background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <div>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Preferred Role</span>
                                      <strong style={{ color: 'var(--text-primary)' }}>{seekerProfile.preferredRole || 'Not Specified'}</strong>
                                    </div>
                                    <div>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Location Preference</span>
                                      <strong style={{ color: 'var(--text-primary)' }}>📍 {seekerProfile.preferredLocationPref || 'Not Specified'} ({seekerProfile.workMode || 'Onsite'})</strong>
                                    </div>
                                    <div>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Expected Salary</span>
                                      <strong style={{ color: 'var(--text-primary)' }}>💰 {seekerProfile.expectedSalary ? `₹${seekerProfile.expectedSalary} LPA` : 'Not Specified'}</strong>
                                    </div>
                                    <div>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Address & Nationality</span>
                                      <strong style={{ color: 'var(--text-primary)' }}>🏠 {seekerProfile.currentAddress || 'Not Specified'} ({seekerProfile.nationality || 'Indian'})</strong>
                                    </div>
                                  </div>

                                  {/* Social & Coding Links */}
                                  {(seekerProfile.linkedinUrl || seekerProfile.githubUrl || seekerProfile.portfolioUrl || seekerProfile.leetcodeUrl || seekerProfile.hackerrankUrl || seekerProfile.codechefUrl) && (
                                    <div style={{ marginBottom: 16 }}>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 8 }}>Professional & Coding Portfolios:</span>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {seekerProfile.linkedinUrl && (
                                          <a href={seekerProfile.linkedinUrl} target="_blank" rel="noreferrer" className="skill-tag" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid rgba(29, 78, 216, 0.15)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            🔗 LinkedIn
                                          </a>
                                        )}
                                        {seekerProfile.githubUrl && (
                                          <a href={seekerProfile.githubUrl} target="_blank" rel="noreferrer" className="skill-tag" style={{ background: '#F9FAFB', color: '#1F2937', border: '1px solid rgba(31, 41, 55, 0.15)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            💻 GitHub
                                          </a>
                                        )}
                                        {seekerProfile.portfolioUrl && (
                                          <a href={seekerProfile.portfolioUrl} target="_blank" rel="noreferrer" className="skill-tag" style={{ background: '#F5F3FF', color: '#6D28D9', border: '1px solid rgba(109, 40, 217, 0.15)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            🌐 Portfolio
                                          </a>
                                        )}
                                        {seekerProfile.leetcodeUrl && (
                                          <a href={seekerProfile.leetcodeUrl} target="_blank" rel="noreferrer" className="skill-tag" style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid rgba(194, 65, 12, 0.15)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            🧠 LeetCode
                                          </a>
                                        )}
                                        {seekerProfile.hackerrankUrl && (
                                          <a href={seekerProfile.hackerrankUrl} target="_blank" rel="noreferrer" className="skill-tag" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid rgba(4, 120, 87, 0.15)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            🟢 HackerRank
                                          </a>
                                        )}
                                        {seekerProfile.codechefUrl && (
                                          <a href={seekerProfile.codechefUrl} target="_blank" rel="noreferrer" className="skill-tag" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid rgba(185, 28, 28, 0.15)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            🔴 CodeChef
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Skills Catalog */}
                                  {candidateData.seekerSkills && candidateData.seekerSkills.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 8 }}>Database-Verified Technical Skills:</span>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {candidateData.seekerSkills.map((sk, idx) => {
                                          let profColor = '#3B82F6';
                                          let profBg = 'rgba(59, 130, 246, 0.08)';
                                          if (sk.proficiencyLevel === 'Expert') {
                                            profColor = '#10B981';
                                            profBg = 'rgba(16, 185, 129, 0.08)';
                                          } else if (sk.proficiencyLevel === 'Beginner') {
                                            profColor = '#6B7280';
                                            profBg = 'rgba(107, 114, 128, 0.08)';
                                          }
                                          return (
                                            <span key={idx} className="skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: profBg, color: profColor, border: `1px solid ${profColor}30`, fontSize: '12px', fontWeight: 600 }}>
                                              {sk.skillName} <small style={{ opacity: 0.8, fontSize: '10px' }}>({sk.proficiencyLevel || 'Intermediate'})</small>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Education History Accordion Panel */}
                                  {(seekerProfile.gradCollege || seekerProfile.tenthSchoolName || seekerProfile.twelfthInstitution) && (
                                    <div style={{ marginBottom: 16, background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                      <span style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        🎓 Academic & Education History
                                      </span>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '12.5px' }}>
                                        {seekerProfile.gradCollege && (
                                          <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 10 }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Graduation: {seekerProfile.gradDegree} in {seekerProfile.gradBranch}</strong>
                                            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{seekerProfile.gradCollege} ({seekerProfile.gradUniversity})</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>📅 {seekerProfile.gradStartDate} - {seekerProfile.gradEndDate} | CGPA: <strong>{seekerProfile.gradCgpa || 'N/A'}</strong></div>
                                          </div>
                                        )}
                                        {seekerProfile.pgCollege && (
                                          <div style={{ borderLeft: '2px solid #8B5CF6', paddingLeft: 10 }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Post Graduation: {seekerProfile.pgDegree} in {seekerProfile.pgBranch}</strong>
                                            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{seekerProfile.pgCollege} ({seekerProfile.pgUniversity})</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>📅 {seekerProfile.pgStartDate} - {seekerProfile.pgEndDate} | CGPA: <strong>{seekerProfile.pgCgpa || 'N/A'}</strong></div>
                                          </div>
                                        )}
                                        {seekerProfile.twelfthInstitution && (
                                          <div style={{ borderLeft: '2px solid #F59E0B', paddingLeft: 10 }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Higher Secondary (12th / Diploma)</strong>
                                            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{seekerProfile.twelfthInstitution} ({seekerProfile.twelfthBoard})</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>📅 Year of passing: {seekerProfile.twelfthYear} | Percentage/CGPA: <strong>{seekerProfile.twelfthPercentage || 'N/A'}%</strong></div>
                                          </div>
                                        )}
                                        {seekerProfile.tenthSchoolName && (
                                          <div style={{ borderLeft: '2px solid #EF4444', paddingLeft: 10 }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Secondary Education (10th)</strong>
                                            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{seekerProfile.tenthSchoolName} ({seekerProfile.tenthBoard})</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>📅 Year of passing: {seekerProfile.tenthYear} | Percentage/CGPA: <strong>{seekerProfile.tenthPercentage || 'N/A'}%</strong></div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Work Experience History */}
                                  {candidateData.workExperiences && candidateData.workExperiences.length > 0 && (
                                    <div style={{ marginBottom: 16, background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                      <span style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        💼 Professional Work Experience
                                      </span>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {candidateData.workExperiences.map((exp, idx) => (
                                          <div key={idx} style={{ borderBottom: idx < candidateData.workExperiences.length - 1 ? '1px dashed var(--border)' : 'none', paddingBottom: idx < candidateData.workExperiences.length - 1 ? 10 : 0, fontSize: '12.5px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                              <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{exp.designation} @ {exp.companyName}</strong>
                                              <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 6px' }}>{exp.employmentType || 'Full-time'}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                                              📅 {exp.startDate} - {exp.currentWorkingStatus ? 'Present' : exp.endDate}
                                            </div>
                                            {exp.responsibilities && (
                                              <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{exp.responsibilities}</p>
                                            )}
                                            {exp.technologiesUsed && (
                                              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {exp.technologiesUsed.split(',').map((tech, tIdx) => (
                                                  <span key={tIdx} className="skill-tag" style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg-secondary)' }}>{tech.trim()}</span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Internships History */}
                                  {candidateData.internships && candidateData.internships.length > 0 && (
                                    <div style={{ marginBottom: 16, background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                      <span style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        🏢 Internship History
                                      </span>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {candidateData.internships.map((intern, idx) => (
                                          <div key={idx} style={{ fontSize: '12.5px' }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>{intern.role} @ {intern.organization}</strong>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>📅 Duration: {intern.duration}</div>
                                            {intern.skillsLearned && (
                                              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Skills learned: <strong>{intern.skillsLearned}</strong></p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Projects Portfolio */}
                                  {candidateData.projects && candidateData.projects.length > 0 && (
                                    <div style={{ marginBottom: 16, background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                      <span style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        📂 Projects Portfolio
                                      </span>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                                        {candidateData.projects.map((proj, idx) => (
                                          <div key={idx} style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '12.5px' }}>
                                            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{proj.projectTitle}</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>Role: {proj.role || 'Contributor'} | Team Size: {proj.teamSize || 1}</div>
                                            <p style={{ margin: '6px 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{proj.description}</p>
                                            {proj.technologiesUsed && (
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                                {proj.technologiesUsed.split(',').map((tech, tIdx) => (
                                                  <span key={tIdx} className="skill-tag" style={{ fontSize: '10px', padding: '1px 5px' }}>{tech.trim()}</span>
                                                ))}
                                              </div>
                                            )}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                              {proj.githubLink && (
                                                <a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>🐙 Code Repository</a>
                                              )}
                                              {proj.liveDemoLink && (
                                                <a href={proj.liveDemoLink} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>🚀 Live Demo</a>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Certifications */}
                                  {candidateData.certifications && candidateData.certifications.length > 0 && (
                                    <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 16 }}>
                                      <span style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        🛡️ Professional Certifications
                                      </span>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '12.5px' }}>
                                        {candidateData.certifications.map((cert, idx) => (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                              <strong style={{ color: 'var(--text-primary)' }}>{cert.certificateName}</strong>
                                              <div style={{ color: 'var(--text-secondary)' }}>Issued by: {cert.organization} | Date: {cert.issueDate || 'N/A'}</div>
                                            </div>
                                            {cert.verificationLink && (
                                              <a href={cert.verificationLink} target="_blank" rel="noreferrer" className="skill-tag" style={{ textDecoration: 'none', fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>Verify Credential</a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Active Resume download */}
                                  {app.resumePath && (
                                    <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Active Candidate Resume</span>
                                        <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>📄 {app.resumePath.split(/[/\\]/).pop() || 'Candidate_Resume.pdf'}</strong>
                                      </div>
                                      <a href={app.resumePath} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" download style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        📥 Download Resume
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {activeTab === 'insights' && (
                                <div className="animate-fade-up">
                                  <h5 style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    🧠 AI Fit Analytics & Deep Insights
                                  </h5>

                                  {/* Summary Grid */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Semantic Match Score</span>
                                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <MatchCircle score={candidateInsights[app.id].matchScore || app.matchScore} />
                                      </div>
                                    </div>
                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Resume ATS Score</span>
                                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <MatchCircle score={candidateData.cachedAtsScore || 0} />
                                      </div>
                                    </div>
                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Hiring Recommendation</span>
                                      <span className={`badge ${
                                        candidateInsights[app.id].hiringRecommendationCategory === 'Strong Hire' ? 'badge-success' :
                                        candidateInsights[app.id].hiringRecommendationCategory === 'Hire' ? 'badge-primary' :
                                        candidateInsights[app.id].hiringRecommendationCategory === 'Consider' ? 'badge-warning' : 'badge-danger'
                                      }`} style={{ fontSize: '13px', fontWeight: '800', padding: '6px 14px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        {candidateInsights[app.id].hiringRecommendationCategory || 'Consider'}
                                      </span>
                                    </div>
                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Career Level Assessment</span>
                                      <strong style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>
                                        {candidateInsights[app.id].careerLevelAssessment || 'Mid-Level'}
                                      </strong>
                                    </div>
                                  </div>

                                  {/* AI recommendation justify reasons */}
                                  {candidateInsights[app.id].hiringRecommendationReasons && candidateInsights[app.id].hiringRecommendationReasons.length > 0 && (
                                    <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 16 }}>
                                      <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '12.5px', marginBottom: 8 }}>🎯 Key Fit Parameters:</strong>
                                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {candidateInsights[app.id].hiringRecommendationReasons.map((reason, idx) => (
                                          <li key={idx} style={{ lineHeight: 1.4 }}>{reason}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Strengths & Weaknesses Grid */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                                    {/* Strengths */}
                                    <div style={{ background: 'rgba(34, 197, 94, 0.04)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                                      <h6 style={{ color: '#22C55E', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 0 }}>
                                        ✅ Key Strengths
                                      </h6>
                                      <ul style={{ paddingLeft: 16, margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {candidateInsights[app.id].strengths?.map((s, idx) => (
                                          <li key={idx} style={{ lineHeight: 1.4 }}>{s}</li>
                                        ))}
                                        {(!candidateInsights[app.id].strengths || candidateInsights[app.id].strengths.length === 0) && (
                                          <li style={{ listStyleType: 'none', marginLeft: -16, fontStyle: 'italic' }}>No critical strengths parsed.</li>
                                        )}
                                      </ul>
                                    </div>

                                    {/* Weaknesses / Gaps */}
                                    <div style={{ background: 'rgba(245, 158, 11, 0.04)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                      <h6 style={{ color: '#F59E0B', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 0 }}>
                                        ⚠️ Gaps & Weaknesses
                                      </h6>
                                      <ul style={{ paddingLeft: 16, margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {candidateInsights[app.id].weaknesses?.map((w, idx) => (
                                          <li key={idx} style={{ lineHeight: 1.4 }}>{w}</li>
                                        ))}
                                        {(!candidateInsights[app.id].weaknesses || candidateInsights[app.id].weaknesses.length === 0) && (
                                          <li style={{ listStyleType: 'none', marginLeft: -16, fontStyle: 'italic' }}>No major skill gaps detected.</li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>

                                  {/* Missing Skills */}
                                  {candidateInsights[app.id].missingSkills?.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                        🔍 Missing Required Skills for Role:
                                      </div>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {candidateInsights[app.id].missingSkills.map((s, idx) => (
                                          <span key={idx} className="skill-tag" style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Adjacent Learning Recommendations */}
                                  {candidateInsights[app.id].learningRecommendations && candidateInsights[app.id].learningRecommendations.length > 0 && (
                                    <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 16 }}>
                                      <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '12.5px', marginBottom: 8 }}>🚀 Recommended Upskilling tracks:</strong>
                                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {candidateInsights[app.id].learningRecommendations.map((track, idx) => (
                                          <li key={idx} style={{ lineHeight: 1.4 }}>{track}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Detailed AI Recruiter Note */}
                                  <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>🎯 AI Deep Matching Assessment:</strong>
                                    <span style={{ fontStyle: 'italic' }}>"{candidateInsights[app.id].hiringRecommendation}"</span>
                                  </div>
                                </div>
                              )}

                              {activeTab === 'timeline' && (
                                <div className="animate-fade-up">
                                  <h5 style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', marginBottom: 12 }}>
                                    ⏳ Unified Candidate Timeline Audit
                                  </h5>
                                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: 20 }}>
                                    Chronological audit trail of seeker profile registration, resume updates, submissions, and status advancements.
                                  </p>

                                  {(!timelineData[app.id] || timelineData[app.id].length === 0) ? (
                                    <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                                      No activities logged yet.
                                    </div>
                                  ) : (
                                    <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border)', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                      {timelineData[app.id].map((node, index) => {
                                        let dotColor = 'var(--border)';
                                        if (node.type === 'PROFILE_CREATED') dotColor = '#3B82F6';
                                        else if (node.type?.startsWith('RESUME')) dotColor = '#8B5CF6';
                                        else if (node.type === 'APPLICATION_SUBMITTED') dotColor = '#10B981';
                                        else if (node.type === 'INTERVIEW_SCHEDULED') dotColor = '#F59E0B';
                                        else if (node.type === 'STATUS_CHANGED') dotColor = '#EA580C';

                                        return (
                                          <div key={index} style={{ position: 'relative' }}>
                                            {/* Timeline Dot Indicator */}
                                            <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: dotColor, border: '3px solid var(--bg-secondary)', boxShadow: '0 0 0 2px ' + dotColor + '40' }}></div>
                                            
                                            <div>
                                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {node.timestamp ? new Date(node.timestamp).toLocaleString() : ''}
                                              </span>
                                              <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--text-primary)', marginTop: '2px' }}>
                                                {node.title}
                                              </strong>
                                              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                                {node.description}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {activeTab === 'notes' && (
                                <div className="animate-fade-up">
                                  {/* status advance */}
                                  <div style={{ marginBottom: 20 }}>
                                    <h6 style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 8 }}>
                                      🚀 Advance Recruitment Stage:
                                    </h6>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                      {statusOptions.map(s => (
                                        <button 
                                          key={s} 
                                          type="button"
                                          className={`btn btn-sm ${app.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                          onClick={() => handleStatusAdvance(app.id, s)}
                                          style={{ padding: '6px 10px', fontSize: '11.5px', fontWeight: '700' }}
                                        >
                                          {s.replace('_', ' ')}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* evaluation note submit form */}
                                  <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 20 }}>
                                    <h6 style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 12, marginTop: 0 }}>
                                      📝 Record Private Recruiter Stage Evaluation Note:
                                    </h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Evaluation Stage *</label>
                                        <select 
                                          className="form-control" 
                                          value={evaluationForm.stage} 
                                          onChange={e => setEvaluationForm({ ...evaluationForm, stage: e.target.value })}
                                          style={{ padding: '6px 10px', fontSize: '12px' }}
                                        >
                                          {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                        </select>
                                      </div>
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Score Rating (1 to 5 Stars) *</label>
                                        <select 
                                          className="form-control" 
                                          value={evaluationForm.rating} 
                                          onChange={e => setEvaluationForm({ ...evaluationForm, rating: parseInt(e.target.value) })}
                                          style={{ padding: '6px 10px', fontSize: '12px' }}
                                        >
                                          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                        </select>
                                      </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>General Evaluation Feedback comments *</label>
                                      <textarea 
                                        className="form-control" 
                                        rows={3} 
                                        placeholder="Enter qualitative matching notes, technical strengths, gaps identified..." 
                                        value={evaluationForm.content} 
                                        onChange={e => setEvaluationForm({ ...evaluationForm, content: e.target.value })}
                                        style={{ fontSize: '12.5px' }}
                                      />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 14 }}>
                                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4 }}>Specific private Interview Notes (Optional)</label>
                                      <textarea 
                                        className="form-control" 
                                        rows={2} 
                                        placeholder="Private recruiter comments, next steps or compensation alignments..." 
                                        value={evaluationForm.interviewComments} 
                                        onChange={e => setEvaluationForm({ ...evaluationForm, interviewComments: e.target.value })}
                                        style={{ fontSize: '12.5px' }}
                                      />
                                    </div>

                                    <button 
                                      type="button"
                                      className="btn btn-primary btn-sm" 
                                      onClick={() => handleNoteSubmit(app.id)}
                                      disabled={submittingNote}
                                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                      {submittingNote ? <div className="spinner" style={{ width: 12, height: 12, borderWidth: '1.5px', margin: 0 }}></div> : 'Save Evaluation Note'}
                                    </button>
                                  </div>

                                  {/* private notes list */}
                                  <div>
                                    <h6 style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 12 }}>
                                      📋 Saved Candidate Evaluations Feed:
                                    </h6>
                                    
                                    {(!recruiterNotes[app.id] || recruiterNotes[app.id].length === 0) ? (
                                      <div style={{ fontStyle: 'italic', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                        No evaluation notes recorded for this candidate yet.
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {recruiterNotes[app.id].map(note => (
                                          <div key={note.id} style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                <span className="badge badge-primary" style={{ fontSize: '10px', padding: '3px 8px' }}>
                                                  {note.stage?.replace('_', ' ')}
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 800 }}>
                                                  {'★'.repeat(note.rating || 5)}{'☆'.repeat(5 - (note.rating || 5))}
                                                </span>
                                              </div>
                                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                                              </span>
                                            </div>
                                            <p style={{ margin: '0 0 6px 0', fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                              {note.content}
                                            </p>
                                            {note.interviewComments && (
                                              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '6px 10px', borderLeft: '2px solid var(--border)', marginTop: 4 }}>
                                                <strong>Private Notes:</strong> {note.interviewComments}
                                              </div>
                                            )}
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                                              Recorded by: {note.authorEmail}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : ''}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div className="modal-title">{editingJob ? 'Edit Job' : 'Post New Job'}</div>
              <button className="modal-close" onClick={() => setShowJobModal(false)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Job Title *</label>
                <input className="form-control" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Location *</label>
                <input className="form-control" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} /></div>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Job Description *</label>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleOptimizeJd} 
                  disabled={optimizingJd}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11.5px', padding: '4px 8px', background: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)', border: '1px solid rgba(37, 99, 235, 0.15)' }}
                >
                  {optimizingJd ? (
                    <>
                      <div className="spinner" style={{ width: 12, height: 12, borderWidth: '1.5px', margin: 0 }}></div>
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>🪄 AI Optimize</>
                  )}
                </button>
              </div>
              <textarea className="form-control" rows={6} value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Salary</label>
                <input className="form-control" placeholder="e.g. ₹4-6 LPA" value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Job Type</label>
                <select className="form-control" value={jobForm.jobType} onChange={e => setJobForm({ ...jobForm, jobType: e.target.value })}>
                  {['Full-time','Part-time','Remote','Internship'].map(t => <option key={t}>{t}</option>)}
                </select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Experience</label>
                <select className="form-control" value={jobForm.experience} onChange={e => setJobForm({ ...jobForm, experience: e.target.value })}>
                  {['Fresher','0-1 years','1-3 years','3-5 years','5+ years'].map(e => <option key={e}>{e}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-control" value={jobForm.category} onChange={e => setJobForm({ ...jobForm, category: e.target.value })}>
                  {['IT','Finance','Marketing','Healthcare','Education','Design','Sales','Engineering'].map(c => <option key={c}>{c}</option>)}
                </select></div>
            </div>
            <div className="form-group"><label className="form-label">Required Skills (comma separated)</label>
              <input className="form-control" placeholder="java, spring boot, mysql, react..." value={jobForm.skills} onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 10, justifyitems: 'flex-end', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowJobModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleJobSubmit}>{editingJob ? 'Update Job' : 'Post Job'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Comparison Modal */}
      {showComparisonModal && (
        <div className="modal-overlay" onClick={() => { setShowComparisonModal(false); setSelectedApplicants([]); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '95%', width: '1200px' }}>
            <div className="modal-header">
              <div className="modal-title">✨ Side-by-Side Candidate Comparison Matrix</div>
              <button className="modal-close" onClick={() => { setShowComparisonModal(false); setSelectedApplicants([]); }}>×</button>
            </div>
            
            {comparisonLoading ? (
              <div className="loading-center" style={{ padding: '40px' }}><div className="spinner"></div></div>
            ) : comparisonData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Failed to construct comparison matrix.</div>
            ) : (
              <div className="table-wrap" style={{ overflowX: 'auto', marginTop: 10 }}>
                <table style={{ minWidth: '800px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '180px', background: 'var(--bg-secondary)', fontWeight: 800, borderBottom: '2px solid var(--border)', padding: '12px' }}>Attribute</th>
                      {comparisonData.map(c => (
                        <th key={c.applicantId} style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)', textAlign: 'center', padding: '14px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14.5px' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.email}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', padding: '12px' }}>AI Match Score</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ textAlign: 'center', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <MatchCircle score={c.matchScore} />
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', padding: '12px' }}>Resume ATS Score</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ textAlign: 'center', padding: '12px' }}>
                          <span className="badge badge-info" style={{ fontSize: '13px', fontWeight: 800 }}>{Math.round(c.atsScore || 0)}%</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', padding: '12px' }}>Database Verified Skills</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ fontSize: '12px', padding: '12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                            {c.skills?.split(',').map((s, idx) => (
                              <span key={idx} className="skill-tag" style={{ fontSize: '10.5px', padding: '2px 6px' }}>{s.trim()}</span>
                            ))}
                            {!c.skills && <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>None specified</span>}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', padding: '12px' }}>Academic Qualifications</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ fontSize: '12.5px', textAlign: 'center', lineHeight: 1.4, padding: '12px' }}>
                          {c.educationSummary || 'Not Specified'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', padding: '12px' }}>Professional Experience</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ fontSize: '12.5px', textAlign: 'center', lineHeight: 1.4, padding: '12px' }}>
                          {c.experienceSummary || 'Fresher'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', color: '#22C55E', padding: '12px' }}>Key Strengths</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ fontSize: '12px', padding: '12px' }}>
                          <ul style={{ paddingLeft: '16px', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {c.strengths?.slice(0, 3).map((s, idx) => (
                              <li key={idx} style={{ textAlign: 'left', lineHeight: 1.3 }}>{s}</li>
                            ))}
                            {(!c.strengths || c.strengths.length === 0) && <li style={{ listStyleType: 'none', marginLeft: -16, fontStyle: 'italic', color: 'var(--text-muted)' }}>None extracted</li>}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, background: 'var(--bg-secondary)', color: '#EF4444', padding: '12px' }}>Gaps & Weaknesses</td>
                      {comparisonData.map(c => (
                        <td key={c.applicantId} style={{ fontSize: '12px', padding: '12px' }}>
                          <ul style={{ paddingLeft: '16px', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {c.weaknesses?.slice(0, 3).map((w, idx) => (
                              <li key={idx} style={{ textAlign: 'left', lineHeight: 1.3 }}>{w}</li>
                            ))}
                            {(!c.weaknesses || c.weaknesses.length === 0) && <li style={{ listStyleType: 'none', marginLeft: -16, fontStyle: 'italic', color: 'var(--text-muted)' }}>No gaps detected</li>}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => { setShowComparisonModal(false); setSelectedApplicants([]); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Job Performance Modal */}
      {showPerformanceModal && (
        <div className="modal-overlay" onClick={() => setShowPerformanceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-title">📈 Job Analytics & AI JD Optimization Desk</div>
              <button className="modal-close" onClick={() => setShowPerformanceModal(false)}>×</button>
            </div>

            {performanceLoading ? (
              <div className="loading-center" style={{ padding: '40px' }}><div className="spinner"></div></div>
            ) : !performanceData ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Failed to load telemetry.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Job Title details */}
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--primary)', margin: 0 }}>
                    Position: {selectedPerformanceJob?.title}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    📍 {selectedPerformanceJob?.location} | Type: {selectedPerformanceJob?.jobType}
                  </span>
                </div>

                {/* Telemetry Counter Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                  <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div className="stat-num" style={{ fontSize: '24px', color: 'var(--primary)' }}>{performanceData.views}</div>
                    <div className="stat-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Views</div>
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div className="stat-num" style={{ fontSize: '24px', color: '#10B981' }}>{performanceData.applications}</div>
                    <div className="stat-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submissions</div>
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div className="stat-num" style={{ fontSize: '24px', color: '#F59E0B' }}>{performanceData.conversionRate}%</div>
                    <div className="stat-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conversion Rate</div>
                  </div>
                  <div className="stat-card" style={{ background: 'var(--bg-secondary)', padding: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div className="stat-num" style={{ fontSize: '24px', color: '#8B5CF6' }}>{performanceData.averageMatchScore}%</div>
                    <div className="stat-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Match Score</div>
                  </div>
                </div>

                {/* score distribution & status pipeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Score bands */}
                  <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: 10 }}>Score Bands Distribution:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {Object.entries(performanceData.scoreDistribution || {}).map(([band, count]) => {
                        const total = performanceData.applications || 1;
                        const percent = Math.round(((count || 0) / total) * 100);
                        return (
                          <div key={band} style={{ fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontWeight: 600 }}>
                              <span>{band}% Match Range</span>
                              <span>{count} ({percent}%)</span>
                            </div>
                            <div style={{ height: '5px', background: 'var(--border)', borderRadius: '2.5px' }}>
                              <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary)', borderRadius: '2.5px' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status distribution */}
                  <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: 10 }}>Recruitment Pipeline Stages:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '130px', overflowY: 'auto' }}>
                      {Object.entries(performanceData.candidateDistribution || {}).map(([stage, count]) => (
                        <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
                          <span className={`badge ${statusColors[stage] || 'badge-secondary'}`} style={{ fontSize: '9.5px', textTransform: 'uppercase' }}>
                            {stage.replace('_', ' ')}
                          </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{count} Candidate(s)</strong>
                        </div>
                      ))}
                      {Object.keys(performanceData.candidateDistribution || {}).length === 0 && (
                        <div style={{ fontStyle: 'italic', fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px' }}>No pipeline history log found.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Applicant Skills */}
                <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: 8 }}>Top Competency Skills In Pool:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {performanceData.topSkills?.map((sk, idx) => (
                      <span key={idx} className="skill-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '12px' }}>
                        🛡️ {sk}
                      </span>
                    ))}
                    {(!performanceData.topSkills || performanceData.topSkills.length === 0) && (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12.5px' }}>No applicant skill records found.</span>
                    )}
                  </div>
                </div>

                {/* AI Job Advice / Optimizations drawer */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <h5 style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🪄 AI Job Description Advisor
                  </h5>
                  
                  {jobAiInsightsLoading ? (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <div className="spinner" style={{ margin: '0 auto', width: 20, height: 20 }}></div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: 6 }}>Evaluating job requirements against sector indices...</span>
                    </div>
                  ) : !jobAiInsights ? (
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Failed to retrieve AI advice.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Missing Requirements */}
                        <div style={{ background: 'rgba(239, 68, 68, 0.03)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
                          <strong style={{ color: '#EF4444', fontSize: '12px', display: 'block', marginBottom: 6 }}>⚠️ Missing Common Requirements:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {jobAiInsights.missingRequirements?.map((r, idx) => (
                              <span key={idx} className="skill-tag" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '10.5px' }}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Keyword suggestions */}
                        <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
                          <strong style={{ color: '#10B981', fontSize: '12px', display: 'block', marginBottom: 6 }}>🚀 Suggested Keywords:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {jobAiInsights.keywordsSuggested?.map((k, idx) => (
                              <span key={idx} className="skill-tag" style={{ background: 'rgba(16, 185, 129, 0.05)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.15)', fontSize: '10.5px' }}>
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Skill recommendations */}
                      <div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '12.5px', display: 'block', marginBottom: 4 }}>💡 Top Recommended Skill Tags:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {jobAiInsights.skillRecommendations?.map((sk, idx) => (
                            <span key={idx} className="skill-tag" style={{ fontSize: '11px' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description improvement tips */}
                      <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                        <strong style={{ color: 'var(--primary)', fontSize: '12.5px', display: 'block', marginBottom: 4 }}>💡 Advice to Optimize Description:</strong>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {jobAiInsights.descriptionTips?.map((tip, idx) => (
                            <li key={idx} style={{ lineHeight: 1.4 }}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setShowPerformanceModal(false)}>Close Desk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
