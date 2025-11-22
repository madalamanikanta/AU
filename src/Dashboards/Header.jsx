import React from 'react'
import './Header.css'
import { useAuth } from '../context/useAuth.js'

export default function FacultyHeader() {
  const { user, logout } = useAuth()

  // name like before
  const name = user?.profile?.employeeName || user?.email || ''

  // read isHod from the same user object as name
  const isHod =
    user?.isHod === true || user?.profile?.isHod === true // works for both cases

  const handleUpdate = () => {
    window.location.hash = '#/profile-update'
  }

  const handleLogout = () => {
    try {
      logout()
    } finally {
      window.location.hash = ''
    }
  }

  return (
    <header className="faculty-header">
      <div className="faculty-left">
        <div className="welcome">
          {isHod ? 'Welcome HOD' : `Welcome ${name || 'User'}`}
        </div>
      </div>
      <div className="faculty-right">
        <button className="update-btn" onClick={handleUpdate}>Update Profile</button>
        <button className="update-btn" onClick={handleLogout} style={{ marginLeft: 8 }}>
          Logout
        </button>
      </div>
    </header>
  )
}
