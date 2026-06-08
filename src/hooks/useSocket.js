import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const SocketContext = createContext(null)

function createSocket() {
  const token = localStorage.getItem('hris_token')
  if (!token) return null
  return io(SOCKET_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })
}

/**
 * Mount once at the layout level (AdminLayout) to share a single socket
 * connection across all child components in the layout tree.
 */
export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const instance = createSocket()
    if (!instance) return

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

  return React.createElement(
    SocketContext.Provider,
    { value: { socket: socket ?? socketRef.current, connected } },
    children,
  )
}

/**
 * Returns the shared socket from the nearest SocketProvider.
 * Falls back to creating a standalone connection for components rendered
 * outside a SocketProvider (e.g. SuperAdmin layout).
 */
export function useSocket() {
  const ctx = useContext(SocketContext)

  // standalone path — only active when there is no SocketProvider in the tree
  const socketRef = useRef(null)
  const [standaloneSocket, setStandaloneSocket] = useState(null)
  const [standaloneConnected, setStandaloneConnected] = useState(false)

  useEffect(() => {
    if (ctx) return // shared socket is available; no standalone needed

    const instance = createSocket()
    if (!instance) return

    socketRef.current = instance
    setStandaloneSocket(instance)

    instance.on('connect', () => setStandaloneConnected(true))
    instance.on('disconnect', () => setStandaloneConnected(false))
    instance.on('connect_error', (err) => {
      console.warn('[socket] connect error:', err.message)
    })

    return () => {
      instance.disconnect()
      socketRef.current = null
      setStandaloneSocket(null)
      setStandaloneConnected(false)
    }
  }, [ctx])

  if (ctx) return ctx
  return { socket: standaloneSocket ?? socketRef.current, connected: standaloneConnected }
}
