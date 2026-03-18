import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nexushr_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password, options = { redirect: true }) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login({ email, password })
      const token = data?.token || data?.data?.token
      const userData = data?.user || data?.data?.user || data?.data || data

      if (token) localStorage.setItem('nexushr_token', token)
      localStorage.setItem('nexushr_user', JSON.stringify(userData))
      setUser(userData)

      return { success: true, user: userData, redirect: options.redirect }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData, options = { redirect: true }) => {
    setLoading(true)
    try {
      const { data } = await authAPI.register(formData)
      const token = data?.token || data?.data?.token
      const userData = data?.user || data?.data?.user || data?.data || data

      if (token) localStorage.setItem('nexushr_token', token)
      localStorage.setItem('nexushr_user', JSON.stringify(userData))
      setUser(userData)

      return { success: true, user: userData, redirect: options.redirect }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await authAPI.logout() } catch (_) {}
    localStorage.removeItem('nexushr_token')
    localStorage.removeItem('nexushr_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
