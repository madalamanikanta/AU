import React, { useState } from 'react'
import './Login.css'
import { useAuth } from '../context/useAuth.js'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { login, status } = useAuth()

	const validate = () => {
		if (!email) return 'Email is required'
		const re = /\S+@\S+\.\S+/
		if (!re.test(email)) return 'Enter a valid email'
		if (!password) return 'Password is required'
		return ''
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		const v = validate()
		if (v) return setError(v)
		setLoading(true)
		try {
			const nextUser = await login(email, password)
			const nextHash = nextUser?.isHod ? '#/hod' : '#/faculty'
			window.location.hash = nextHash
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="login-page modern">
			<div className="login-card">
				<div className="login-brand">
					<svg className="brand-logo" viewBox="0 0 24 24" aria-hidden>
						<circle cx="12" cy="12" r="10" fill="#2563eb" />
						<text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="Arial">AU</text>
					</svg>
					<div>
						<div className="brand-title">Anurag University</div>
						<div className="brand-sub">Self Appraisal Portal</div>
					</div>
				</div>

				<form className="login-form modern-form" onSubmit={handleSubmit} noValidate>
					{error && <div className="login-error">{error}</div>}

					<div className="field">
						<label className="visually-hidden" htmlFor="email">Email</label>
						<div className="input-wrap">
							<svg className="input-icon" viewBox="0 0 24 24" aria-hidden>
								<path fill="#9aa8c7" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/>
							</svg>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@university.edu"
								autoComplete="username"
								aria-label="Email"
							/>
						</div>
					</div>

					<div className="field">
						<label className="visually-hidden" htmlFor="password">Password</label>
						<div className="input-wrap">
							<svg className="input-icon" viewBox="0 0 24 24" aria-hidden>
								<path fill="#9aa8c7" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7h-1V7a5 5 0 10-10 0v3H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2zM9 7a3 3 0 116 0v3H9V7z"/>
							</svg>
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Your password"
								autoComplete="current-password"
								aria-label="Password"
							/>
							<button
								type="button"
								className="show-btn"
								onClick={() => setShowPassword((s) => !s)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? 'Hide' : 'Show'}
							</button>
						</div>
					</div>

					<button type="submit" disabled={loading || status === 'authenticating'} className="login-btn modern-btn">
						{loading || status === 'authenticating' ? 'Signing in...' : 'Sign in'}
					</button>
				</form>

				<div className="login-foot">Don't have an account? <a href="#">Contact admin</a></div>
			</div>
		</div>
	)
}

