import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../Header.jsx'
import { useAuth } from '../../context/useAuth.js'
import HodPreview from './HodPreview'
import './Hod.css'

export default function HodMain() {
  const { status, user, authorizedFetch } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [submittingAction, setSubmittingAction] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [fetchError, setFetchError] = useState('')
  const year = new Date().getFullYear()

  const dept = useMemo(() => user?.profile?.department || '', [user])

  // ------------- FETCH LIST (NO FILTERING HERE) -------------
  const fetchList = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoading(true)
    setFetchError('')
    try {
      const res = await authorizedFetch(`/api/hod/forms/${year}`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load HOD forms')
      }

      const all = data.forms || []
      setSubmissions(all)

      // debug: see in browser console what is coming from backend
      console.log('HOD forms from API:', all)
    } catch (err) {
      console.error('Failed to fetch HOD list', err)
      setFetchError(err.message || 'Failed to fetch HOD forms')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [authorizedFetch, status, year])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  // ------------- APPROVAL HANDLERS -------------
  const handleApproval = async (facultyId, formYear, action) => {
    // action: 'ACCEPTED' or 'REJECTED'
    if (!authorizedFetch) return
    setSubmittingAction(true)
    try {
      const payload = {
        facultyId,
        formYear: Number(formYear),
        sectionName: 'hod',
        status: action,
        pointsAwarded: 0,
        comment: action === 'ACCEPTED' ? 'Approved by HOD' : 'Rejected by HOD',
      }
      const res = await authorizedFetch('/api/hod/approve-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Action failed')
      // refresh list and clear selection
      await fetchList()
      setSelected(null)
    } catch (err) {
      console.error('HOD action failed', err)
      console.log(err.message || 'Failed to perform action')
    } finally {
      setSubmittingAction(false)
    }
  }

  // ------------- SEARCH (OVER *ALL* SUBMISSIONS) -------------
  const visibleSubmissions = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase()
    if (!q) return submissions

    return (submissions || []).filter((it) => {
      const profile = it.profile || {}
      const names = [
        profile.employeeName,
        profile.name,
        profile.fullName,
        profile.fullname,
        profile.firstName,
        profile.fname,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const email = (it.email || '').toLowerCase()
      const formText = JSON.stringify(it.form || {}).toLowerCase()

      return names.includes(q) || email.includes(q) || formText.includes(q)
    })
  }, [submissions, searchTerm])

  // ------------- AUTH GUARDS -------------
  if (status !== 'authenticated') {
    return <div style={{ padding: 24 }}>Sign in to view HOD dashboard.</div>
  }
  if (!(user?.isHod || user?.role === 'HOD')) {
    return <div style={{ padding: 24 }}>You are not authorized to view this page.</div>
  }

  // ------------- UI (UNCHANGED LAYOUT) -------------
  return (
    <div className="faculty-container">
      <Header />
      <main
        className="faculty-main"
        style={{ flexDirection: 'column', gap: 18, alignItems: 'center', padding: '2rem' }}
      >
        <div className="hod-search-container">
          <input
            placeholder="Search by faculty name or form content"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hod-search-input"
          />
        </div>

        <div className="hod-list-wrap">
          <div style={{ marginBottom: 12, color: '#0f172a', fontWeight: 700 }}>
            Faculty from {dept || 'your department'}
          </div>

          {fetchError && (
            <div className="hod-empty" style={{ color: '#b91c1c', marginBottom: 8 }}>
              {fetchError}
            </div>
          )}

          {loading ? (
            <div className="hod-empty">Loading…</div>
          ) : (submissions || []).length === 0 ? (
            <div className="hod-empty">
              No faculty submissions returned by the server.
            </div>
          ) : visibleSubmissions.length === 0 ? (
            <div className="hod-empty">No submissions match your search.</div>
          ) : (
            <div className="hod-list">
              {visibleSubmissions.map((it) => (
                <div key={it.userId || it.email} className="hod-item-card">
                  <div>
                    <div className="hod-item-name">
                      {it.profile?.employeeName || it.profile?.name || it.email}
                    </div>
                    <div className="hod-item-sub">
                      {(it.profile?.designation || '') +
                        (it.profile?.department ? `, ${it.profile.department}` : '')}
                    </div>
                  </div>
                  <div>
                    <button className="hod-review-btn" onClick={() => setSelected(it)}>
                      Review Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div
            style={{
              width: '100%',
              maxWidth: 1000,
              background: '#fff',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0 }}>
                {selected.profile?.employeeName || selected.email}
              </h3>
              <div>
                <button style={{ marginRight: 8 }} onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
            <HodPreview
              form={selected.form}
              profile={selected.profile}
              onClose={() => setSelected(null)}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 12,
              }}
            >
              {selected && (
  <HodPreview
    form={selected.form}
    profile={selected.profile}
    submitting={submittingAction}
    onClose={() => setSelected(null)}
    onReject={() =>
      handleApproval(
        selected.userId,
        selected.form.formYear || selected.formYear,
        'REJECTED'
      )
    }
    onApprove={() =>
      handleApproval(
        selected.userId,
        selected.form.formYear || selected.formYear,
        'ACCEPTED'
      )
    }
  />
)}            </div>
          </div>
        )}          
               </main>
    </div>
  )
}
