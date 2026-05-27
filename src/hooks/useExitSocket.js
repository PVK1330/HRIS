import { useEffect } from 'react'
import { useSocket } from './useSocket'

/**
 * Hook to handle real-time WebSocket updates for a specific exit record.
 * @param {number|string} exitId - The exit record ID
 * @param {object} callbacks - Event callback functions
 * @param {function} [callbacks.onWorkflowUpdated] - Called when exit workflow details are updated
 * @param {function} [callbacks.onTaskUpdated] - Called when a clearance task is modified, assigned, completed or proof uploaded
 * @param {function} [callbacks.onSlaBreached] - Called when an SLA due date is breached
 */
export function useExitSocket(exitId, { onWorkflowUpdated, onTaskUpdated, onSlaBreached } = {}) {
  const { socket, connected } = useSocket()

  useEffect(() => {
    if (!socket || !connected || !exitId) return

    // Join the specific exit room
    socket.emit('join_exit', { exitId })

    // Listen to real-time events
    if (onWorkflowUpdated) {
      socket.on('exit:workflow_updated', onWorkflowUpdated)
    }

    if (onTaskUpdated) {
      socket.on('exit:task_updated', onTaskUpdated)
    }

    if (onSlaBreached) {
      socket.on('exit:sla_breached', onSlaBreached)
    }

    // Cleanup listeners and leave room on unmount or id change
    return () => {
      socket.emit('leave_exit', { exitId })
      
      if (onWorkflowUpdated) {
        socket.off('exit:workflow_updated', onWorkflowUpdated)
      }
      if (onTaskUpdated) {
        socket.off('exit:task_updated', onTaskUpdated)
      }
      if (onSlaBreached) {
        socket.off('exit:sla_breached', onSlaBreached)
      }
    }
  }, [socket, connected, exitId])

  return { socket, connected }
}
