import { useState, useMemo } from 'react'
import { Clock, Fingerprint } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { attendanceAPI } from '../services/api'
import { isWebAuthnSupported, hashVerificationData } from '../utils/helpers'
import DataTable from '../components/ui/DataTable'
import { LoadingState, Badge, Card } from '../components/ui'
import BiometricScanner from '../components/biometrics/BiometricScanner'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Attendance() {
  const { data, loading, refetch } = useFetch(attendanceAPI.getAll)
  const [clocking, setClocking] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scannerType, setScannerType] = useState('in')

  // Mock data for demo/no-backend
  const mockRecords = [
    {
      _id: '1',
      employee: { firstName: 'John', lastName: 'Doe' },
      clockIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      clockOut: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      method: 'fingerprint',
      confidence: 0.95,
      status: 'present'
    },
    {
      _id: '2',
      employeeName: 'Jane Smith',
      clockIn: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      method: 'eye',
      confidence: 0.98,
      status: 'present'
    },
    {
      _id: '3',
      employee: { firstName: 'Bob', lastName: 'Johnson' },
      clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      method: 'manual',
      status: 'present'
    }
  ]

  const records = Array.isArray(data) && data.length > 0 ? data : mockRecords

  const handleBiometricClock = async (verificationData) => {
    setClocking(true)
    try {
      const payload = {
        ...verificationData,
        verificationHash: await hashVerificationData(verificationData),
        timestamp: new Date().toISOString()
      }
      // Mock API call for demo
      toast.success(`Biometric ${scannerType === 'in' ? 'Clock In' : 'Clock Out'} verified! (${verificationData.confidence ? Math.round(verificationData.confidence * 100) + '%' : 'Manual'})`)
      // Add new mock record
      mockRecords.unshift({
        ...payload,
        _id: Date.now().toString(),
        employeeName: 'You',
        status: 'present'
      })
      refetch()
    } catch (err) {
      toast.error('Demo clock - backend coming soon!')
    } finally {
      setClocking(false)
    }
  }

  const openScanner = (type) => {
    setScannerType(type)
    setShowScanner(true)
  }

  const todayCount = useMemo(() => records.filter(r => {
    const d = new Date(r.clockIn || r.date)
    return d.toDateString() === new Date().toDateString()
  }).length, [records])

  const columns = useMemo(() => [
    {
      header: 'Employee',
      accessorKey: 'employee',
      cell: ({ row }) => {
        const r = row.original
        const name = r.employee?.firstName ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || 'Employee')
        return <span className="text-sm font-medium text-slate-800">{name}</span>
      }
    },
    { header: 'Date', accessorKey: 'date', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.clockIn || row.original.date)}</span> },
    { header: 'Clock In', accessorKey: 'clockIn', cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() ? new Date(getValue()).toLocaleTimeString() : '—'}</span> },
    { header: 'Clock Out', accessorKey: 'clockOut', cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() ? new Date(getValue()).toLocaleTimeString() : '—'}</span> },
    {
      header: 'Duration', 
      id: 'duration',
      cell: ({ row }) => {
        const r = row.original
        if (!r.clockIn || !r.clockOut) return <span className="text-slate-400 text-sm">—</span>
        const mins = Math.round((new Date(r.clockOut) - new Date(r.clockIn)) / 60000)
        const h = Math.floor(mins / 60), m = mins % 60
        return <span className="text-sm font-medium">{h}h {m}m</span>
      }
    },
    {
      header: 'Method', 
      accessorKey: 'method', 
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-xs">
          {getValue() === 'fingerprint' ? '👆 Fingerprint' : getValue() === 'eye' ? '👁️ Eye Scan' : '⌚ Manual'}
        </Badge>
      )
    },
    {
      header: 'Confidence', 
      accessorKey: 'confidence', 
      cell: ({ getValue }) => getValue() ? <Badge className="text-xs bg-brand-100 text-brand-700">{Math.round(getValue() * 100)}%</Badge> : '—'
    },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge status={getValue() || 'present'}>{getValue() || 'Present'}</Badge> },
  ], [])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 p-4 sm:p-6 animate-slide-up min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Attendance</h2>
          <p className="text-sm text-slate-500 mt-1">{todayCount} employees clocked in today</p>
        </div>
      </div>

      {/* Clock Cards - Mobile Stack */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 rounded-xl flex-shrink-0">
              <Clock className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Today's Attendance</p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => openScanner('in')} 
              disabled={clocking} 
              className="btn-primary h-14 flex-1 sm:flex-none text-sm font-semibold active:scale-[0.98] touch-manipulation"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Clock In
            </button>
            <button 
              onClick={() => openScanner('out')} 
              disabled={clocking} 
              className="btn-secondary h-14 flex-1 sm:flex-none text-sm font-semibold active:scale-[0.98] touch-manipulation"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Clock Out
            </button>
          </div>
        </div>
      </Card>

      <BiometricScanner 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)}
        onSuccess={handleBiometricClock}
        clockType={scannerType}
      />

      <DataTable 
        data={records} 
        columns={columns} 
        searchPlaceholder="Search attendance records..." 
        emptyMessage="No attendance records yet. Try clocking in!"
      />
    </div>
  )
}

