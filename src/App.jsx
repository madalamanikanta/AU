import React, { useEffect, useState } from 'react'
import FacultyDashboard from './Dashboards/Faculty/FacultyMain.jsx'
import FacultyForm from './Dashboards/Faculty/FacultyForm.jsx'
import FacultyPreview from './Dashboards/Faculty/FacultyPreview.jsx'
import ProfileUpdate from './Dashboards/ProfileUpdate.jsx'
import Login from './Login/Login.jsx'
import HodMain from './Dashboards/Hod/HodMain.jsx'
import { useAuth } from './context/useAuth.js'
import './App.css'

const readHash = () => (typeof window !== 'undefined' ? window.location.hash : '')

function App() {
  const { status, user } = useAuth()
  const [hash, setHash] = useState(readHash)

  useEffect(() => {
    const onHash = () => setHash(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (status === 'authenticating') {
    return <div className="app-loading">Signing you in…</div>
  }

  if (status === 'unauthenticated') {
    return <Login />
  }

  // Determine main content (keep previous behavior) but allow rendering
  // ProfileUpdate as an overlay when hash === '#/profile-update'.
  let main = null
  if (user?.isHod) {
    main = <HodMain />
  } else if (hash === '#/faculty-form') {
    main = <FacultyForm />
  } else if (hash === '#/faculty-preview') {
    main = <FacultyPreview />
  } else {
    main = <FacultyDashboard />
  }

  return (
    <>
      {main}
      {hash === '#/profile-update' && <ProfileUpdate />}
    </>
  )
}

export default App
