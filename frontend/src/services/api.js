import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return API.post('/auth/upload-resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Jobs
export const searchJobs = (params) => API.get('/jobs/search', { params });
export const getAllJobs = () => API.get('/jobs/all');
export const getJob = (id) => API.get(`/jobs/${id}`);
export const getRecommendedJobs = () => API.get('/seeker/recommended-jobs');
export const applyToJob = (jobId, data) => API.post(`/seeker/jobs/${jobId}/apply`, data);
export const getSeekerApplications = () => API.get('/seeker/applications');

// Employer
export const createJob = (data) => API.post('/employer/jobs', data);
export const getEmployerJobs = () => API.get('/employer/jobs');
export const updateJob = (id, data) => API.put(`/employer/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/employer/jobs/${id}`);
export const getJobApplications = (jobId) => API.get(`/employer/jobs/${jobId}/applications`);
export const updateApplicationStatus = (appId, data) => API.put(`/employer/applications/${appId}/status`, data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markAllRead = () => API.put('/notifications/mark-all-read');
export const markRead = (id) => API.put(`/notifications/${id}/read`);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/admin/users');
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const toggleUser = (id) => API.put(`/admin/users/${id}/toggle`);
export const getPendingJobs = () => API.get('/admin/jobs/pending');
export const approveJob = (id) => API.put(`/admin/jobs/${id}/approve`);
export const adminDeleteJob = (id) => API.delete(`/admin/jobs/${id}`);

// AI Features
export const getGapAnalysis = (jobId) => API.get(`/seeker/jobs/${jobId}/gap-analysis`);
export const getAtsScore = () => API.get('/seeker/ats-score');
export const getInterviewQuestions = (jobId) => API.get(`/seeker/jobs/${jobId}/interview-questions`);
export const getRoadmap = () => API.get('/seeker/roadmap');
export const getEmployerAnalytics = (jobId) => API.get(`/employer/jobs/${jobId}/analytics`);
export const getCandidateInsights = (appId) => API.get(`/employer/applications/${appId}/insights`);
export const optimizeJobDescription = (data) => API.post('/employer/jobs/optimize-jd', data);

// Recruiter Experience Extensions
export const getApplicationHistory = (appId) => API.get(`/employer/applications/${appId}/history`);
export const addRecruiterNote = (appId, data) => API.post(`/employer/applications/${appId}/notes`, data);
export const getRecruiterNotes = (appId) => API.get(`/employer/applications/${appId}/notes`);
export const getCandidateTimeline = (appId) => API.get(`/employer/applications/${appId}/timeline`);
export const compareCandidates = (data) => API.post('/employer/applications/compare', data);
export const getJobPerformance = (jobId) => API.get(`/employer/jobs/${jobId}/performance`);
export const getJobAiInsights = (jobId) => API.get(`/employer/jobs/${jobId}/ai-insights`);
export const searchCandidates = (params) => API.get('/employer/candidates/search', { params });

// Seeker Profile Extensions
export const getSeekerProfile = () => API.get('/seeker/profile');
export const updateSeekerProfile = (data) => API.put('/seeker/profile', data);
export const getProfileCompletion = () => API.get('/seeker/profile-completion');
export const getSeekerAnalytics = () => API.get('/seeker/applications/analytics');

export const addSeekerSkill = (data) => API.post('/seeker/skills', data);
export const deleteSeekerSkill = (id) => API.delete(`/seeker/skills/${id}`);
export const addSeekerCert = (data) => API.post('/seeker/certifications', data);
export const deleteSeekerCert = (id) => API.delete(`/seeker/certifications/${id}`);
export const addSeekerProject = (data) => API.post('/seeker/projects', data);
export const deleteSeekerProject = (id) => API.delete(`/seeker/projects/${id}`);
export const addSeekerExperience = (data) => API.post('/seeker/experience', data);
export const deleteSeekerExperience = (id) => API.delete(`/seeker/experience/${id}`);
export const addSeekerIntern = (data) => API.post('/seeker/internships', data);
export const deleteSeekerIntern = (id) => API.delete(`/seeker/internships/${id}`);
export const toggleSavedJob = (jobId) => API.post(`/seeker/saved-jobs/${jobId}`);
export const getSavedJobs = () => API.get('/seeker/saved-jobs');

export default API;
