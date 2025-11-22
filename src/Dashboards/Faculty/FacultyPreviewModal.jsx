// import React, { useEffect, useState } from 'react'
// import { useAuth } from '../../context/useAuth.js'

// export default function FacultyPreviewModal({ draft, onClose, onSubmitted }) {
//   const { user, authorizedFetch } = useAuth()
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState(null)
//   const [localDraft, setLocalDraft] = useState(draft || null)

//   useEffect(() => {
//     if (draft) {
//       setLocalDraft(draft)
//       return
//     }
//     try {
//       const raw = localStorage.getItem('facultyFormDraft')
//       if (raw) {
//         const parsed = JSON.parse(raw)
//         setLocalDraft(parsed)
//       }
//     } catch (err) {
//       // ignore parse errors
//     }
//   }, [draft])

//   if (!localDraft) return null

//   const buildPayload = () => {
//     const { formYear, rows } = localDraft
//     const articles = (rows || []).map((r, index) => ({
//       title: r.articleTitle,
//       journalName: r.journalNameIssnIsbn,
//       issnIsbn: r.journalNameIssnIsbn,
//       indexedIn: (r.indexedIn || '').toUpperCase(),
//       dateOfPublication: r.dateOfPublication || undefined,
//       metadata: { authorRole: r.authorRole, rowIndex: index + 1 },
//     }))
//     return { formYear, articles }
//   }

//   const handleConfirm = async () => {
//     setSubmitting(true)
//     setError(null)
//     try {
//       const payload = buildPayload()
//       const res = await authorizedFetch('/api/forms/submit-research', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       })
//       const data = await res.json().catch(() => ({}))
//       if (!res.ok) throw new Error(data?.message || 'Submit failed')
//       // At this point the form document was created on the server and `data.form`
//       // should contain the `research` array. Upload attached files (proofs)
//       // for each row that had a File object via the proofs upload endpoint.
//       const returnedForm = data?.form
//       // upload files, if any
//       const rows = localDraft?.rows || []
//       if (returnedForm && Array.isArray(rows) && rows.length) {
//         const uploads = []
//         for (let i = 0; i < rows.length; i++) {
//           const r = rows[i]
//           const file = r.documentFile || r.document || null
//           if (file && file instanceof File) {
//             const fd = new FormData()
//             fd.append('proof', file, file.name)
//             // authorizedFetch will attach Authorization header; do not set Content-Type
//             uploads.push(
//               authorizedFetch(`/api/forms/${returnedForm.formYear}/research/${i}/proofs`, {
//                 method: 'POST',
//                 body: fd,
//               }).then(async (resp) => {
//                 if (!resp.ok) {
//                   const err = await resp.json().catch(() => ({}))
//                   throw new Error(err?.message || `Upload failed for row ${i + 1}`)
//                 }
//                 return resp.json().catch(() => ({}))
//               })
//             )
//           }
//         }

//         if (uploads.length) {
//           try {
//             await Promise.all(uploads)
//           } catch (uerr) {
//             console.warn('One or more proof uploads failed', uerr)
//             // don't block the main success path; surface a message
//             setError('Submitted, but some proof file uploads failed. Check console for details.')
//           }
//         }
//       }

//       if (typeof onSubmitted === 'function') onSubmitted(returnedForm)
//       // clear local draft on success
//       try { localStorage.removeItem('facultyFormDraft') } catch { /* ignore */ }
//       // navigate SPA-style to submitted page
//       try { window.location.hash = '#/faculty-submitted' } catch { /* ignore */ }
//       onClose()
//     } catch (err) {
//       console.error('Submit failed', err)
//       setError(err.message || 'Submit failed')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
//       <div style={{ position: 'relative', width: 'min(1100px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 10px 40px rgba(2,6,23,0.2)' }}>
//         <style>{`
//           .preview-table { width: 100%; border-collapse: collapse }
//           .preview-th { text-align: left; padding: 8px; color: #000 }
//           .preview-td { padding: 8px; vertical-align: top; color: #000 }
//           .preview-input { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #000 }
//           .preview-input::placeholder { color: #6b7280 }
//           .preview-select { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #000 }
//         `}</style>
//         <header style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div>
//               <h2 style={{ margin: 0, color: '#000' }}>{user?.profile?.employeeName || user?.email}</h2>
//               <div style={{ color: '#000' }}>{user?.profile?.designation || ''} — {user?.profile?.department || ''}</div>
//             </div>
//           <div>
//             <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
//           </div>
//         </header>

//         <section style={{ marginBottom: 12 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
//             <div style={{ flex: 1 }}>
//               <h3 style={{ marginTop: 0 }}>Profile</h3>
//               <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', color: '#000' }}>
//                 <div><strong>Name:</strong> {user?.profile?.employeeName || user?.email}</div>
//                 <div><strong>Designation:</strong> {user?.profile?.designation || '-'}</div>
//                 <div><strong>Department:</strong> {user?.profile?.department || '-'}</div>
//               </div>
//             </div>
//             <div style={{ width: 220 }}>
//               <div style={{ textAlign: 'right', color: '#000' }}>
//                 <div><strong>Form Year</strong></div>
//                 <div>{draft.formYear}</div>
//                 <div style={{ marginTop: 8 }}><strong>Entries</strong></div>
//                 <div>{(draft.rows || []).length}</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section style={{ marginTop: 8 }}>
//           <h3>Research & Publications</h3>
//           <div style={{ borderRadius: 8, background: '#fff', padding: 8 }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ textAlign: 'left', color: '#475569' }}>
//                   <th style={{ padding: 8, width: 40 }}>#</th>
//                   <th style={{ padding: 8 }}>Title</th>
//                   <th style={{ padding: 8 }}>Journal / ISSN</th>
//                   <th style={{ padding: 8, width: 120 }}>Indexed</th>
//                   <th style={{ padding: 8, width: 120 }}>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(draft.rows || []).map((r, i) => (
//                   <tr key={r.id || i} style={{ borderBottom: '1px solid #eef2ff' }}>
//                     <td style={{ padding: 8 }}>
//                       <input className="preview-input" disabled value={String(i + 1)} />
//                     </td>
//                     <td style={{ padding: 8 }}>
//                       <input className="preview-input" disabled value={r.articleTitle || ''} placeholder="Article title" />
//                     </td>
//                     <td style={{ padding: 8 }}>
//                       <input className="preview-input" disabled value={r.journalNameIssnIsbn || ''} placeholder="Journal name with ISSN/ISBN" />
//                     </td>
//                     <td style={{ padding: 8, width: 140 }}>
//                       <select className="preview-select" disabled value={r.indexedIn || ''}>
//                         <option value="">Select</option>
//                         <option value="WoS">WoS</option>
//                         <option value="Scopus">Scopus</option>
//                         <option value="UGC">UGC</option>
//                         <option value="Book Chapter">Book Chapter</option>
//                         <option value="Book">Book</option>
//                         <option value="Patent Grant">Patent Grant</option>
//                         <option value="Patent Publication">Patent Publication</option>
//                       </select>
//                     </td>
//                     <td style={{ padding: 8, width: 140 }}>
//                       <input className="preview-input" disabled type="date" value={r.dateOfPublication || ''} />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </section>

//         {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}

//         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
//           <button onClick={onClose} style={{ padding: '10px 14px', borderRadius: 8 }}>Edit</button>
//           <button onClick={handleConfirm} disabled={submitting} style={{ padding: '10px 14px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>
//             {submitting ? 'Submitting…' : 'Confirm & Submit'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
