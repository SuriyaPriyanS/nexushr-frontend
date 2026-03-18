# NexusHR Frontend

Production-grade React + Tailwind CSS frontend for the NexusHR Employee Management Platform.

## Tech Stack

- **React 18** with React Router v6
- **Tailwind CSS v3** — utility-first styling
- **TanStack Table v8** — powerful data tables with sorting, filtering, pagination
- **Recharts** — analytics charts and dashboards
- **Axios** — API communication with JWT interceptors
- **Lucide React** — icon library
- **React Hot Toast** — notifications

## Project Structure

```
src/
├── components/
│   ├── ui/               # Reusable UI primitives
│   │   ├── index.jsx     # Button, Badge, Modal, Avatar, StatCard, etc.
│   │   └── DataTable.jsx # TanStack Table wrapper
│   └── layout/
│       ├── AppLayout.jsx # Shell with sidebar + topbar
│       ├── Sidebar.jsx   # Collapsible nav sidebar
│       └── Topbar.jsx    # Header bar
├── context/
│   └── AuthContext.jsx   # JWT auth state
├── hooks/
│   └── useFetch.js       # Generic data fetching hook
├── pages/
│   ├── AuthPages.jsx                     # Login + Register
│   ├── Dashboard.jsx                     # Overview with charts
│   ├── Employees.jsx                     # Full CRUD
│   ├── Attendance.jsx                    # Clock In/Out + records
│   ├── LeaveRequests.jsx                 # Apply + approve/reject
│   ├── Projects.jsx                      # CRUD + status tracking
│   ├── PayrollPerformanceExpenses.jsx    # Payroll, Reviews, Expenses
│   ├── RecruitmentOnboardingLearning.jsx # HR lifecycle
│   ├── KudosStandupDocuments.jsx         # Engagement + docs
│   ├── Wellness.jsx                      # Logs + social events
│   └── Analytics.jsx                    # Charts + AI chat
├── services/
│   └── api.js            # All API calls organized by module
└── utils/
    └── helpers.js        # Formatters, constants, utilities
```

## Getting Started

### 1. Install Dependencies

```bash
cd nexushr-frontend
npm install
```

### 2. Configure Environment

Copy the `.env` file and update if your backend runs on a different port:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start the Backend

Make sure your NexusHR backend is running on port 5000.

### 4. Run the Frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

| Module | Features |
|--------|----------|
| **Auth** | Login, Register, JWT token management, Protected routes |
| **Dashboard** | Stats cards, headcount trend, dept breakdown pie, recent activity |
| **Employees** | Full CRUD with TanStack table, search, sort, paginate |
| **Attendance** | Clock In/Out, daily records table |
| **Leave Requests** | Submit, approve/reject, filter by status |
| **Projects** | CRUD, status tracking, budget |
| **Payroll** | Records, net pay calculation |
| **Performance** | Star ratings, reviews |
| **Expenses** | Submit, track with status |
| **Recruitment** | Job postings management |
| **Onboarding** | Employee onboarding plans |
| **Learning** | Course catalog |
| **Kudos** | Card-based recognition feed |
| **Standups** | Daily update posts |
| **Documents** | Upload and manage files |
| **Wellness** | Activity logs, social events |
| **Analytics** | Charts + AI chat assistant |

## Build for Production

```bash
npm run build
```

The `dist/` folder is ready to serve with any static host (Nginx, Vercel, Netlify).
