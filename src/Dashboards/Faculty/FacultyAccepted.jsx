import React from 'react'
import Header from '../Header.jsx'
import './Faculty.css'

const FacultyAccepted = () => {
  const progressPercent = 100

  return (
    <div className="faculty-container">
      <Header />
      <main className="faculty-main">
        <div className="faculty-box">
          <h1 className="faculty-title">Track your Application Status</h1>
          <div className="faculty-progress-wrap">
            <div className="progress-track" aria-hidden>
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="status-text">Status : Approved</div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default FacultyAccepted
