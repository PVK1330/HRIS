import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Creates and manages a socket.io connection authenticated with the JWT token.
 * Returns the socket instance and a connected flag.
 */
export function useSocket() {
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) return

    const instance = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = instance
    setSocket(instance)

    instance.on('connect', () => setConnected(true))
    instance.on('disconnect', () => setConnected(false))
    instance.on('connect_error', (err) => {
      console.warn('[socket] connect error:', err.message)
    })

    return () => {
      instance.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [])

  return { socket: socket ?? socketRef.current, connected }
}
