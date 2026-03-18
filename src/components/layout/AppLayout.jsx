import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leave': 'Leave Requests',
  '/projects': 'Projects',
  '/payroll': 'Payroll',
  '/performance': 'Performance Reviews',
  '/expenses': 'Expenses',
  '/recruitment': 'Recruitment',
  '/onboarding': 'Onboarding',
  '/learning': 'Learning & Development',
  '/kudos': 'Kudos & Recognition',
  '/standup': 'Daily Standups',
  '/wellness': 'Wellness',
  '/documents': 'Documents',
  '/analytics': 'AI & Analytics',
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'NexusHR'

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
