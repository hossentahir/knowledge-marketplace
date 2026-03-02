import { io } from 'socket.io-client'

// Singleton — autoConnect: false so we control when to connect (after login)
export const socket = io('http://localhost:5000', {
  autoConnect: false,
})
