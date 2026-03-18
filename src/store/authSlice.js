import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authAPI } from '../services/api'

const parsedUser = () => {
  const stored = localStorage.getItem('nexushr_user')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login({ email: payload.email, password: payload.password })
    const token = data?.token || data?.data?.token
    const userData = data?.user || data?.data?.user || data?.data || data

    if (token) localStorage.setItem('nexushr_token', token)
    localStorage.setItem('nexushr_user', JSON.stringify(userData))

    return userData
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Login failed'
    return rejectWithValue(message)
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(payload)
    const token = data?.token || data?.data?.token
    const userData = data?.user || data?.data?.user || data?.data || data

    if (token) localStorage.setItem('nexushr_token', token)
    localStorage.setItem('nexushr_user', JSON.stringify(userData))

    return userData
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Registration failed'
    return rejectWithValue(message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: parsedUser(),
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.error = null
      localStorage.removeItem('nexushr_token')
      localStorage.removeItem('nexushr_user')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
