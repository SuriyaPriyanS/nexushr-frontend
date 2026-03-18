import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import { cn } from '../../utils/helpers'
import {
  LayoutDashboard, Users, Clock, CalendarOff, FolderKanban,
  DollarSign, Star, UserPlus, BookOpen, FileText, Receipt,
  Heart, Zap, MessageSquare, Award, ChevronRight, LogOut,
  Briefcase, Activity,
} from 'lucide-react'
import { Avatar } from '../ui'
import toast from 'react-hot-toast'

const navGroups = [
  {
    label: 'Core',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/employees', icon: Users, label: 'Employees' },
      { to: '/attendance', icon: Clock, label: 'Attendance' },
      { to: '/leave', icon: CalendarOff, label: 'Leave Requests' },
    ]
  },
  {
    label: 'Work',
    items: [
      { to: '/projects', icon: FolderKanban, label: 'Projects' },
      { to: '/payroll', icon: DollarSign, label: 'Payroll' },
      { to: '/performance', icon: Star, label: 'Performance' },
      { to: '/expenses', icon: Receipt, label: 'Expenses' },
    ]
  },
  {
    label: 'People',
    items: [
      { to: '/recruitment', icon: UserPlus, label: 'Recruitment' },
      { to: '/onboarding', icon: Briefcase, label: 'Onboarding' },
      { to: '/learning', icon: BookOpen, label: 'Learning' },
      { to: '/kudos', icon: Award, label: 'Kudos' },
    ]
  },
  {
    label: 'Engage',
    items: [
      { to: '/standup', icon: MessageSquare, label: 'Standups' },
      { to: '/wellness', icon: Heart, label: 'Wellness' },
      { to: '/documents', icon: FileText, label: 'Documents' },
      { to: '/analytics', icon: Activity, label: 'AI & Analytics' },
    ]
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()

  const handleLogout = async () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside className={cn(
      'h-screen bg-white border-r border-surface-200 flex flex-col transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm leading-tight tracking-tight">NexusHR</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Platform</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="ml-auto p-1 hover:bg-surface-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ChevronRight className={cn('h-4 w-4 text-slate-500 transition-transform duration-300', collapsed ? '' : 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                      collapsed && 'justify-center px-2')
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-surface-200">
        {collapsed ? (
          <button onClick={handleLogout} className="w-full flex justify-center p-2 hover:bg-surface-100 rounded-lg transition-colors" title="Logout">
            <LogOut className="h-4 w-4 text-slate-500" />
          </button>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.role || 'Employee'}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
