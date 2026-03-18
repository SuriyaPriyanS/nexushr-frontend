import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function useSocket(namespace = '') {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL + namespace, {
      autoConnect: true,
      transports: ['websocket'],
      reconnectionAttempts: 5,
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      setError(err.message || 'Socket connection error')
      setConnected(false)
    })

    return () => {
      if (socket.connected) socket.disconnect()
      socketRef.current = null
    }
  }, [namespace])

  const emit = (event, data, callback) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data, callback)
    }
  }

  const subscribe = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler)
      }
    }
  }

  return { connected, error, emit, subscribe }
}
