import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, deleteUser, toggleUser, getPendingJobs, approveJob, adminDeleteJob } from '../services/api';

const AdminDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadPendingJobs();
  }, []);

  const loadStats = async () => {
    try { const res = await getAdminStats(); setStats(res.data); } catch {}
  };

  const loadUsers = async () => {
    setLoading(true);
    try { const res = await getAllUsers(); setUsers(res.data); }
    catch {} finally { setLoading(false); }
  };

  const loadPendingJobs = async () => {
    try { const res = await getPendingJobs(); setPendingJobs(res.data); } catch {}
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    setMsg('User deleted.');
    loadUsers(); loadStats();
  };

  const handleToggleUser = async (id) => {
    await toggleUser(id);
    setMsg('User status updated.');
    loadUsers();
  };

  const handleApproveJob = async (id) => {
    await approveJob(id);
    setMsg('Job approved and employer notified!');
    loadPendingJobs(); loadStats();
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await adminDeleteJob(id);
    setMsg('Job deleted.');
    loadPendingJobs(); loadStats();
  };

  const roleColor = { ROLE_SEEKER: 'badge-info', ROLE_EMPLOYER: 'badge-primary', ROLE_ADMIN: 'badge-danger' };
  const roleLabel = { ROLE_SEEKER: 'Seeker', ROLE_EMPLOYER: 'Employer', ROLE_ADMIN: 'Admin' };

  return (
    <div className="container page animate-fade-up">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div className="page-title">Admin Console ⚙️</div>
      </div>

      {msg && (
        <div className="alert alert-success animate-fade" onClick={() => setMsg('')} style={{ cursor: 'pointer' }}>
          <span>{msg}</span>
          <strong>✕</strong>
        </div>
      )}

      <div className="tabs">
        {[
          { key: 'dashboard', label: '📊 Overview' },
          { key: 'users', label: '👥 User Directory' },
          { key: 'jobs', label: '💼 Job Approvals' }
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="stat-card"><div className="stat-num">{stats.totalUsers || 0}</div><div className="stat-label">Total Users</div></div>
            <div className="stat-card"><div className="stat-num">{stats.totalSeekers || 0}</div><div className="stat-label">Job Seekers</div></div>
            <div className="stat-card"><div className="stat-num">{stats.totalEmployers || 0}</div><div className="stat-label">Employers</div></div>
            <div className="stat-card"><div className="stat-num">{stats.totalJobs || 0}</div><div className="stat-label">Total Jobs</div></div>
            <div className="stat-card"><div className="stat-num">{stats.openJobs || 0}</div><div className="stat-label">Open Jobs</div></div>
            <div className="stat-card"><div className="stat-num">{stats.totalApplications || 0}</div><div className="stat-label">Applications</div></div>
            <div className="stat-card" style={{ borderTopColor: stats.pendingApprovals > 0 ? 'var(--warning)' : 'var(--success)' }}>
              <div className="stat-num" style={{ color: stats.pendingApprovals > 0 ? 'var(--warning-dark)' : 'var(--success-dark)' }}>
                {stats.pendingApprovals || 0}
              </div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
          
          {pendingJobs.length > 0 && (
            <div className="card" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Awaiting Job Approvals
                </h3>
                <span className="badge badge-warning">{pendingJobs.length} reviews pending</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingJobs.slice(0, 3).map(job => (
                  <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)' }}>{job.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{job.company} • 📍 {job.location}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleApproveJob(job.id)} style={{ padding: '6px 12px' }}>
                        ✓ Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)} style={{ padding: '6px 12px' }}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {pendingJobs.length > 3 && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 18 }} onClick={() => setTab('jobs')}>
                  View all {pendingJobs.length} pending reviews →
                </button>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'users' && (
        <div className="card">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Date Joined</th>
                    <th>Account Status</th>
                    <th>Security Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.fullName}</td>
                      <td style={{ fontSize: 13.5 }}>{u.email}</td>
                      <td>
                        <span className={`badge ${roleColor[u.role] || 'badge-gray'}`}>
                          {roleLabel[u.role] || u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleToggleUser(u.id)} style={{ fontSize: 12 }}>
                            {u.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)} style={{ fontSize: 12 }}>
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

      {tab === 'jobs' && (
        <div className="card">
          <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Pending Job Approvals</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Review, approve or delete employer listings before publication.</p>
          </div>
          
          {pendingJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>All listings approved</h3>
              <p>No active job posts are currently awaiting administrator audit.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingJobs.map(job => (
                <div key={job.id} className="card" style={{ padding: '24px', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{job.title}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '6px 0', display: 'flex', gap: 12 }}>
                        <span>🏢 {job.company}</span>
                        <span>•</span>
                        <span>📍 {job.location}</span>
                        {job.salary && (
                          <>
                            <span>•</span>
                            <span>💰 {job.salary}</span>
                          </>
                        )}
                      </div>
                      
                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.5 }}>
                        {job.description}
                      </p>
                      
                      {job.skills && (
                        <div className="job-skills" style={{ marginTop: 12, paddingTop: 0 }}>
                          {job.skills.split(',').slice(0, 5).map((s, i) => (
                            <span key={i} className="skill-tag" style={{ fontSize: 11.5 }}>{s.trim()}</span>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
                        Listed by: <strong style={{ color: 'var(--text-secondary)' }}>{job.employerName}</strong> • {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-start' }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleApproveJob(job.id)} style={{ whiteSpace: 'nowrap' }}>
                        ✓ Approve post
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)} style={{ whiteSpace: 'nowrap' }}>
                        ✕ Reject post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
