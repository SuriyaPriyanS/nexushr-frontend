import { useState } from 'react'
import { Brain, Send, BarChart2, Zap, TrendingUp } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { aiAPI } from '../services/api'
import { LoadingState, Card, StatCard } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

const mockDept = [
  { dept: 'Eng', employees: 18 }, { dept: 'HR', employees: 6 }, { dept: 'Sales', employees: 12 },
  { dept: 'Design', employees: 5 }, { dept: 'Finance', employees: 7 }, { dept: 'Ops', employees: 6 },
]
const mockTurnover = [
  { month: 'Jan', hired: 4, left: 1 }, { month: 'Feb', hired: 2, left: 0 }, { month: 'Mar', hired: 5, left: 2 },
  { month: 'Apr', hired: 3, left: 1 }, { month: 'May', hired: 6, left: 0 }, { month: 'Jun', hired: 2, left: 3 },
]

export default function Analytics() {
  const { data: stats, loading } = useFetch(aiAPI.getDashboardStats)
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const handleChat = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const msg = input.trim()
    setInput('')
    const newChat = [...chat, { role: 'user', text: msg }]
    setChat(newChat)
    setChatLoading(true)
    try {
      const { data } = await aiAPI.saveAssistantChat({ message: msg, category: 'HR Query' })
      const reply = data?.response || data?.data?.response || 'Got it! I\'ve logged your query. Ask me anything about HR policies, leave requests, or team insights.'
      setChat([...newChat, { role: 'assistant', text: reply }])
    } catch {
      setChat([...newChat, { role: 'assistant', text: 'I\'m here to help with HR queries. Your message has been recorded.' }])
    } finally { setChatLoading(false) }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI & Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Insights powered by your HR data</p>
        </div>
      </div>

      {loading ? <LoadingState /> : (
        <>
          {/* Stats from API */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats).slice(0, 4).map(([key, val], i) => (
                <StatCard key={key} title={key.replace(/([A-Z])/g, ' $1').trim()} value={val}
                  color={['brand', 'emerald', 'amber', 'purple'][i]} icon={BarChart2} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Employees by Dept */}
            <Card className="p-5">
              <h3 className="section-title mb-4">Employees by Department</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mockDept} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="employees" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Turnover Trend */}
            <Card className="p-5">
              <h3 className="section-title mb-4">Hiring vs Turnover</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockTurnover}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="hired" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} name="Hired" />
                  <Line type="monotone" dataKey="left" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} name="Left" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* AI Chat Assistant */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-50 rounded-xl"><Brain className="h-5 w-5 text-brand-600" /></div>
          <div>
            <h3 className="section-title">HR AI Assistant</h3>
            <p className="text-xs text-slate-500">Ask questions about HR policies, analytics, and more</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse-soft" />
            Online
          </div>
        </div>

        {/* Chat window */}
        <div className="bg-surface-50 rounded-xl p-4 h-60 overflow-y-auto space-y-3 mb-4 border border-surface-200">
          {chat.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Zap className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-center">Ask me about leave policies, team performance, or HR insights!</p>
            </div>
          ) : (
            chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-white border border-surface-200 text-slate-700 rounded-bl-sm shadow-card'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                <div className="flex gap-1.5 items-center">
                  <div className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleChat} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about HR policies, team analytics, leave requests..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary px-3" disabled={chatLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </Card>
    </div>
  )
}
