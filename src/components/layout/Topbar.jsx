import { Bell, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Avatar } from '../ui'
import { formatDate } from '../../utils/helpers'

export default function Topbar({ title }) {
  const user = useSelector((state) => state.auth.user)
  const today = formatDate(new Date())

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
        <p className="text-xs text-slate-500">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-surface-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-surface-200">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500">{user?.department || 'NexusHR'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
