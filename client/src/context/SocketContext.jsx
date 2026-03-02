import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '../socket'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([])

  // Auto-connect on mount if user is already logged in (handles page refresh)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const token = localStorage.getItem('token')

    if (user?.id && token) {
      if (!socket.connected) socket.connect()
      socket.emit('user-online', user.id)
    }

    socket.on('online-users', setOnlineUsers)

    return () => {
      socket.off('online-users', setOnlineUsers)
    }
  }, [])

  // Called right after login — connects socket and marks user online
  const connectSocket = (userId) => {
    if (!socket.connected) socket.connect()
    socket.emit('user-online', String(userId))
  }

  // Called right before logout — disconnects socket and clears local state
  const disconnectSocket = () => {
    socket.disconnect()
    setOnlineUsers([])
  }

  // True if the given userId is currently online
  const isOnline = (userId) => {
    if (!userId) return false
    return onlineUsers.includes(String(userId))
  }

  return (
    <SocketContext.Provider value={{ onlineUsers, isOnline, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
