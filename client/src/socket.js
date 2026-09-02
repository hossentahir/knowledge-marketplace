import { io } from 'socket.io-client'
import { API_URL } from './api'

// Singleton — autoConnect: false so we control when to connect (after login)
export const socket = io(API_URL, {
  autoConnect: false,
})
