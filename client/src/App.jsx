import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Register from './components/Register'
import StudentDashboard from './components/StudentDashboard'
import TeacherDashboard from './components/TeacherDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SearchPage from './components/SearchPage'
import ChatPage from './components/ChatPage'
import './App.css'

function App() {
  return (
    <div className="page">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/search" element={<SearchPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
