import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import './Profile.css'
const emptyProfile = {
  employeeName: '',
  department: '',
  experienceYears: '',
  designation: '',
  contactNumber: '',
}

const toProfileState = (profile) => ({
  employeeName: profile?.employeeName || '',
  department: profile?.department || '',
  experienceYears: profile?.experienceYears || '',
  designation: profile?.designation || '',
  contactNumber: profile?.contactNumber || '',
})

export default function ProfileUpdate({ onClose } = {}) {
  const { status, user, authorizedFetch, refreshProfile, updateUser } = useAuth()
  const initialProfile = useMemo(() => toProfileState(user?.profile) || emptyProfile, [user])
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(status === 'authenticating')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setProfile(initialProfile)
  }, [initialProfile])

  useEffect(() => {
    let active = true
    if (status !== 'authenticated') {
      setLoading(false)
      return () => {
        active = false
      }
    }
    setLoading(true)
    refreshProfile()
      .then((fresh) => {
        if (!active) return
        setProfile(toProfileState(fresh?.profile))
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshProfile, status])

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (status !== 'authenticated') {
      console.log('Please sign in again to update profile')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await authorizedFetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile')
      const updatedUser = data?.user
      if (updatedUser) {
        updateUser(updatedUser)
        setProfile(toProfileState(updatedUser.profile))
      }
      console.log('Profile updated successfully')
      // If parent passed onClose, call it, otherwise fall back to history.back()
      if (typeof onClose === 'function') onClose()
      else window.history.back()
    } catch (err) {
      console.error(err)
      setError(err.message)
      console.log('Update failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (status !== 'authenticated') {
    return <div style={{ padding: 20 }}>Sign in to update your profile.</div>
  }

  if (loading) return <div style={{ padding: 20 }}>Loading profile…</div>

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '6px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#000000',
    fontSize: '15px',
  }

  const handleCancel = () => {
    if (typeof onClose === 'function') onClose()
    else window.history.back()
  }

  return (
    <div className="profile-modal-backdrop">
      <div className="profile-modal">
        <h2 className="profile-modal-title">Update Profile</h2>
        <form onSubmit={handleSave}>
        {error && (
          <div style={{
            marginBottom: 12,
            padding: '8px 12px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            color: '#b91c1c',
          }}>
            {error}
          </div>
        )}
        
        <label style={{ display: 'block', marginBottom: 12 }}>
          Name
          <input
            value={profile.employeeName}
            onChange={(e) => update('employeeName', e.target.value)}
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          Department
          <input
            value={profile.department}
            onChange={(e) => update('department', e.target.value)}
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          Designation
          <input
            value={profile.designation}
            onChange={(e) => update('designation', e.target.value)}
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          Experience (years)
          <input
            type="number"
            min="0"
            value={profile.experienceYears}
            onChange={(e) => update('experienceYears', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          Contact Number
          <input
            value={profile.contactNumber}
            onChange={(e) => update('contactNumber', e.target.value)}
            style={inputStyle}
          />
        </label>

          <div className="profile-modal-footer">
            <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="profile-save-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
