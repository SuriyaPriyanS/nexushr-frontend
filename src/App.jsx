import { Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { store } from './store'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import LeaveRequests from './pages/LeaveRequests'
import Projects from './pages/Projects'
import { Payroll, Performance, Expenses } from './pages/PayrollPerformanceExpenses'
import { Recruitment, Onboarding, Learning } from './pages/RecruitmentOnboardingLearning'
import { Kudos, Standup, Documents } from './pages/KudosStandupDocuments'
import Wellness from './pages/Wellness'
import Analytics from './pages/Analytics'

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const user = useSelector((state) => state.auth.user)
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<LeaveRequests />} />
        <Route path="projects" element={<Projects />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="performance" element={<Performance />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="recruitment" element={<Recruitment />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="learning" element={<Learning />} />
        <Route path="kudos" element={<Kudos />} />
        <Route path="standup" element={<Standup />} />
        <Route path="documents" element={<Documents />} />
        <Route path="wellness" element={<Wellness />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}

