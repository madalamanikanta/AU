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
  const [fetchError, setFetchError] = useState('')
  const year = new Date().getFullYear()

  const dept = useMemo(() => user?.profile?.department || '', [user])

  // ------------- FETCH LIST -------------
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

      await fetchList()
      setSelected(null)
    } catch (err) {
      console.error('HOD action failed', err)
      console.log(err.message || 'Failed to perform action')
    } finally {
      setSubmittingAction(false)
    }
  }

  // ------------- SORT: PHARMACY FIRST -------------
  const sortedSubmissions = useMemo(() => {
    if (!submissions) return []
    const copy = [...submissions]

    const normalizeDept = (d) => (d || '').toLowerCase().trim()

    copy.sort((a, b) => {
      const da = normalizeDept(a.profile?.department)
      const db = normalizeDept(b.profile?.department)

      const aIsPharm = da === 'pharmacy'
      const bIsPharm = db === 'pharmacy'

      if (aIsPharm && !bIsPharm) return -1
      if (!aIsPharm && bIsPharm) return 1

      const nameA =
        (a.profile?.employeeName ||
          a.profile?.name ||
          a.email ||
          '').toLowerCase()
      const nameB =
        (b.profile?.employeeName ||
          b.profile?.name ||
          b.email ||
          '').toLowerCase()
      return nameA.localeCompare(nameB)
    })

    return copy
  }, [submissions])

  // ------------- AUTH GUARDS -------------
  if (status !== 'authenticated') {
    return <div style={{ padding: 24 }}>Sign in to view HOD dashboard.</div>
  }
  if (!(user?.isHod || user?.role === 'HOD')) {
    return <div style={{ padding: 24 }}>You are not authorized to view this page.</div>
  }

  // ------------- UI -------------
  return (
    <div className="faculty-container">
      <Header />
      <main
        className="faculty-main"
        style={{
          flexDirection: 'column',
          gap: 18,
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        {/* Big centered heading just under header */}
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Faculty from {dept || 'your department'}
          </div>
        </div>

        <div
          className="hod-list-wrap"
          style={{ width: '100%', maxWidth: 900 }}
        >
          {fetchError && (
            <div
              className="hod-empty"
              style={{ color: '#b91c1c', marginBottom: 8, textAlign: 'center' }}
            >
              {fetchError}
            </div>
          )}

          {loading ? (
            <div className="hod-empty" style={{ textAlign: 'center' }}>
              Loading…
            </div>
          ) : (sortedSubmissions || []).length === 0 ? (
            <div className="hod-empty" style={{ textAlign: 'center' }}>
              No faculty submissions returned by the server.
            </div>
          ) : (
            <div className="hod-list">
              {sortedSubmissions.map((it) => (
                <div key={it.userId || it.email} className="hod-item-card">
                  <div>
                    <div className="hod-item-name">
                      {it.profile?.employeeName || it.profile?.name || it.email}
                    </div>
                    <div className="hod-item-sub">
                      {(it.profile?.designation || '') +
                        (it.profile?.department
                          ? `, ${it.profile.department}`
                          : '')}
                    </div>
                  </div>
                  <div>
                    <button
                      className="hod-review-btn"
                      onClick={() => setSelected(it)}
                    >
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
                marginBottom: 8,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {selected.profile?.employeeName || selected.email}
              </h3>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>

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
          </div>
        )}
      </main>
    </div>
  )
}
