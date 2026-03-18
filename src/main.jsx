import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          style: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#6366f1', secondary: 'white' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
