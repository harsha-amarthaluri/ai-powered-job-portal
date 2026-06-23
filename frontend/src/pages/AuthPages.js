import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form);
      if (user.role === 'ROLE_ADMIN') navigate('/admin');
      else if (user.role === 'ROLE_EMPLOYER') navigate('/employer');
      else navigate('/seeker');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page animate-fade">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
          <span>Job</span>Portal
        </div>
        <div className="auth-subtitle">Sign in to your professional account</div>
        
        {error && (
          <div className="alert alert-danger" onClick={() => setError('')} style={{ cursor: 'pointer' }}>
            <span>{error}</span>
            <strong>✕</strong>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-control" 
              type="email" 
              placeholder="you@company.com"
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 28 }}>
            <label className="form-label">Password</label>
            <input 
              className="form-control" 
              type="password" 
              placeholder="••••••••"
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ height: '48px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: '2px', borderTopColor: 'white' }}></span>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-switch">
          Don't have a professional account? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'ROLE_SEEKER', companyName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await register(form);
      if (user.role === 'ROLE_EMPLOYER') navigate('/employer');
      else navigate('/seeker');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page animate-fade">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
          <span>Job</span>Portal
        </div>
        <div className="auth-subtitle">Create a professional account to get started</div>
        
        {error && (
          <div className="alert alert-danger" onClick={() => setError('')} style={{ cursor: 'pointer' }}>
            <span>{error}</span>
            <strong>✕</strong>
          </div>
        )}

        {/* Role Selectors */}
        <div className="auth-role-select">
          {[
            { 
              val: 'ROLE_SEEKER', 
              label: 'Job Seeker',
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            },
            { 
              val: 'ROLE_EMPLOYER', 
              label: 'Employer',
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"></rect><path d="M9 22V12h6v10M9 8h.01M15 8h.01M9 16h.01M15 16h.01"></path></svg>
            }
          ].map(r => {
            const isSelected = form.role === r.val;
            return (
              <button 
                key={r.val} 
                type="button"
                onClick={() => setForm({ ...form, role: r.val })}
                className="auth-role-btn"
                style={{ 
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {r.icon}
                {r.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-control" 
              placeholder="John Doe"
              value={form.fullName} 
              onChange={e => setForm({ ...form, fullName: e.target.value })} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-control" 
              type="email" 
              placeholder="you@company.com"
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
          
          {form.role === 'ROLE_EMPLOYER' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input 
                className="form-control" 
                placeholder="Google Inc."
                value={form.companyName} 
                onChange={e => setForm({ ...form, companyName: e.target.value })} 
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-control" 
              placeholder="+91 98765 43210"
              value={form.phone} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 28 }}>
            <label className="form-label">Password</label>
            <input 
              className="form-control" 
              type="password" 
              placeholder="Min. 6 characters"
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
              minLength={6} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ height: '48px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: '2px', borderTopColor: 'white' }}></span>
                Registering account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-switch">
          Already have a professional account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
