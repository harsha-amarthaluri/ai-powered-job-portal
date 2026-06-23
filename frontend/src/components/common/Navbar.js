import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount, getNotifications, markAllRead, markRead } from '../../services/api';
import Client from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Navbar = () => {
  const { user, logout, isSeeker, isEmployer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompRef = useRef(null);

  // Theme support
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      connectWebSocket();
    }
    return () => { if (stompRef.current) stompRef.current.deactivate(); };
  }, [user]);

  const fetchUnreadCount = () => {
    getUnreadCount().then(res => setUnreadCount(res.data.count)).catch(() => {});
  };

  const fetchNotifications = () => {
    getNotifications().then(res => setNotifications(res.data)).catch(() => {});
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const client = new Client.Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/user/queue/notifications`, (msg) => {
          const notif = JSON.parse(msg.body);
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompRef.current = client;
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await markRead(notif.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowNotif(false);
    if (notif.link) navigate(notif.link);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin';
    if (isEmployer()) return '/employer';
    if (isSeeker()) return '/seeker';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
          </svg>
          <span>Job</span>Portal
        </Link>

        <div className="navbar-links">
          <Link to="/jobs" className={isActive('/jobs')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Browse Jobs
          </Link>

          {/* Theme Switcher Toggle */}
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme" style={{ marginRight: 4 }}>
            {theme === 'light' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
              </svg>
            )}
          </button>

          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className={isActive(getDashboardLink())}>Dashboard</Link>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button className="nav-notif-btn" onClick={() => setShowNotif(!showNotif)}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                  </svg>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {showNotif && (
                  <div className="notif-dropdown">
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>Notifications</strong>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                        No notifications
                      </div>
                    ) : (
                      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.slice(0, 10).map((n, i) => (
                          <div key={i} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-time">
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/profile" className="nav-link" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', border: '1.5px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                  {user.fullName?.[0]?.toUpperCase()}
                </div>
                <span style={{ marginLeft: 2 }}>{user.fullName?.split(' ')[0]}</span>
              </Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ fontWeight: 600, padding: '7px 14px' }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
