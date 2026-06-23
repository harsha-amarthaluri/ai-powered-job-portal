import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getSeekerApplications, 
  getRecommendedJobs, 
  getSeekerProfile, 
  updateSeekerProfile, 
  uploadResume, 
  getAtsScore, 
  getRoadmap, 
  getInterviewQuestions,
  getProfileCompletion,
  getSeekerAnalytics,
  addSeekerSkill,
  deleteSeekerSkill,
  addSeekerCert,
  deleteSeekerCert,
  addSeekerProject,
  deleteSeekerProject,
  addSeekerExperience,
  deleteSeekerExperience,
  addSeekerIntern,
  deleteSeekerIntern,
  toggleSavedJob,
  getSavedJobs
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  APPLIED: 'badge-info', 
  VIEWED: 'badge-warning', 
  SCREENING: 'badge-warning',
  SHORTLISTED: 'badge-primary',
  INTERVIEW_SCHEDULED: 'badge-success',
  TECHNICAL_ROUND: 'badge-success',
  HR_ROUND: 'badge-success',
  SELECTED: 'badge-success',
  REJECTED: 'badge-danger',
  HIRED: 'badge-success'
};

const pipelineStages = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'VIEWED', label: 'Viewed' },
  { key: 'SCREENING', label: 'Screening' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { key: 'TECHNICAL_ROUND', label: 'Tech Round' },
  { key: 'HR_ROUND', label: 'HR Round' },
  { key: 'SELECTED', label: 'Selected' },
  { key: 'HIRED', label: 'Hired' }
];

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

const SeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  
  // Custom states for industry seeker profile
  const [completion, setCompletion] = useState({ percentage: 0, checklist: {} });
  const [analytics, setAnalytics] = useState({ submitted: 0, shortlisted: 0, rejected: 0, interviews: 0, successRate: 0 });
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeSection, setActiveSection] = useState('personal');
  const [expandedAppId, setExpandedAppId] = useState(null);

  // Sub-resource Form States
  const [skillForm, setSkillForm] = useState({ skillName: '', skillType: 'Technical Skills', proficiencyLevel: 'Intermediate' });
  const [certForm, setCertForm] = useState({ certificateName: '', organization: '', issueDate: '', expiryDate: '', credentialId: '', verificationLink: '' });
  const [projForm, setProjForm] = useState({ projectTitle: '', description: '', technologiesUsed: '', githubLink: '', liveDemoLink: '', duration: '', teamSize: 1, role: 'Developer' });
  const [expForm, setExpForm] = useState({ companyName: '', designation: '', employmentType: 'Full-time', startDate: '', endDate: '', currentWorkingStatus: false, responsibilities: '', technologiesUsed: '' });
  const [internForm, setInternForm] = useState({ organization: '', role: '', duration: '', skillsLearned: '', certificate: '' });
  const [profileRequestForm, setProfileRequestForm] = useState({});

  // Existing AI Feature States
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Simulator States
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [simQuestions, setSimQuestions] = useState(null);
  const [simJobTitle, setSimJobTitle] = useState('');
  const [simActiveTab, setSimActiveTab] = useState('hr');
  const [simIndex, setSimIndex] = useState(0);
  const [simAnswers, setSimAnswers] = useState({});

  useEffect(() => {
    loadAllSeekerData();
  }, []);

  const loadAllSeekerData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadApplications(),
        loadRecommended(),
        loadFullProfile(),
        loadCompletionGauge(),
        loadAnalytics(),
        loadSavedListings()
      ]);
    } catch {} finally { setLoading(false); }
  };

  const loadApplications = async () => {
    try { const res = await getSeekerApplications(); setApplications(res.data); } catch {}
  };

  const loadRecommended = async () => {
    try { const res = await getRecommendedJobs(); setRecommended(res.data); } catch {}
  };

  const loadFullProfile = async () => {
    try { 
      const res = await getSeekerProfile(); 
      setProfile(res.data); 
      // Initialize edit fields
      const p = res.data.seekerProfile || {};
      setProfileRequestForm({
        gender: p.gender || '',
        dateOfBirth: p.dateOfBirth || '',
        currentAddress: p.currentAddress || '',
        preferredLocation: p.preferredLocation || '',
        nationality: p.nationality || '',
        linkedinUrl: p.linkedinUrl || '',
        githubUrl: p.githubUrl || '',
        portfolioUrl: p.portfolioUrl || '',
        leetcodeUrl: p.leetcodeUrl || '',
        hackerrankUrl: p.hackerrankUrl || '',
        codechefUrl: p.codechefUrl || '',
        otherProfessionalLinks: p.otherProfessionalLinks || '',
        tenthSchoolName: p.tenthSchoolName || '',
        tenthBoard: p.tenthBoard || '',
        tenthYear: p.tenthYear || '',
        tenthPercentage: p.tenthPercentage || '',
        twelfthInstitution: p.twelfthInstitution || '',
        twelfthBoard: p.twelfthBoard || '',
        twelfthYear: p.twelfthYear || '',
        twelfthPercentage: p.twelfthPercentage || '',
        gradCollege: p.gradCollege || '',
        gradUniversity: p.gradUniversity || '',
        gradDegree: p.gradDegree || 'Bachelor of Technology',
        gradBranch: p.gradBranch || '',
        gradStartDate: p.gradStartDate || '',
        gradEndDate: p.gradEndDate || '',
        gradCgpa: p.gradCgpa || '',
        pgCollege: p.pgCollege || '',
        pgUniversity: p.pgUniversity || '',
        pgDegree: p.pgDegree || '',
        pgBranch: p.pgBranch || '',
        pgStartDate: p.pgStartDate || '',
        pgEndDate: p.pgEndDate || '',
        pgCgpa: p.pgCgpa || '',
        preferredRole: p.preferredRole || '',
        preferredLocationPref: p.preferredLocationPref || '',
        expectedSalary: p.expectedSalary || '',
        employmentType: p.employmentType || 'Full-time',
        workMode: p.workMode || 'Remote',
        resumeVisibility: p.resumeVisibility !== false,
        contactVisibility: p.contactVisibility !== false,
        profileVisibility: p.profileVisibility !== false
      });
    } catch {}
  };

  const loadCompletionGauge = async () => {
    try { const res = await getProfileCompletion(); setCompletion(res.data); } catch {}
  };

  const loadAnalytics = async () => {
    try { const res = await getSeekerAnalytics(); setAnalytics(res.data); } catch {}
  };

  const loadSavedListings = async () => {
    try { const res = await getSavedJobs(); setSavedJobs(res.data); } catch {}
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateSeekerProfile(profileRequestForm);
      setMsg('Profile specifications saved directly to MySQL database!');
      await loadFullProfile();
      await loadCompletionGauge();
    } catch {
      setMsg('Failed to update seeker specifications.');
    } finally { setLoading(false); }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setResumeUploading(true);
    try {
      await uploadResume(resumeFile);
      setMsg('Resume compiled, parsed, and mapped into database fields!');
      await loadFullProfile();
      await loadCompletionGauge();
      setAtsData(null);
      setRoadmapData(null);
    } catch {
      setMsg('Resume upload and extraction failed.');
    } finally { setResumeUploading(false); }
  };

  // Sub-resource triggers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skillName) return;
    try {
      await addSeekerSkill(skillForm);
      setSkillForm({ skillName: '', skillType: 'Technical Skills', proficiencyLevel: 'Intermediate' });
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Skill saved successfully to custom skill stack!');
    } catch {}
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSeekerSkill(id);
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Skill removed from stack.');
    } catch {}
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!certForm.certificateName || !certForm.organization) return;
    try {
      await addSeekerCert(certForm);
      setCertForm({ certificateName: '', organization: '', issueDate: '', expiryDate: '', credentialId: '', verificationLink: '' });
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Professional certification credential cataloged!');
    } catch {}
  };

  const handleDeleteCert = async (id) => {
    try {
      await deleteSeekerCert(id);
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Certification removed.');
    } catch {}
  };

  const handleAddProj = async (e) => {
    e.preventDefault();
    if (!projForm.projectTitle || !projForm.description) return;
    try {
      await addSeekerProject(projForm);
      setProjForm({ projectTitle: '', description: '', technologiesUsed: '', githubLink: '', liveDemoLink: '', duration: '', teamSize: 1, role: 'Developer' });
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Project portfolio node updated in database!');
    } catch {}
  };

  const handleDeleteProj = async (id) => {
    try {
      await deleteSeekerProject(id);
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Project portfolio item deleted.');
    } catch {}
  };

  const handleAddExp = async (e) => {
    e.preventDefault();
    if (!expForm.companyName || !expForm.designation) return;
    try {
      await addSeekerExperience(expForm);
      setExpForm({ companyName: '', designation: '', employmentType: 'Full-time', startDate: '', endDate: '', currentWorkingStatus: false, responsibilities: '', technologiesUsed: '' });
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Work history record stored successfully!');
    } catch {}
  };

  const handleDeleteExp = async (id) => {
    try {
      await deleteSeekerExperience(id);
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Work experience node deleted.');
    } catch {}
  };

  const handleAddIntern = async (e) => {
    e.preventDefault();
    if (!internForm.organization || !internForm.role) return;
    try {
      await addSeekerIntern(internForm);
      setInternForm({ organization: '', role: '', duration: '', skillsLearned: '', certificate: '' });
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Internship details successfully saved.');
    } catch {}
  };

  const handleDeleteIntern = async (id) => {
    try {
      await deleteSeekerIntern(id);
      await loadFullProfile();
      await loadCompletionGauge();
      setMsg('Internship details deleted.');
    } catch {}
  };

  const handleToggleBookmark = async (jobId, e) => {
    e.stopPropagation();
    try {
      const saved = await toggleSavedJob(jobId);
      await loadSavedListings();
      setMsg(saved ? 'Opportunity bookmarked to Saved Jobs list!' : 'Opportunity removed from Saved Jobs.');
    } catch {}
  };

  // Fetch AI scripts
  const fetchRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await getRoadmap();
      setRoadmapData(res.data);
    } catch {
      setMsg('Failed to generate career roadmap.');
    } finally { setRoadmapLoading(false); }
  };

  const fetchAtsScore = async () => {
    setAtsLoading(true);
    try {
      const res = await getAtsScore();
      setAtsData(res.data);
    } catch {
      setMsg('Failed to run ATS resume score audit.');
    } finally { setAtsLoading(false); }
  };

  const openSimulator = async (jobId, jobTitle) => {
    setSimulatorLoading(true);
    setSimJobTitle(jobTitle);
    setSimulatorOpen(true);
    setSimIndex(0);
    setSimActiveTab('hr');
    try {
      const res = await getInterviewQuestions(jobId);
      setSimQuestions(res.data);
    } catch {
      setMsg('Failed to generate interview simulator questions.');
      setSimulatorOpen(false);
    } finally { setSimulatorLoading(false); }
  };

  const activeQuestions = () => {
    if (!simQuestions) return [];
    switch (simActiveTab) {
      case 'hr': return simQuestions.hrQuestions || [];
      case 'tech': return simQuestions.technicalQuestions || [];
      case 'project': return simQuestions.projectQuestions || [];
      case 'role': return simQuestions.roleQuestions || [];
      default: return [];
    }
  };

  return (
    <div className="container page animate-fade-up">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div className="page-title">Candidate Dashboard 🚀</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Flat Resume Upload Indicator */}
          <input 
            type="file" 
            id="hidden-resume-file" 
            style={{ display: 'none' }} 
            onChange={e => setResumeFile(e.target.files[0])}
            accept=".pdf,.doc,.docx"
          />
          {resumeFile ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>📄 {resumeFile.name.slice(0, 15)}...</span>
              <button className="btn btn-primary btn-sm" onClick={handleResumeUpload} disabled={resumeUploading}>
                {resumeUploading ? 'Parsing...' : 'Upload & Parse'}
              </button>
            </div>
          ) : (
            <label htmlFor="hidden-resume-file" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload Resume
            </label>
          )}
        </div>
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
          { key: 'applications', label: '📋 Application Funnel' },
          { key: 'recommended', label: '⭐ Recommended' },
          { key: 'saved', label: '🔖 Bookmarks' },
          { key: 'roadmap', label: '🗺️ Career Roadmap' },
          { key: 'ats', label: '📊 ATS Audit' },
          { key: 'profile', label: '👤 Profile Builder' }
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'dashboard' && (
        <>
          {/* Profile Completion & Analytical KPI stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Completion Gauge Radial Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px' }}>
              {/* Radial Completion Meter */}
              <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" stroke="var(--border)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="var(--primary)" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (completion.percentage / 100) * 2 * Math.PI * 40}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                  {completion.percentage}%
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Profile Completion</h4>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>Complete your profile database sectors to stand out to hiring recruiters.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => setTab('profile')}>Complete Profile →</button>
              </div>
            </div>

            {/* Analytics Stats Dashboard */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '20px 24px' }}>
              <div style={{ padding: '8px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{analytics.submitted}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Applied Submissions</div>
              </div>
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#22C55E' }}>{analytics.shortlisted}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Shortlisted & Hired</div>
              </div>
              <div style={{ padding: '8px', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>{analytics.interviews}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Scheduled Interviews</div>
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{analytics.successRate}%</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Interview Callback Rate</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
            {/* Recent Submissions */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Recent Applications Funnel
                </h3>
                <button onClick={() => setTab('applications')} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Manage Funnels →
                </button>
              </div>
              
              {applications.length === 0 ? (
                <div className="empty-state" style={{ padding: '36px' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No active applications found. <Link to="/jobs" style={{ color: 'var(--primary)', fontWeight: 600 }}>Apply to jobs now</Link></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {applications.slice(0, 4).map(app => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)' }}>{app.jobTitle}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>🏢 {app.company}</div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span className={`badge ${statusColors[app.status]}`} style={{ minWidth: '100px', textAlign: 'center', fontSize: '11px' }}>{app.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist Box */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Profile Completion Checklist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(completion.checklist || {}).map(([key, done]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <div style={{ 
                      width: 18, height: 18, borderRadius: '50%', 
                      background: done ? 'var(--success)' : 'var(--border)', 
                      color: done ? 'white' : 'transparent', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 10, fontWeight: 'bold' 
                    }}>
                      ✓
                    </div>
                    <span style={{ color: done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* APPLICATION LIFE CYCLE FUNNEL TAB */}
      {tab === 'applications' && (
        <div className="card">
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Interactive Application Life Cycle Timelines</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Select an application to expand its full professional recruitment tracker stage timeline.</p>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No applications yet</h3>
              <p>Apply to your preferred career listings to see trackers here.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')}>Browse Jobs</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {applications.map(app => {
                const isExpanded = expandedAppId === app.id;
                // Calculate current active pipeline index
                const activeIndex = pipelineStages.findIndex(s => s.key === app.status);

                return (
                  <div key={app.id} className="card" style={{ padding: '20px 24px', borderLeft: isExpanded ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>{app.jobTitle}</h4>
                        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>🏢 {app.company} | 📍 {app.location}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span className={`badge ${statusColors[app.status]}`} style={{ minWidth: '100px', textAlign: 'center' }}>{app.status}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExpandedAppId(isExpanded ? null : app.id)}>
                          {isExpanded ? 'Hide Tracker' : 'Track Lifecycle ➔'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="animate-fade-up" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                        <h5 style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 16 }}>Detailed Pipeline Status Tracker</h5>
                        
                        {/* Status Nodes row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', paddingBottom: 10, gap: 10 }}>
                          {pipelineStages.map((stage, idx) => {
                            const completed = idx < activeIndex;
                            const active = idx === activeIndex;
                            
                            let nodeBg = 'var(--border)';
                            let nodeBorder = '2px solid var(--border)';
                            let labelColor = 'var(--text-secondary)';
                            
                            if (app.status === 'REJECTED') {
                              if (active) {
                                nodeBg = '#EF4444';
                                nodeBorder = '3px solid #EF4444';
                                labelColor = '#EF4444';
                              } else if (completed) {
                                nodeBg = '#E2E8F0';
                                nodeBorder = '2px solid #CBD5E1';
                              }
                            } else {
                              if (active) {
                                nodeBg = 'var(--primary)';
                                nodeBorder = '3px solid var(--primary-light)';
                                labelColor = 'var(--primary)';
                              } else if (completed) {
                                nodeBg = '#22C55E';
                                nodeBorder = '2px solid #22C55E';
                                labelColor = 'var(--text-primary)';
                              }
                            }

                            return (
                              <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', flex: 1, textAlign: 'center' }}>
                                {/* Pipeline node circle */}
                                <div style={{ 
                                  width: 28, height: 28, borderRadius: '50%', 
                                  background: nodeBg, border: nodeBorder, 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  color: 'white', fontWeight: 'bold', fontSize: 10,
                                  marginBottom: 6, transition: 'all 0.3s ease'
                                }}>
                                  {completed ? '✓' : idx + 1}
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: active ? 800 : 500, color: labelColor }}>
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {app.employerNote && (
                          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                            <strong>Feedback from hiring manager:</strong> "{app.employerNote}"
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openSimulator(app.jobId, app.jobTitle)}>
                            🎯 AI Practice Prep Session
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RECOMMENDED TAB */}
      {tab === 'recommended' && (
        <div>
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'default' }}>
            <span style={{ fontSize: 14 }}>
              AI Job recommendations are dynamically mapped to your SQL skills profile: <strong>{profile?.skills || 'No skills added.'}</strong>
            </span>
          </div>
          
          {recommended.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <h3>No recommendations yet</h3>
              <p>Add skills in the Profile Builder to query AI-recommended openings.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('profile')}>Open Profile Builder</button>
            </div>
          ) : (
            <div className="jobs-grid">
              {recommended.map(job => (
                <div key={job.id} className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
                  <div className="job-card-header">
                    <div>
                      <div className="job-title">{job.title}</div>
                      <div className="job-company">🏢 {job.company}</div>
                    </div>
                    {job.matchScore != null && (
                      <MatchCircle score={job.matchScore} />
                    )}
                  </div>
                  
                  <div className="job-meta">
                    <span className="job-meta-item">📍 {job.location}</span>
                    {job.salary && <span className="job-meta-item">₹ {job.salary}</span>}
                  </div>
                  
                  {job.skills && (
                    <div className="job-skills">
                      {job.skills.split(',').slice(0, 3).map((s, i) => (
                        <span key={i} className="skill-tag">{s.trim()}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={(e) => handleToggleBookmark(job.id, e)}
                      style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}
                    >
                      🔖 {savedJobs.some(s => s.job.id === job.id) ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1.5, fontSize: 12 }}>View Details →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKMARKS TAB */}
      {tab === 'saved' && (
        <div className="card">
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Saved Opportunities & Bookmarks</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Keep track of career positions you bookmarked across the portal.</p>
          
          {savedJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔖</div>
              <h3>No bookmarked vacancies</h3>
              <p>Bookmark open positions while browsing to store them here.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')}>Browse Jobs</button>
            </div>
          ) : (
            <div className="jobs-grid">
              {savedJobs.map(item => {
                const job = item.job;
                return (
                  <div key={item.id} className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <div className="job-card-header">
                      <div>
                        <div className="job-title">{job.title}</div>
                        <div className="job-company">🏢 {job.company}</div>
                      </div>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={(e) => handleToggleBookmark(job.id, e)}
                        style={{ padding: '4px 8px', fontSize: 11 }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="job-meta">
                      <span className="job-meta-item">📍 {job.location}</span>
                      {job.salary && <span className="job-meta-item">₹ {job.salary}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Saved: {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}</span>
                      <span style={{ color: 'var(--primary)', fontSize: 12.5, fontWeight: 700 }}>Apply Now →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PROFILE BUILDER ACCORDIONS */}
      {tab === 'profile' && profile && (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          {/* Circular Completion Badge Header */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, borderTop: '4px solid var(--primary)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {completion.percentage}%
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>MySQL Seeker Profile Builder</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Build out your structured profile segments below to enable dynamic matcher rankings.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'personal' ? null : 'personal')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>⚙️ 1. Personal Specifications</span>
                <span>{activeSection === 'personal' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'personal' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Full Name *</label>
                      <input className="form-control" value={profile.fullName || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} /></div>
                    <div className="form-group"><label className="form-label">Email Address *</label>
                      <input className="form-control" value={profile.email || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Mobile Number</label>
                      <input className="form-control" value={profileRequestForm.phone || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Location (City, Country)</label>
                      <input className="form-control" value={profileRequestForm.location || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, location: e.target.value })} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Gender</label>
                      <select className="form-control" value={profileRequestForm.gender || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gender: e.target.value })}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Rather not say">Rather not say</option>
                      </select></div>
                    <div className="form-group"><label className="form-label">Date of Birth</label>
                      <input className="form-control" type="date" value={profileRequestForm.dateOfBirth || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, dateOfBirth: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Nationality</label>
                      <input className="form-control" value={profileRequestForm.nationality || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, nationality: e.target.value })} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Current Address</label>
                      <input className="form-control" value={profileRequestForm.currentAddress || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, currentAddress: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Preferred Location</label>
                      <input className="form-control" value={profileRequestForm.preferredLocation || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, preferredLocation: e.target.value })} /></div>
                  </div>

                  <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save Specifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ACADEMIC DETAILS */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'academics' ? null : 'academics')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>🎓 2. Academic Information</span>
                <span>{activeSection === 'academics' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'academics' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  
                  {/* 10th */}
                  <h4 style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', marginBottom: 12, marginTop: 0 }}>10th Class details</h4>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">School Name</label>
                      <input className="form-control" value={profileRequestForm.tenthSchoolName || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, tenthSchoolName: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Board (e.g. CBSE, State)</label>
                      <input className="form-control" value={profileRequestForm.tenthBoard || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, tenthBoard: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Year of Passing</label>
                      <input className="form-control" type="number" placeholder="2018" value={profileRequestForm.tenthYear || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, tenthYear: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Percentage / CGPA</label>
                      <input className="form-control" type="number" step="0.01" placeholder="e.g. 92.5" value={profileRequestForm.tenthPercentage || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, tenthPercentage: e.target.value })} /></div>
                  </div>

                  {/* 12th */}
                  <h4 style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', marginBottom: 12, marginTop: 18 }}>12th Class / Diploma details</h4>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Institution Name</label>
                      <input className="form-control" value={profileRequestForm.twelfthInstitution || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, twelfthInstitution: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Board / University</label>
                      <input className="form-control" value={profileRequestForm.twelfthBoard || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, twelfthBoard: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Year of Passing</label>
                      <input className="form-control" type="number" placeholder="2020" value={profileRequestForm.twelfthYear || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, twelfthYear: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Percentage / CGPA</label>
                      <input className="form-control" type="number" step="0.01" placeholder="e.g. 88.4" value={profileRequestForm.twelfthPercentage || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, twelfthPercentage: e.target.value })} /></div>
                  </div>

                  {/* Graduation */}
                  <h4 style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', marginBottom: 12, marginTop: 18 }}>Graduation details</h4>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">College Name</label>
                      <input className="form-control" value={profileRequestForm.gradCollege || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradCollege: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">University</label>
                      <input className="form-control" value={profileRequestForm.gradUniversity || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradUniversity: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Degree Name</label>
                      <input className="form-control" placeholder="B.Tech, B.Sc, BCA..." value={profileRequestForm.gradDegree || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradDegree: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Branch / Field</label>
                      <input className="form-control" placeholder="Computer Science..." value={profileRequestForm.gradBranch || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradBranch: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">CGPA / Percentage</label>
                      <input className="form-control" type="number" step="0.01" placeholder="e.g. 8.5" value={profileRequestForm.gradCgpa || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradCgpa: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Start Date</label>
                      <input className="form-control" type="date" value={profileRequestForm.gradStartDate || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradStartDate: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">End Date (Expected)</label>
                      <input className="form-control" type="date" value={profileRequestForm.gradEndDate || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, gradEndDate: e.target.value })} /></div>
                  </div>

                  <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save Academics</button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. PROFESSIONAL SOCIAL LINKS */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'links' ? null : 'links')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>🌐 3. Professional & Coding links</span>
                <span>{activeSection === 'links' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'links' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">LinkedIn profile URL</label>
                      <input className="form-control" placeholder="https://linkedin.com/in/username" value={profileRequestForm.linkedinUrl || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, linkedinUrl: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">GitHub profile URL</label>
                      <input className="form-control" placeholder="https://github.com/username" value={profileRequestForm.githubUrl || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, githubUrl: e.target.value })} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label className="form-label">LeetCode URL</label>
                      <input className="form-control" placeholder="https://leetcode.com/username" value={profileRequestForm.leetcodeUrl || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, leetcodeUrl: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">HackerRank URL</label>
                      <input className="form-control" placeholder="https://hackerrank.com/username" value={profileRequestForm.hackerrankUrl || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, hackerrankUrl: e.target.value })} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Portfolio Website</label>
                      <input className="form-control" placeholder="https://myportfolio.com" value={profileRequestForm.portfolioUrl || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, portfolioUrl: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Other URL (CodeChef, etc.)</label>
                      <input className="form-control" placeholder="Other reference link" value={profileRequestForm.otherProfessionalLinks || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, otherProfessionalLinks: e.target.value })} /></div>
                  </div>

                  <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save Portals</button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. SKILLS MANAGEMENT */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'skills' ? null : 'skills')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>🔨 4. Skills Catalog</span>
                <span>{activeSection === 'skills' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'skills' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  
                  {/* Current Skills list */}
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Skill Inventory</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {profile.seekerSkills && profile.seekerSkills.length > 0 ? (
                        profile.seekerSkills.map(s => (
                          <span key={s.id} className="skill-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {s.skillName} <strong style={{ color: 'var(--text-secondary)' }}>({s.proficiencyLevel})</strong>
                            <span onClick={() => handleDeleteSkill(s.id)} style={{ cursor: 'pointer', color: '#EF4444', fontWeight: 800, marginLeft: 4 }}>✕</span>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)' }}>No skills added. Add your skills below.</span>
                      )}
                    </div>
                  </div>

                  {/* Add skill form */}
                  <form onSubmit={handleAddSkill} style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: 13.5, fontWeight: 800 }}>Add a Skill</h5>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 11.5 }}>Skill Name</label>
                        <input className="form-control" placeholder="e.g. React, Docker, Python" value={skillForm.skillName} onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 11.5 }}>Skill Type</label>
                        <select className="form-control" value={skillForm.skillType} onChange={e => setSkillForm({ ...skillForm, skillType: e.target.value })}>
                          {['Technical Skills', 'Frameworks', 'Databases', 'Cloud Skills', 'AI/ML Skills', 'Soft Skills'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 11.5 }}>Proficiency Level</label>
                        <select className="form-control" value={skillForm.proficiencyLevel} onChange={e => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}>
                          {['Beginner', 'Intermediate', 'Expert'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button type="submit" className="btn btn-primary btn-sm">Add Skill</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* 5. WORK HISTORY */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>💼 5. Professional Work Experience</span>
                <span>{activeSection === 'experience' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'experience' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  
                  {/* Current Experience */}
                  {profile.workExperiences && profile.workExperiences.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      {profile.workExperiences.map(exp => (
                        <div key={exp.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', position: 'relative' }}>
                          <button 
                            onClick={() => handleDeleteExp(exp.id)} 
                            style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 800 }}
                          >
                            ✕
                          </button>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: 14.5, color: 'var(--text-primary)', fontWeight: 800 }}>{exp.designation}</h5>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏢 {exp.companyName} | 📅 {exp.startDate} - {exp.currentWorkingStatus ? 'Present' : exp.endDate}</div>
                          {exp.responsibilities && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.4 }}>{exp.responsibilities}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Experience form */}
                  <form onSubmit={handleAddExp} style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: 13.5, fontWeight: 800 }}>Add Work Experience</h5>
                    
                    <div className="form-row">
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Company Name *</label>
                        <input className="form-control" value={expForm.companyName} onChange={e => setExpForm({ ...expForm, companyName: e.target.value })} /></div>
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Designation / Title *</label>
                        <input className="form-control" value={expForm.designation} onChange={e => setExpForm({ ...expForm, designation: e.target.value })} /></div>
                    </div>

                    <div className="form-row">
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Start Date</label>
                        <input className="form-control" type="date" value={expForm.startDate} onChange={e => setExpForm({ ...expForm, startDate: e.target.value })} /></div>
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>End Date</label>
                        <input className="form-control" type="date" disabled={expForm.currentWorkingStatus} value={expForm.endDate} onChange={e => setExpForm({ ...expForm, endDate: e.target.value })} /></div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                        <input type="checkbox" id="current-working-chk" checked={expForm.currentWorkingStatus} onChange={e => setExpForm({ ...expForm, currentWorkingStatus: e.target.checked })} />
                        <label htmlFor="current-working-chk" style={{ marginLeft: 6, fontSize: 12.5, fontWeight: 600 }}>Currently Working Here</label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11.5 }}>Responsibilities & Achievements</label>
                      <textarea className="form-control" rows={3} placeholder="Describe what you built and scaled..." value={expForm.responsibilities} onChange={e => setExpForm({ ...expForm, responsibilities: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button type="submit" className="btn btn-primary btn-sm">Add Experience</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* 6. PROJECTS */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'projects' ? null : 'projects')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>📂 6. Projects Portfolio</span>
                <span>{activeSection === 'projects' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'projects' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  
                  {/* Current Projects */}
                  {profile.projects && profile.projects.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      {profile.projects.map(proj => (
                        <div key={proj.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', position: 'relative' }}>
                          <button 
                            onClick={() => handleDeleteProj(proj.id)} 
                            style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 800 }}
                          >
                            ✕
                          </button>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: 14.5, color: 'var(--text-primary)', fontWeight: 800 }}>{proj.projectTitle}</h5>
                          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>🛠️ Stack: {proj.technologiesUsed} | 👥 Team Size: {proj.teamSize}</div>
                          {proj.description && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.4 }}>{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Project Form */}
                  <form onSubmit={handleAddProj} style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: 13.5, fontWeight: 800 }}>Add a Project</h5>
                    
                    <div className="form-row">
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Project Title *</label>
                        <input className="form-control" value={projForm.projectTitle} onChange={e => setProjForm({ ...projForm, projectTitle: e.target.value })} /></div>
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Role in Project</label>
                        <input className="form-control" placeholder="e.g. Lead, Frontend Developer" value={projForm.role} onChange={e => setProjForm({ ...projForm, role: e.target.value })} /></div>
                    </div>

                    <div className="form-row">
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>GitHub Repo Link</label>
                        <input className="form-control" placeholder="https://github.com/..." value={projForm.githubLink} onChange={e => setProjForm({ ...projForm, githubLink: e.target.value })} /></div>
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Live Demo Link</label>
                        <input className="form-control" placeholder="https://..." value={projForm.liveDemoLink} onChange={e => setProjForm({ ...projForm, liveDemoLink: e.target.value })} /></div>
                    </div>

                    <div className="form-row">
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Technologies Used (comma separated)</label>
                        <input className="form-control" placeholder="react, mysql, docker" value={projForm.technologiesUsed} onChange={e => setProjForm({ ...projForm, technologiesUsed: e.target.value })} /></div>
                      <div className="form-group"><label className="form-label" style={{ fontSize: 11.5 }}>Team Size</label>
                        <input className="form-control" type="number" value={projForm.teamSize} onChange={e => setProjForm({ ...projForm, teamSize: parseInt(e.target.value) })} /></div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11.5 }}>Description</label>
                      <textarea className="form-control" rows={3} placeholder="Describe the project goal, scope, and technical milestones..." value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button type="submit" className="btn btn-primary btn-sm">Add Project</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* 7. PREFERENCES & PRIVACY */}
            <div className="card" style={{ padding: 0 }}>
              <div 
                onClick={() => setActiveSection(activeSection === 'privacy' ? null : 'privacy')}
                style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}
              >
                <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>🛡️ 7. Job Preferences & Profile Privacy</span>
                <span>{activeSection === 'privacy' ? '▼' : '►'}</span>
              </div>

              {activeSection === 'privacy' && (
                <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                  
                  <h4 style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', marginBottom: 12, marginTop: 0 }}>Career Preferences</h4>
                  
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Preferred Role / Title</label>
                      <input className="form-control" placeholder="e.g. Backend Engineer" value={profileRequestForm.preferredRole || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, preferredRole: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Preferred Location</label>
                      <input className="form-control" placeholder="e.g. Bangalore, Remote" value={profileRequestForm.preferredLocationPref || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, preferredLocationPref: e.target.value })} /></div>
                  </div>

                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Expected Annual Salary (LPA)</label>
                      <input className="form-control" type="number" step="0.5" placeholder="e.g. 8.5" value={profileRequestForm.expectedSalary || ''} onChange={e => setProfileRequestForm({ ...profileRequestForm, expectedSalary: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Work Mode Preference</label>
                      <select className="form-control" value={profileRequestForm.workMode || 'Remote'} onChange={e => setProfileRequestForm({ ...profileRequestForm, workMode: e.target.value })}>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                      </select></div>
                  </div>

                  <h4 style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--primary)', marginBottom: 12, marginTop: 18 }}>Profile Privacy Controls</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" id="chk-resume-vis" checked={profileRequestForm.resumeVisibility} onChange={e => setProfileRequestForm({ ...profileRequestForm, resumeVisibility: e.target.checked })} />
                      <label htmlFor="chk-resume-vis" style={{ marginLeft: 8, fontSize: 13, color: 'var(--text-primary)' }}>Allow recruiters to search and download my resume document.</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" id="chk-contact-vis" checked={profileRequestForm.contactVisibility} onChange={e => setProfileRequestForm({ ...profileRequestForm, contactVisibility: e.target.checked })} />
                      <label htmlFor="chk-contact-vis" style={{ marginLeft: 8, fontSize: 13, color: 'var(--text-primary)' }}>Display my mobile number and email address to hiring managers.</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" id="chk-profile-vis" checked={profileRequestForm.profileVisibility} onChange={e => setProfileRequestForm({ ...profileRequestForm, profileVisibility: e.target.checked })} />
                      <label htmlFor="chk-profile-vis" style={{ marginLeft: 8, fontSize: 13, color: 'var(--text-primary)' }}>Allow my entire structured database profile to be searchable.</label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyitems: 'flex-end', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save Preferences</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ROADMAP TAB */}
      {tab === 'roadmap' && (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
              AI Career Roadmap Simulator
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24 }}>Based on your core listed skills, we design target educational and system development trajectories.</p>

            {roadmapLoading ? (
              <div className="loading-center" style={{ padding: '40px' }}><div className="spinner"></div></div>
            ) : !roadmapData ? (
              <div className="empty-state">
                <p>Failed to load roadmap data. Click refresh to query again.</p>
                <button className="btn btn-primary" onClick={fetchRoadmap}>Generate Roadmap</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, background: 'var(--bg-primary)', padding: '18px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Your Current Skills Core</span>
                    <div className="job-skills" style={{ marginTop: 6, paddingTop: 0 }}>
                      {roadmapData.currentSkills && roadmapData.currentSkills.length > 0 ? (
                        roadmapData.currentSkills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)
                      ) : (
                        <span style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--text-muted)' }}>No skills added. Add skills in Profile Builder to get optimized recommendations.</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Recommended Adjacent Technologies</span>
                    <div className="job-skills" style={{ marginTop: 6, paddingTop: 0 }}>
                      {roadmapData.recommendedSkills && roadmapData.recommendedSkills.map((s, i) => (
                        <span key={i} className="skill-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ position: 'absolute', left: '16px', top: '12px', bottom: '12px', width: '2px', background: 'var(--border)' }}></div>
                  
                  {roadmapData.learningPath && roadmapData.learningPath.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary)', border: '4px solid var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, flexShrink: 0 }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: 12 }}>{idx + 1}</span>
                      </div>
                      
                      <div className="card" style={{ flex: 1, padding: '20px 24px', borderTop: '3px solid var(--primary)', background: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <h4 style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>{step.step}</h4>
                          <span className="badge badge-primary">{step.duration}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Syllabus Core:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{step.topics}</span>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Recommended Free Resources:</strong>{' '}
                            <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{step.resources}</span>
                          </div>
                          <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', marginTop: 4 }}>
                            <strong style={{ color: 'var(--primary)', display: 'block', fontSize: 12.5, marginBottom: 2 }}>Target Portfolio Project:</strong>
                            <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step.project}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATS AUDIT TAB */}
      {tab === 'ats' && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              ATS Resume Score & Section Audit
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24 }}>Ensure your profile and document are structured correctly to satisfy ATS sorting parser standards.</p>

            {atsLoading ? (
              <div className="loading-center" style={{ padding: '40px' }}><div className="spinner"></div></div>
            ) : !atsData ? (
              <div className="empty-state">
                <p>Failed to run ATS scanner. Click below to execute a detailed audit on your credentials.</p>
                <button className="btn btn-primary" onClick={fetchAtsScore}>Run ATS Scan</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '24px 0', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '5px solid var(--border)', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: atsData.atsScore >= 75 ? '#22C55E' : atsData.atsScore >= 50 ? '#F59E0B' : '#EF4444' }}>
                      {atsData.atsScore}%
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 14.5 }}>
                    Resume Parsing Grade:{' '}
                    {atsData.atsScore >= 75 ? (
                      <span style={{ color: '#22C55E' }}>Excellent Match Ready</span>
                    ) : atsData.atsScore >= 50 ? (
                      <span style={{ color: '#F59E0B' }}>Moderately Optimized</span>
                    ) : (
                      <span style={{ color: '#EF4444' }}>Needs Attention</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                  {[
                    { key: 'skillsSection', label: 'Technical Keywords Section' },
                    { key: 'experienceSection', label: 'Impact Experience Segment' },
                    { key: 'educationSection', label: 'Academic Credentials Field' },
                    { key: 'contactDetails', label: 'Contact Details Checked' }
                  ].map(sec => {
                    const isChecked = atsData.structureAnalysis && atsData.structureAnalysis[sec.key];
                    return (
                      <div key={sec.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: isChecked ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: isChecked ? '#22C55E' : '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                          {isChecked ? '✓' : '✕'}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: isChecked ? '#22C55E' : '#EF4444' }}>
                          {sec.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <h4 style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)', marginBottom: 12 }}>
                    ATS Actionable Content Recommendations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {atsData.recommendations && atsData.recommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {simulatorOpen && (
        <div className="modal-overlay" onClick={() => setSimulatorOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div className="modal-title">AI Prep Simulator: {simJobTitle}</div>
              <button className="modal-close" onClick={() => setSimulatorOpen(false)}>×</button>
            </div>
            
            {simulatorLoading ? (
              <div className="loading-center"><div className="spinner"></div></div>
            ) : !simQuestions ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Failed to load mock sessions.</div>
            ) : (
              <div>
                <div className="tabs" style={{ marginBottom: 16 }}>
                  {['hr', 'tech', 'project', 'role'].map(tabKey => (
                    <button key={tabKey} className={`tab-btn ${simActiveTab === tabKey ? 'active' : ''}`} onClick={() => { setSimActiveTab(tabKey); setSimIndex(0); }}>
                      {tabKey.toUpperCase()} Round
                    </button>
                  ))}
                </div>

                <div className="card" style={{ background: 'var(--bg-secondary)', padding: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                    Question {simIndex + 1} of {activeQuestions().length}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {activeQuestions()[simIndex]}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Draft Your Response</label>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    placeholder="Type your answer here to evaluate..."
                    value={simAnswers[`${simActiveTab}_${simIndex}`] || ''}
                    onChange={e => setSimAnswers({ ...simAnswers, [`${simActiveTab}_${simIndex}`]: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyitems: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" disabled={simIndex === 0} onClick={() => setSimIndex(simIndex - 1)}>◄ Back</button>
                    <button className="btn btn-secondary btn-sm" disabled={simIndex === activeQuestions().length - 1} onClick={() => setSimIndex(simIndex + 1)}>Next ►</button>
                  </div>
                  <button className="btn btn-primary" onClick={() => { alert('Mock answer successfully submitted for AI analysis! Performance review logs updated.'); setSimulatorOpen(false); }}>
                    Save Answer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
