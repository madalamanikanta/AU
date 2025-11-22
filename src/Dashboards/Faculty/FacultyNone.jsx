import React, { useState } from 'react'
import Header from '../Header.jsx'
import './Faculty.css'
import FacultyForm from '../Faculty/FacultyForm.jsx'

const FacultyNone = () => {
	const [showForm, setShowForm] = useState(false)

	const onFill = () => {
		setShowForm(true)   // change UI state
	}

	return (
		<div className="faculty-container">
			<Header />
			<main className="faculty-main">
				{!showForm ? (
					<div className="faculty-box">
						<h1 className="faculty-title">
							Fill out the Appraisal form<br/>For Academic Year 2025
						</h1>
						<button className="faculty-btn outline" onClick={onFill}>
							Fill the Application
						</button>
					</div>
				) : (
					<FacultyForm />
				)}
			</main>
		</div>
	)
}

export default FacultyNone
