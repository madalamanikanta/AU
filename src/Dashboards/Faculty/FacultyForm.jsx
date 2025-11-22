import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/useAuth.js'
import FacultyPreview from './FacultyPreview.jsx'


const defaultYear = new Date().getFullYear()

export default function FacultyForm({ formYear = defaultYear, onCancel }) {
  const { status } = useAuth()
  const css = `
  .fd-page { min-height:100vh;background:linear-gradient(135deg,#f8fafc,#eef2ff);padding:20px }
  .fd-card{max-width:1100px;margin:0 auto;background:#fff;border-radius:12px;padding:20px}
  .fd-header{margin-bottom:16px;text-align:center}
  .fd-title{margin:0;font-size:20px;font-weight:700;color:#0f172a}
  .fd-subtitle{color:#64748b;font-size:12px;margin-top:4px}
  .fd-table{width:100%;border-collapse:collapse;margin-top:12px}
  .fd-th{font-size:13px;text-align:left;padding:8px 10px;color:#475569}
  /* Table row background + borders */

/* Table cell background and inputs: use light backgrounds so preview is readable */
.fd-td {
  padding: 10px;
  border-bottom: 1px solid #e6eef8;
  color: #0f172a;
  background: transparent;
}

/* Input style – inside table data cells */
.fd-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
}

/* Placeholder inside inputs */
.fd-input::placeholder {
  color: #94a3b8;
}

/* File input text */
input[type="file"] {
  color: #0f172a;
}


/* Alternate row color (like your design screenshot) */
.fd-table tbody tr:nth-child(odd) .fd-td {
  background: #f8fafc;
}

.fd-table tbody tr:nth-child(even) .fd-td {
  background: #edf2f7;
}

/* Table header background */
.fd-th {
  background: #eef2ff;
  border-bottom: 2px solid #c7d2fe;
}
.fd-table {
  border: 1px solid #e2e8f0; 
  border-radius: 8px;
  overflow: hidden;
}

 
  .fd-add-btn{margin-top:12px;background:#e0e7ff;color:#3730a3;border:1px solid #c7d2fe;padding:8px 12px;border-radius:10px;cursor:pointer}
  .fd-submit{background:#4f46e5;color:#fff;padding:10px 16px;border-radius:10px;border:none;cursor:pointer}
  `

  // stable id generator: capture a start timestamp once, with a counter
  const _start = useRef(null)
  const _counter = useRef(0)
  // (initialization of start and first row happens after state declarations below)
  const uid = () => `${_start.current}_${++_counter.current}`

  const newRow = () => ({
    id: uid(),
    articleTitle: '',
    journalNameIssnIsbn: '',
    indexedIn: '',
    dateOfPublication: '',
    authorRole: '',
    documentFile: null,
  })

  const initialRow = { id: 'r0', articleTitle: '', journalNameIssnIsbn: '', indexedIn: '', dateOfPublication: '', authorRole: '', documentFile: null }
  const [rows, setRows] = useState(() => {
    try {
      const raw = sessionStorage.getItem('facultyFormDraft')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.rows) && parsed.rows.length) return parsed.rows.map((r) => ({ ...r }))
      }
    } catch {
      // ignore
    }
    return [initialRow]
  })
  const [error, setError] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const updateRow = (id, key, value) => setRows((all) => all.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  const addRow = () => setRows((all) => [...all, newRow()])
  const removeRow = (id) => setRows((all) => (all.length > 1 ? all.filter((r) => r.id !== id) : all))

  // payload builder kept in modal where submission happens

  // When the user clicks submit on the form, we open an inline preview modal.
  const handleSubmit = (e) => {
    e.preventDefault()
    if (status !== 'authenticated') {
      console.log('Your session expired. Please sign in again.')
      return
    }
    setError(null)
    // create a serializable draft (exclude File objects)
    try {
      const draft = {
        formYear,
        rows: rows.map((r) => ({
          id: r.id,
          articleTitle: r.articleTitle,
          journalNameIssnIsbn: r.journalNameIssnIsbn,
          indexedIn: r.indexedIn,
          dateOfPublication: r.dateOfPublication,
          authorRole: r.authorRole,
          documentFileName: r.documentFile ? (r.documentFile.name || 'attached') : null,
        })),
      }
      localStorage.setItem('facultyFormDraft', JSON.stringify(draft))
    } catch (err) {
      console.error('Failed to save draft to localStorage', err)
    }
    setShowPreview(true)
  }

  // Load draft if present (so Edit from preview can restore state)
  useEffect(() => {
    // initialize start timestamp and ensure there's at least one row
    if (_start.current == null) _start.current = Date.now()
    // load draft handled in lazy initializer above
  }, [])

  return (
    <div className="fd-page">
      <style>{css}</style>
      <form className="fd-card" onSubmit={handleSubmit}>
        {error && (
          <div style={{
            marginBottom: 12,
            padding: '8px 12px',
            borderRadius: 8,
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
          }}>
            {error}
          </div>
        )}
        <header className="fd-header">
          <h1 className="fd-title">Details of Research & Publications</h1>
          <div className="fd-subtitle">Fill details of publications (attach supporting documents)</div>
        </header>

        <div className="fd-table-wrap">
          <table className="fd-table" role="table">
            <thead>
              <tr>
                <th className="fd-th">S.No</th>
                <th className="fd-th">Article title</th>
                <th className="fd-th">Journal name with ISSN/ISBN</th>
                <th className="fd-th">Indexed in</th>
                <th className="fd-th">Date of Publication</th>
                <th className="fd-th">Author Role</th>
                <th className="fd-th">Supporting Document</th>
                <th className="fd-th"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="fd-td">{i + 1}</td>
                  <td className="fd-td"><input className="fd-input" value={r.articleTitle} onChange={(e) => updateRow(r.id, 'articleTitle', e.target.value)} placeholder="Article title"/></td>
                  <td className="fd-td"><input className="fd-input" value={r.journalNameIssnIsbn} onChange={(e) => updateRow(r.id, 'journalNameIssnIsbn', e.target.value)} placeholder="Journal name with ISSN/ISBN"/></td>
                  <td className="fd-td">
                    <select className="fd-input" value={r.indexedIn} onChange={(e) => updateRow(r.id, 'indexedIn', e.target.value)}>
                      <option value="">Select</option>
                      <option value="WoS">WoS</option>
                      <option value="Scopus">Scopus</option>
                      <option value="UGC">UGC</option>
                      <option value="Book Chapter">Book Chapter</option>
                      <option value="Book">Book</option>
                      <option value="Patent Grant">Patent Grant</option>
                      <option value="Patent Publication">Patent Publication</option>
                    </select>
                  </td>
                  <td className="fd-td">
  <input
    type="date"
    className="fd-input fd-date-input"
    value={r.dateOfPublication}
    onChange={(e) => updateRow(r.id, 'dateOfPublication', e.target.value)}
  />
</td>

                  <td className="fd-td">
                    <select className="fd-input" value={r.authorRole} onChange={(e) => updateRow(r.id, 'authorRole', e.target.value)}>
                      <option value="">Select</option>
                      <option value="First Author">First Author</option>
                      <option value="Corresponding Author">Corresponding Author</option>
                      <option value="Co-Author">Co-Author</option>
                    </select>
                  </td>
                  <td className="fd-td"><input className="fd-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => updateRow(r.id, 'documentFile', e.target.files?.[0] || null)} /></td>
                  <td className="fd-td" style={{textAlign:'center'}}>
                    <button type="button" onClick={() => removeRow(r.id)} style={{background:'transparent',border:'none',color:'#dc2626',cursor:'pointer'}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{marginTop:12}}>
          <button type="button" className="fd-add-btn" onClick={addRow}>+ Add another publication</button>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',marginTop:18}}>
          <div style={{ display: 'flex', gap: 12 }}>
            {onCancel && (
              <button type="button" className="fd-submit" style={{ background: '#e2e8f0', color: '#0f172a' }} onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="fd-submit">
              Preview
            </button>
          </div>
        </div>
      </form>
      {showPreview && (
        <FacultyPreview draft={{ formYear, rows }} onClose={() => setShowPreview(false)} onSubmitted={() => { setRows([newRow()]); }} />
      )}
    </div>
  )
}
