import axios from 'axios'

const isBrowser = typeof window !== 'undefined'

const sanitizeBase = (value) => {
  if (!value || value === '/') return '/'
  return String(value).replace(/\/+$/, '')
}

const readStoredApiBase = () => {
  if (!isBrowser) return ''
  try {
    return window.localStorage.getItem('nexushr_api_base') || ''
  } catch {
    return ''
  }
}

const readQueryApiBase = () => {
  if (!isBrowser) return ''
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('api')
    if (fromQuery) {
      window.localStorage.setItem('nexushr_api_base', fromQuery)
    }
    return fromQuery || ''
  } catch {
    return ''
  }
}

const resolveApiBase = () => {
  const fromQuery = sanitizeBase(readQueryApiBase())
  if (fromQuery && fromQuery !== '/') return fromQuery

  const fromStorage = sanitizeBase(readStoredApiBase())
  if (fromStorage && fromStorage !== '/') return fromStorage

  const fromEnv = sanitizeBase(import.meta.env.VITE_API_URL || '')
  if (fromEnv && fromEnv !== '/') return fromEnv

  return '/'
}

export const API_BASE = resolveApiBase()

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexushr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexushr_token')
      localStorage.removeItem('nexushr_user')
      if (isBrowser && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

const withData = (res, data) => ({ ...res, data })
const asArray = (value) => (Array.isArray(value) ? value : [])
const asObject = (value) => (value && typeof value === 'object' ? value : {})

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { firstName: '', lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

const normalizeUserLike = (item) => {
  const rawName = item?.name || [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim()
  const { firstName, lastName } = splitName(rawName)

  return {
    ...item,
    _id: item?._id || item?.id,
    id: item?.id || item?._id,
    name: rawName || item?.email || 'User',
    firstName: item?.firstName || firstName,
    lastName: item?.lastName || lastName,
  }
}

const normalizeEmployeeArray = (payload) => {
  const root = asObject(payload)
  const rows = asArray(root.employees || root.records || payload)
  return rows.map(normalizeUserLike)
}

const normalizeAttendanceArray = (payload) => {
  const root = asObject(payload)
  const rows = asArray(root.records || payload)

  return rows.map((record) => {
    const employeeName =
      record?.employee?.name ||
      record?.user?.name ||
      record?.employeeName ||
      'Employee'

    const employee = normalizeUserLike({ ...(record?.employee || {}), ...(record?.user || {}), name: employeeName })

    return {
      ...record,
      _id: record?._id || record?.id,
      id: record?.id || record?._id,
      employee,
      employeeName,
      clockIn: record?.clockIn || record?.checkIn || null,
      clockOut: record?.clockOut || record?.checkOut || null,
      date: record?.date || record?.clockIn || record?.checkIn || null,
      status: String(record?.status || 'Present'),
      method: record?.method || 'manual',
      confidence: record?.confidence ?? null,
      stats: root.stats || null,
    }
  })
}

const normalizeLeaveArray = (payload) => {
  const root = asObject(payload)
  const rows = asArray(root.requests || root.records || root.leaves || payload)

  return rows.map((leave) => {
    const employeeName = leave?.user?.name || leave?.employee?.name || leave?.employeeName || 'Employee'
    return {
      ...leave,
      _id: leave?._id || leave?.id,
      id: leave?.id || leave?._id,
      employee: normalizeUserLike({ ...(leave?.employee || {}), ...(leave?.user || {}), name: employeeName }),
      employeeName,
      leaveType: leave?.leaveType || leave?.type || 'Vacation',
      type: leave?.type || leave?.leaveType || 'Vacation',
      status: leave?.status || 'Pending',
    }
  })
}

const normalizeProjects = (payload) => asArray(payload).map((project) => ({
  ...project,
  _id: project?._id || project?.id,
  id: project?.id || project?._id,
}))

const normalizePayrollArray = (payload) => {
  const rows = asArray(asObject(payload).records || payload)

  return rows.map((payroll) => {
    const basicSalary = Number(
      payroll?.basicSalary ?? payroll?.basic ?? payroll?.breakdown?.basic ?? payroll?.salary ?? 0
    )
    const bonus = Number(
      payroll?.bonus ?? payroll?.allowance ?? payroll?.breakdown?.allowances ?? 0
    )
    const deductions = Number(
      payroll?.deductions ?? payroll?.tax ?? payroll?.breakdown?.deductions ?? 0
    )

    const period =
      payroll?.period ||
      [payroll?.month, payroll?.year].filter(Boolean).join(' ').trim() ||
      'N/A'

    return {
      ...payroll,
      _id: payroll?._id || payroll?.id,
      id: payroll?.id || payroll?._id,
      employee: normalizeUserLike(payroll?.user || payroll?.employee || {}),
      employeeName: payroll?.user?.name || payroll?.employeeName,
      basicSalary,
      bonus,
      deductions,
      period,
      status: payroll?.status || 'Pending',
    }
  })
}

const normalizePerformanceArray = (payload) => asArray(payload).map((review) => ({
  ...review,
  _id: review?._id || review?.id,
  id: review?.id || review?._id,
  employee: normalizeUserLike(review?.user || review?.employee || {}),
  employeeName: review?.user?.name || review?.employeeName,
  comments: review?.comments || review?.achievements || review?.improvements || '',
  reviewPeriod: review?.reviewPeriod || review?.period || 'Current',
}))

const normalizeRecruitmentArray = (payload) => {
  const rows = asArray(asObject(payload).postings || payload)
  return rows.map((job) => ({
    ...job,
    _id: job?._id || job?.id,
    id: job?.id || job?._id,
    employmentType: job?.employmentType || job?.type || 'Full-time',
    postedDate: job?.postedDate || job?.createdAt,
  }))
}

const normalizeOnboardingArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...item, _id: item?._id || item?.id, id: item?.id || item?._id }))
  }

  if (!payload || payload.message) return []

  return [{
    ...payload,
    _id: payload?._id || payload?.id,
    id: payload?.id || payload?._id,
  }]
}

const normalizeLearningArray = (payload) => asArray(asObject(payload).courses || payload).map((course) => ({
  ...course,
  _id: course?._id || course?.id,
  id: course?.id || course?._id,
}))

const normalizeDocumentsArray = (payload) => asArray(asObject(payload).documents || payload).map((doc) => ({
  ...doc,
  _id: doc?._id || doc?.id,
  id: doc?.id || doc?._id,
  uploadedBy: doc?.uploadedBy?.name || doc?.uploadedBy || doc?.owner || 'System',
  type: doc?.type || doc?.category || 'General',
  createdAt: doc?.createdAt || doc?.date,
}))

const normalizeExpensesArray = (payload) => asArray(asObject(payload).records || payload).map((expense) => ({
  ...expense,
  _id: expense?._id || expense?.id,
  id: expense?.id || expense?._id,
  employee: normalizeUserLike(expense?.user || expense?.employee || {}),
  employeeName: expense?.user?.name || expense?.employeeName,
  description: expense?.description || expense?.merchant || '',
}))

const normalizeKudosArray = (payload) => asArray(asObject(payload).records || payload).map((kudos) => ({
  ...kudos,
  _id: kudos?._id || kudos?.id,
  id: kudos?.id || kudos?._id,
  senderName: kudos?.from || kudos?.senderName,
  recipientName: kudos?.to || kudos?.recipientName,
}))

const normalizeStandupsArray = (payload) => asArray(payload).map((entry) => {
  const summary = entry?.summary || ''
  const pieces = summary.split('|').map((p) => p.trim())

  return {
    ...entry,
    _id: entry?._id || entry?.id,
    id: entry?.id || entry?._id,
    employee: normalizeUserLike(entry?.user || entry?.employee || {}),
    yesterday: entry?.yesterday || pieces[0] || '',
    today: entry?.today || pieces[1] || '',
    blockers: entry?.blockers || pieces[2] || '',
  }
})

const normalizeWellnessLogs = (payload) => asArray(payload).map((log) => {
  let activity = log?.activity || log?.type || 'Wellness'
  let duration = Number(log?.duration || 0)
  let caloriesBurned = Number(log?.caloriesBurned || 0)
  let date = log?.date || log?.createdAt

  const compact = log?.data?.original || log?.data?.reframed || ''
  if (typeof compact === 'string' && compact.includes('|')) {
    const [a, d, c, dt] = compact.split('|')
    activity = a || activity
    duration = Number(d || duration)
    caloriesBurned = Number(c || caloriesBurned)
    date = dt || date
  }

  return {
    ...log,
    _id: log?._id || log?.id,
    id: log?.id || log?._id,
    activity,
    duration,
    caloriesBurned,
    date,
  }
})

const normalizeSocialEvents = (payload) => asArray(payload).map((event) => ({
  ...event,
  _id: event?._id || event?.id,
  id: event?.id || event?._id,
  attendees: Array.isArray(event?.attendees) ? event.attendees.length : Number(event?.attendees || 0),
}))

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
}

export const employeeAPI = {
  getAll: () => api.get('/api/employees').then((res) => withData(res, normalizeEmployeeArray(res.data))),
  getById: (id) => api.get(`/api/employees/${id}`).then((res) => withData(res, normalizeUserLike(res.data))),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

export const attendanceAPI = {
  getAll: () => api.get('/api/attendance').then((res) => withData(res, normalizeAttendanceArray(res.data))),
  clockIn: (data = {}) => api.post('/api/attendance/clockin', data),
  clockOut: (data = {}) => api.put('/api/attendance/clockout', data),
}

export const leaveAPI = {
  getAll: () => api.get('/api/leaverequests').then((res) => withData(res, normalizeLeaveArray(res.data))),
  request: (data) => api.post('/api/leaverequests', {
    ...data,
    type: data?.type || data?.leaveType,
  }),
  updateStatus: (id, data) => api.put(`/api/leaverequests/${id}`, data),
}

export const projectAPI = {
  getAll: () => api.get('/api/projects').then((res) => withData(res, normalizeProjects(res.data))),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
}

export const payrollAPI = {
  getAll: () => api.get('/api/payroll').then((res) => withData(res, normalizePayrollArray(res.data))),
  create: (data) => {
    const baseSalary = Number(data?.basicSalary || data?.salary || 0)
    const deductions = Number(data?.deductions || data?.tax || 0)
    const bonus = Number(data?.bonus || data?.allowance || 0)
    const monthYear = String(data?.period || '').trim().split(/\s+/)

    return api.post('/api/payroll', {
      user: data?.user || { _id: data?.employeeId || data?.userId },
      month: data?.month || monthYear[0] || 'N/A',
      year: Number(data?.year || monthYear[1] || new Date().getFullYear()),
      salary: baseSalary,
      deductions,
      netSalary: baseSalary + bonus - deductions,
    })
  },
}

export const performanceAPI = {
  getAll: () => api.get('/api/performance').then((res) => withData(res, normalizePerformanceArray(res.data))),
  create: (data) => api.post('/api/performance', {
    user: data?.user || data?.employeeId,
    achievements: data?.comments || data?.achievements,
    improvements: data?.improvements || '',
    rating: Number(data?.rating || 0),
    reviewDate: data?.reviewDate,
  }),
}

export const recruitmentAPI = {
  getJobs: () => api.get('/api/recruitment').then((res) => withData(res, normalizeRecruitmentArray(res.data))),
  createJob: (data) => api.post('/api/recruitment', {
    ...data,
    type: data?.type || data?.employmentType,
  }),
  applyForJob: (id, data) => api.post(`/api/recruitment/${id}/apply`, data),
}

export const onboardingAPI = {
  getPlan: () => api.get('/api/onboarding').then((res) => withData(res, normalizeOnboardingArray(res.data))),
  createPlan: (data) => api.post('/api/onboarding', {
    user: data?.user || data?.employeeId || data?.userId,
    role: data?.role || 'Employee',
    department: data?.department || 'General',
    plan: data?.plan || `Onboarding plan for ${data?.employeeId || 'employee'}`,
  }),
}

export const learningAPI = {
  getCourses: () => api.get('/api/learning').then((res) => withData(res, normalizeLearningArray(res.data))),
  createCourse: (data) => api.post('/api/learning', data),
}

export const documentAPI = {
  getAll: () => api.get('/api/documents').then((res) => withData(res, normalizeDocumentsArray(res.data))),
  upload: (formData) => {
    if (formData && formData.get('type') && !formData.get('category')) {
      formData.set('category', formData.get('type'))
    }

    return api.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const expenseAPI = {
  getAll: () => api.get('/api/expenses').then((res) => withData(res, normalizeExpensesArray(res.data))),
  create: (data) => api.post('/api/expenses', {
    ...data,
    merchant: data?.merchant || data?.description || 'Expense',
  }),
}

export const kudosAPI = {
  getAll: () => api.get('/api/kudos').then((res) => withData(res, normalizeKudosArray(res.data))),
  create: (data) => api.post('/api/kudos', {
    ...data,
    category: data?.category || data?.badge,
  }),
}

export const standupAPI = {
  getAll: () => api.get('/api/standup').then((res) => withData(res, normalizeStandupsArray(res.data))),
  create: (data) => api.post('/api/standup', {
    transcription: [data?.yesterday, data?.today, data?.blockers].filter(Boolean).join('\n'),
    summary: [data?.yesterday || '', data?.today || '', data?.blockers || ''].join(' | '),
  }),
}

export const wellnessAPI = {
  createCoachingSession: (data) => api.post('/api/wellness/coach', data),
  createVideoRequest: (data) => api.post('/api/wellness/vision', data),
  getSentimentReports: () => api.get('/api/wellness/pulse'),
  createSentimentReport: (data) => api.post('/api/wellness/pulse', data),
  getLogs: () => api.get('/api/wellness/logs').then((res) => withData(res, normalizeWellnessLogs(res.data))),
  createLog: (data) => {
    const activity = data?.activity || 'Wellness Activity'
    const duration = Number(data?.duration || 0)
    const caloriesBurned = Number(data?.caloriesBurned || 0)
    const date = data?.date || new Date().toISOString()
    const packed = [activity, duration, caloriesBurned, date].join('|')

    return api.post('/api/wellness/logs', {
      type: 'journal',
      original: packed,
      reframed: packed,
    })
  },
  getCareerPaths: () => api.get('/api/wellness/career'),
  createCareerPath: (data) => api.post('/api/wellness/career', data),
  getSocialEvents: () => api.get('/api/wellness/social').then((res) => withData(res, normalizeSocialEvents(res.data))),
  createSocialEvent: (data) => api.post('/api/wellness/social', data),
}

export const aiAPI = {
  getDashboardStats: () => api.get('/api/ai/analytics/dashboard'),
  getAnalytics: () => api.get('/api/ai/analytics'),
  saveTeamRecommendation: (data) => api.post('/api/ai/staffing', {
    projectDescription: data?.projectDescription || data?.description,
    recommendation: data?.recommendation,
    employeesUsed: data?.employeesUsed || data?.members || [],
  }),
  saveAssistantChat: (data) => api.post('/api/ai/assistant', {
    userMessage: data?.userMessage || data?.message,
    botResponse: data?.botResponse || 'Assistant reply pending.',
    sources: data?.sources || [],
  }),
}

export default api
