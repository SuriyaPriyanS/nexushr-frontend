import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexushr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexushr_token')
      localStorage.removeItem('nexushr_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll: () => api.get('/api/employees'),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

// ── Attendance (Biometric Enhanced) ───────────────────────────────────────────
export const attendanceAPI = {
  /**
   * Get all attendance records
   */
  getAll: () => api.get('/api/attendance'),
  
  /**
   * Clock in with optional biometric data: { timestamp, method, confidence, verificationHash, landmarks? }
   * @param {Object} data - Attendance data with biometric verification
   */
  clockIn: (data) => api.post('/api/attendance/clockin', data),
  
  /**
   * Clock out with optional biometric data
   */
  clockOut: (data) => api.post('/api/attendance/clockout', data),
}

// ── Leave Requests ────────────────────────────────────────────────────────────
export const leaveAPI = {
  getAll: () => api.get('/api/leaverequests'),
  request: (data) => api.post('/api/leaverequests', data),
  updateStatus: (id, data) => api.put(`/api/leaverequests/${id}`, data),
}

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectAPI = {
  getAll: () => api.get('/api/projects'),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export const payrollAPI = {
  getAll: () => api.get('/api/payroll'),
  create: (data) => api.post('/api/payroll', data),
}

// ── Performance ───────────────────────────────────────────────────────────────
export const performanceAPI = {
  getAll: () => api.get('/api/performance'),
  create: (data) => api.post('/api/performance', data),
}

// ── Recruitment ───────────────────────────────────────────────────────────────
export const recruitmentAPI = {
  getJobs: () => api.get('/api/recruitment/jobs'),
  createJob: (data) => api.post('/api/recruitment/jobs', data),
  applyForJob: (data) => api.post('/api/recruitment/apply', data),
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export const onboardingAPI = {
  getPlan: () => api.get('/api/onboarding'),
  createPlan: (data) => api.post('/api/onboarding', data),
}

// ── Learning ──────────────────────────────────────────────────────────────────
export const learningAPI = {
  getCourses: () => api.get('/api/learning'),
  createCourse: (data) => api.post('/api/learning', data),
}

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentAPI = {
  getAll: () => api.get('/api/documents'),
  upload: (formData) => api.post('/api/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Expenses ──────────────────────────────────────────────────────────────────
export const expenseAPI = {
  getAll: () => api.get('/api/expenses'),
  create: (data) => api.post('/api/expenses', data),
}

// ── Kudos ─────────────────────────────────────────────────────────────────────
export const kudosAPI = {
  getAll: () => api.get('/api/kudos'),
  create: (data) => api.post('/api/kudos', data),
}

// ── Standups ──────────────────────────────────────────────────────────────────
export const standupAPI = {
  getAll: () => api.get('/api/standup'),
  create: (data) => api.post('/api/standup', data),
}

// ── Wellness ──────────────────────────────────────────────────────────────────
export const wellnessAPI = {
  getLogs: () => api.get('/api/wellness/logs'),
  createLog: (data) => api.post('/api/wellness/logs', data),
  getCareerPaths: () => api.get('/api/wellness/career'),
  createCareerPath: (data) => api.post('/api/wellness/career', data),
  getSocialEvents: () => api.get('/api/wellness/social'),
  createSocialEvent: (data) => api.post('/api/wellness/social', data),
  getSentimentReports: () => api.get('/api/wellness/sentiment'),
  createSentimentReport: (data) => api.post('/api/wellness/sentiment', data),
  createCoachingSession: (data) => api.post('/api/wellness/coaching', data),
}

// ── AI & Analytics ────────────────────────────────────────────────────────────
export const aiAPI = {
  getDashboardStats: () => api.get('/api/ai/analytics/dashboard'),
  getAnalytics: () => api.get('/api/ai/analytics'),
  saveTeamRecommendation: (data) => api.post('/api/ai/staffing', data),
  saveAssistantChat: (data) => api.post('/api/ai/assistant', data),
}

export default api
