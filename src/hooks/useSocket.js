import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Creates and manages a socket.io connection authenticated with the JWT token.
 * Returns the socket instance and a connected flag.
 */
export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', (err) => {
      console.warn('[socket] connect error:', err.message)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  return { socket: socketRef.current, connected }
}
