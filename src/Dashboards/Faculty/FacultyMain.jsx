import React, { useCallback, useEffect, useState } from 'react'
import FacultyNone from './FacultyNone'
import FacultySubmitted from './FacultySubmitted'
import FacultyAccepted from './FacultyAccepted'
import FacultyRejected from './FacultyRejected'
import { useAuth } from '../../context/useAuth.js'

const FacultyMain = () => {
	const { status: authStatus, authorizedFetch } = useAuth()
	const [loading, setLoading] = useState(true)
	const [form, setForm] = useState(null)
	const [error, setError] = useState(null)
	const year = new Date().getFullYear()

	const fetchForm = useCallback(async () => {
		if (authStatus !== 'authenticated') return null
		const res = await authorizedFetch(`/api/forms/${year}`)
		const data = await res.json().catch(() => ({}))
		if (!res.ok) {
			throw new Error(data?.message || 'Failed to load appraisal form')
		}
		return data?.form || null
	}, [authorizedFetch, authStatus, year])

	const reloadForm = useCallback(async () => {
		if (authStatus !== 'authenticated') {
			setForm(null)
			return null
		}
		setLoading(true)
		setError(null)
		try {
			const nextForm = await fetchForm()
			setForm(nextForm)
			return nextForm
		} catch (err) {
			setError(err.message)
			setForm(null)
			return null
		} finally {
			setLoading(false)
		}
	}, [authStatus, fetchForm])

	useEffect(() => {
		let active = true
		if (authStatus !== 'authenticated') {
			setLoading(false)
			setForm(null)
			return () => {
				active = false
			}
		}
		setLoading(true)
		setError(null)
		fetchForm()
			.then((nextForm) => {
				if (!active) return
				setForm(nextForm)
			})
			.catch((err) => {
				if (!active) return
				setError(err.message)
				setForm(null)
			})
			.finally(() => {
				if (!active) return
				setLoading(false)
			})
		return () => {
			active = false
		}
	}, [authStatus, fetchForm])

	if (authStatus !== 'authenticated') {
		return <div style={{ padding: 24 }}>Please sign in to view your appraisal progress.</div>
	}

	if (loading) return <div style={{ padding: 24 }}>Loading your appraisal data…</div>
	if (error) {
		return (
			<div style={{ padding: 24 }}>
				<div style={{ marginBottom: 12 }}>Could not load your appraisal form: {error}</div>
				<button className="faculty-btn" onClick={reloadForm}>
					Retry
				</button>
			</div>
		)
	}

	const status = (form && form.status) || 'NONE'

	if (!form || status === 'NONE') return <FacultyNone year={year} onRefresh={reloadForm} />

	if (status === 'SUBMITTED') {
		return <FacultySubmitted status={status} form={form} />
	}

	if (status === 'ACCEPTED') return <FacultyAccepted form={form} />

	if (status === 'REJECTED') {
		const remarks = form.remark || form.remarks || form.rejectionRemark || form.rejectionRemarks || ''
		return <FacultyRejected remarks={remarks} form={form} />
	}

	// fallback to NONE
	return <FacultyNone year={year} onRefresh={reloadForm} />
}

export default FacultyMain
