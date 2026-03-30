import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock, CalendarOff, FolderKanban, DollarSign, Star, TrendingUp, Activity } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard, LoadingState, Card, Badge } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { aiAPI, employeeAPI, leaveAPI, attendanceAPI, projectAPI } from '../services/api'
import { formatDate, formatCurrency } from '../utils/helpers'
import { useSelector } from 'react-redux'
import { useSocket } from '../hooks/useSocket'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend)


const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const mockHeadcountTrend = [
  { month: 'Oct', count: 42 }, { month: 'Nov', count: 45 }, { month: 'Dec', count: 44 },
  { month: 'Jan', count: 48 }, { month: 'Feb', count: 51 }, { month: 'Mar', count: 54 },
]
const mockAttendanceTrend = [
  { day: 'Mon', present: 48, absent: 3 }, { day: 'Tue', present: 50, absent: 1 },
  { day: 'Wed', present: 45, absent: 6 }, { day: 'Thu', present: 52, absent: 0 },
  { day: 'Fri', present: 47, absent: 4 },
]

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user)
  const { connected, error: socketError, subscribe } = useSocket()
  const [liveMessage, setLiveMessage] = useState('No updates yet.')
  const [liveStats, setLiveStats] = useState(null)

  const { data: employees, loading: empLoad } = useFetch(employeeAPI.getAll)
  const { data: leaves, loading: leaveLoad } = useFetch(leaveAPI.getAll)
  const { data: projects, loading: projLoad } = useFetch(projectAPI.getAll)
  const { data: attendance, loading: attLoad } = useFetch(attendanceAPI.getAll)

  useEffect(() => {
    const unsubscribe = subscribe('dashboard:update', (payload) => {
      if (payload?.stats) {
        setLiveStats(payload.stats)
      }
      setLiveMessage(payload?.message || 'Dashboard update received')
    })

    return unsubscribe
  }, [subscribe])

  const baseStats = useMemo(() => {
    const empArr = Array.isArray(employees) ? employees : []
    const leaveArr = Array.isArray(leaves) ? leaves : []
    const projArr = Array.isArray(projects) ? projects : []
    const attArr = Array.isArray(attendance) ? attendance : []

    const deptBreakdown = empArr.reduce((acc, e) => {
      if (e.department) acc[e.department] = (acc[e.department] || 0) + 1
      return acc
    }, {})

    return {
      totalEmployees: empArr.length,
      pendingLeaves: leaveArr.filter(l => l.status?.toLowerCase() === 'pending').length,
      activeProjects: projArr.filter(p => ['in-progress', 'in progress', 'active'].includes(p.status?.toLowerCase())).length,
      todayPresent: attArr.filter(a => {
        const d = new Date(a.clockIn || a.date)
        return d.toDateString() === new Date().toDateString()
      }).length,
      deptBreakdown: Object.entries(deptBreakdown).map(([name, value]) => ({ name, value })),
      recentLeaves: leaveArr.slice(0, 5),
      recentProjects: projArr.slice(0, 4),
    }
  }, [employees, leaves, projects, attendance])

  const stats = liveStats || baseStats
  const isLoading = empLoad || leaveLoad || projLoad || attLoad
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    'Team Member'

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-100 text-sm font-medium">Good {getGreeting()}</p>
            <h2 className="text-2xl font-bold mt-0.5">{displayName} ðŸ‘‹</h2>
            <p className="text-brand-200 text-sm mt-1">Here's what's happening at your organization today.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <Activity className="h-5 w-5 text-brand-100" />
            <div>
              <p className="text-xs text-brand-200">System Status</p>
              <p className="text-sm font-semibold text-white">All Systems Operational</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/20 p-4 text-sm text-white bg-white/10">
        <p className="font-medium">Realtime Socket.IO status</p>
        <p className="text-xs mt-1">Connection: {connected ? 'Connected' : 'Disconnected'}</p>
        {socketError && <p className="text-xs text-amber-100">Error: {socketError}</p>}
        <p className="text-xs mt-1">Live update: {liveMessage}</p>
      </div>

      {/* Stat Cards */}
      {isLoading ? <LoadingState message="Loading dashboard..." /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="brand" subtitle="Active headcount" />
            <StatCard title="Present Today" value={stats.todayPresent} icon={Clock} color="emerald" subtitle="Clocked in" />
            <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={CalendarOff} color="amber" subtitle="Awaiting approval" />
            <StatCard title="Active Projects" value={stats.activeProjects} icon={FolderKanban} color="purple" subtitle="In progress" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Headcount Trend */}
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="section-title">Headcount Trend</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
                </div>
                <TrendingUp className="h-4 w-4 text-brand-500" />
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mockHeadcountTrend}>
                  <defs>
                    <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#countGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Dept Breakdown */}
            <Card className="p-5">
              <h3 className="section-title mb-4">By Department</h3>
              {stats.deptBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={stats.deptBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {stats.deptBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {stats.deptBreakdown.slice(0, 4).map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-slate-600 truncate max-w-[100px]">{d.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>
              )}
            </Card>
          </div>

          {/* Live Trend (Chart.js) */}
          <Card className="p-5 lg:col-span-3">
            <h3 className="section-title mb-4">Live Trend (Chart.js)</h3>
            <Line
              data={{
                labels: mockHeadcountTrend.map((item) => item.month),
                datasets: [
                  {
                    label: 'Headcount',
                    data: mockHeadcountTrend.map((item) => item.count),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.2)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Headcount vs Month' },
                },
              }}
            />
          </Card>

          {/* Weekly Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="section-title mb-4">This Week's Attendance</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={mockAttendanceTrend} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Recent Leave Requests */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Recent Leave Requests</h3>
                <Link to="/leave" className="text-xs text-brand-600 font-semibold hover:underline">View all</Link>
              </div>
              {stats.recentLeaves.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No leave requests</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentLeaves.map((leave, i) => (
                    <div key={leave._id || i} className="flex items-center justify-between gap-3 p-3 bg-surface-50 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {leave.employee?.firstName || leave.employeeName || 'Employee'}
                        </p>
                        <p className="text-xs text-slate-500">{leave.leaveType} Â· {formatDate(leave.startDate)}</p>
                      </div>
                      <Badge status={leave.status}>{leave.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Active Projects */}
          {stats.recentProjects.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Active Projects</h3>
                <Link to="/projects" className="text-xs text-brand-600 font-semibold hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.recentProjects.map((project, i) => (
                  <div key={project._id || i} className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{project.name}</p>
                      <Badge status={project.status} className="flex-shrink-0">{project.status}</Badge>
                    </div>
                    {project.budget && <p className="text-xs text-slate-500 mt-1">Budget: {formatCurrency(project.budget)}</p>}
                    {project.endDate && <p className="text-xs text-slate-400 mt-1">Due {formatDate(project.endDate)}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
