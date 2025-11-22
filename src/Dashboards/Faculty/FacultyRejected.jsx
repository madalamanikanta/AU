import React, { useState } from 'react'
import Header from '../Header.jsx'
import './Faculty.css'
import FacultyForm from '../Faculty/FacultyForm.jsx'

const FacultyRejected = ({ remarks = '' }) => {
  const [showForm, setShowForm] = useState(false)

  const onFill = () => {
    setShowForm(true)
  }

  return (
    <div className="faculty-container">
      <Header />
      <main className="faculty-main">
        {!showForm ? (
          <div className="faculty-box">
            <h1 className="faculty-title">Your Previous Application was rejected</h1>

            {remarks ? (
              <div className="faculty-subtitle"> </div>
            ) : (
              <div className="faculty-subtitle"></div>
            )}

            <div style={{ marginTop: 28 }}>
              <button className="faculty-btn" onClick={onFill}>
                Fill the Application
              </button>
            </div>
          </div>
        ) : (
          <FacultyForm />
        )}
      </main>
    </div>
  )
}

export default FacultyRejected
