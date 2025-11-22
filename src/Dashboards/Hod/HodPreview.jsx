// src/Dashboards/Hod/HodPreview.jsx
import React, { useState } from 'react'
import './Hod.css'
// 👇 add this line
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function HodPreview({
  form,
  profile,
  submitting = false,
  onClose,
  onApprove,
  onReject,
  onApproveRow,
  onRejectRow,
}) {
  if (!form || !profile) return null

  // adapt this if your array is called something else
  const entries = form.entries || form.data || form.rows || []

  const name =
    profile.employeeName ||
    profile.name ||
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim()

  const designation = profile.designation || ''
  const department = profile.department || ''

  const formYear = form.formYear || form.year || ''
  const entriesCount = entries.length
  const [selectedFiles, setSelectedFiles] = useState({})

  return (
    <div className="hod-modal-backdrop">
      <div className="hod-modal">
        {/* header */}
        <div className="hod-modal-header">
          <div>
            <h2 className="hod-modal-title">{name}</h2>
            <p className="hod-modal-subtitle">
              {designation}
              {department ? ` — ${department}` : ''}
            </p>
          </div>
          <div className="hod-modal-meta">
            <div>
              <div className="hod-meta-label">Form Year</div>
              <div className="hod-meta-value">{formYear || '-'}</div>
            </div>
            <div>
              <div className="hod-meta-label">Entries</div>
              <div className="hod-meta-value">{entriesCount}</div>
            </div>
          </div>
        </div>

        {/* profile summary */}
        <div className="hod-modal-profile">
          <div>
            <strong>Name:</strong> {name || '-'}
          </div>
          <div>
            <strong>Designation:</strong> {designation || '-'}
          </div>
          <div>
            <strong>Department:</strong> {department || '-'}
          </div>
        </div>

        {/* table */}
        <div className="hod-modal-table-wrapper">
          <table className="hod-modal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Journal / ISSN</th>
                <th>Indexed</th>
                <th>Author Role</th>
                <th>Supporting Document</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 16 }}>
                    No entries
                  </td>
                </tr>
              ) : (
                entries.map((row, idx) => {
                  // prefer fields populated by server: title, journalName, issnIsbn, indexedIn, authorRole, proofs, dateOfPublication
                  const title = row.title || row.articleTitle || ''
                  const journal = row.journalName || row.journal || row.issn || row.issnIsbn || ''
                  const indexed = row.indexedIn || row.indexed || row.index || ''
                  const authorRole = row.authorRole || row.role || (row.metadata && row.metadata.authorRole) || ''
                  const proofs = Array.isArray(row.proofs) ? row.proofs : (row.proofFiles || row.proof || [])
                  const date = row.dateOfPublication || row.publicationDate || row.date || ''

                  return (
                    <tr key={row.id || row._id || idx}>
                      <td>{idx + 1}</td>
                      <td style={{ color: '#000' }}>{title || '-'}</td>
                      <td style={{ color: '#000' }}>{journal || '-'}</td>
                      <td style={{ color: '#000' }}>{indexed || '-'}</td>
                      <td style={{ color: '#000' }}>{authorRole || '-'}</td>
                          <td>
                              {Array.isArray(proofs) && proofs.length > 0 ? (
                                proofs.map((p, i) => {
                                  const raw = (p && (p.url || p.path || p.fileUrl)) || String(p) || ''
                                  let href = raw

                                  if (href && !href.startsWith('http')) {
                                    if (!href.startsWith('/')) href = `/${href}`
                                    href = `${API_BASE_URL}${href}`
                                  }

                                  const fileName = (p && p.filename) || String(p)
                                  return (
                                    <div key={i}>
                                      <a href={href} target="_blank" rel="noopener noreferrer">
                                        <button className="view-btn">View</button>
                                      </a>
                                    </div>
                                  )
                                })
                              ) : (
                                '—'
                              )}
                          
                          </td>

                      <td style={{ color: '#000' }}>{date ? String(date).slice(0, 10) : '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* footer buttons */}
        <div className="hod-modal-footer">
          <button className="hod-modal-close-btn" onClick={onClose}>
            Close
          </button>

          {typeof onApprove === 'function' && typeof onReject === 'function' && (
            <div className="hod-modal-actions">
              <button
                className="hod-modal-reject-btn"
                disabled={submitting}
                onClick={onReject}
              >
                {submitting ? 'Processing…' : 'Reject'}
              </button>
              <button
                className="hod-modal-approve-btn"
                disabled={submitting}
                onClick={onApprove}
              >
                {submitting ? 'Processing…' : 'Approve'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
