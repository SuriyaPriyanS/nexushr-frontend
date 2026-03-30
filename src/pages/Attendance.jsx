import { useState, useMemo } from 'react'
import { Clock, Fingerprint } from 'lucide-react'
import { useFetch } from '../hooks/useFetch'
import { attendanceAPI } from '../services/api'
import { hashVerificationData } from '../utils/helpers'
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

  const records = Array.isArray(data) ? data : []

  const handleBiometricClock = async (verificationData) => {
    setClocking(true)

    try {
      const payload = {
        ...verificationData,
        verificationHash: await hashVerificationData(verificationData),
        timestamp: new Date().toISOString(),
      }

      if (scannerType === 'in') {
        await attendanceAPI.clockIn(payload)
        toast.success('Clock In verified successfully')
      } else {
        await attendanceAPI.clockOut(payload)
        toast.success('Clock Out verified successfully')
      }

      await refetch()
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to complete attendance action'
      toast.error(message)
    } finally {
      setClocking(false)
    }
  }

  const openScanner = (type) => {
    setScannerType(type)
    setShowScanner(true)
  }

  const todayCount = useMemo(
    () =>
      records.filter((record) => {
        const dateValue = record.clockIn || record.date
        if (!dateValue) return false

        const entryDate = new Date(dateValue)
        if (Number.isNaN(entryDate.getTime())) return false

        return entryDate.toDateString() === new Date().toDateString()
      }).length,
    [records]
  )

  const columns = useMemo(
    () => [
      {
        header: 'Employee',
        accessorKey: 'employee',
        cell: ({ row }) => {
          const record = row.original
          const name =
            record.employee?.name ||
            [record.employee?.firstName, record.employee?.lastName].filter(Boolean).join(' ') ||
            record.employeeName ||
            'Employee'

          return <span className="text-sm font-medium text-slate-800">{name}</span>
        },
      },
      {
        header: 'Date',
        accessorKey: 'date',
        cell: ({ row }) => <span className="text-sm">{formatDate(row.original.clockIn || row.original.date)}</span>,
      },
      {
        header: 'Clock In',
        accessorKey: 'clockIn',
        cell: ({ getValue }) => (
          <span className="text-sm font-mono">{getValue() ? new Date(getValue()).toLocaleTimeString() : '—'}</span>
        ),
      },
      {
        header: 'Clock Out',
        accessorKey: 'clockOut',
        cell: ({ getValue }) => (
          <span className="text-sm font-mono">{getValue() ? new Date(getValue()).toLocaleTimeString() : '—'}</span>
        ),
      },
      {
        header: 'Duration',
        id: 'duration',
        cell: ({ row }) => {
          const record = row.original
          if (!record.clockIn || !record.clockOut) return <span className="text-slate-400 text-sm">—</span>

          const mins = Math.round((new Date(record.clockOut) - new Date(record.clockIn)) / 60000)
          const h = Math.floor(mins / 60)
          const m = mins % 60

          return <span className="text-sm font-medium">{h}h {m}m</span>
        },
      },
      {
        header: 'Method',
        accessorKey: 'method',
        cell: ({ getValue }) => {
          const method = String(getValue() || 'manual').toLowerCase()
          const label = method === 'fingerprint' ? 'Fingerprint' : method === 'eye' ? 'Eye Scan' : 'Manual'
          return (
            <Badge variant="outline" className="text-xs">
              {label}
            </Badge>
          )
        },
      },
      {
        header: 'Confidence',
        accessorKey: 'confidence',
        cell: ({ getValue }) =>
          typeof getValue() === 'number' ? (
            <Badge className="text-xs bg-brand-100 text-brand-700">{Math.round(getValue() * 100)}%</Badge>
          ) : (
            '—'
          ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() || 'Present'
          return <Badge status={status}>{status}</Badge>
        },
      },
    ],
    []
  )

  if (loading) return <LoadingState />

  return (
    <div className="space-y-5 p-4 sm:p-6 animate-slide-up min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Attendance</h2>
          <p className="text-sm text-slate-500 mt-1">{todayCount} employees clocked in today</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 rounded-xl flex-shrink-0">
              <Clock className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Today's Attendance</p>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
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
        emptyMessage="No attendance records found."
      />
    </div>
  )
}
