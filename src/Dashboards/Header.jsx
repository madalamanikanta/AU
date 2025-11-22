import React from 'react'
import './Header.css'
import { useAuth } from '../context/useAuth.js'

export default function FacultyHeader() {
  const { user, logout } = useAuth()

  const name = user?.profile?.employeeName || user?.email || ''

  const handleUpdate = () => {
    window.location.hash = '#/profile-update'
  }

  const handleLogout = () => {
    try {
      logout()
    } finally {
      // ensure UI goes to login view
      window.location.hash = ''
    }
  }

  return (
    <header className="faculty-header">
      <div className="faculty-left">
        <div className="welcome">{`Welcome ${name || 'User'}`}</div>
      </div>
      <div className="faculty-right">
        <button className="update-btn" onClick={handleUpdate}>Update Profile</button>
        <button className="update-btn" onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
      </div>
    </header>
  )
}
