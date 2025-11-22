import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { AuthContext } from './AuthContext.js'

const STATUS = {
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATING: 'authenticating',
  AUTHENTICATED: 'authenticated',
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('authToken') || null
    } catch (e) {
      return null
    }
  })
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(STATUS.UNAUTHENTICATED)
  const [error, setError] = useState(null)

  const resetSession = useCallback(() => {
    setToken(null)
    setUser(null)
    setStatus(STATUS.UNAUTHENTICATED)
    setError(null)
  }, [])

  const authorizedFetch = useCallback((resource, options = {}) => {
    if (!token) return Promise.reject(new Error('Not authenticated'))
    const mergedHeaders = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    }
    return fetch(resource, { ...options, headers: mergedHeaders })
  }, [token])

  const fetchProfile = useCallback(async (activeToken) => {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${activeToken}` },
    })
    if (!res.ok) throw new Error('Session expired')
    const data = await res.json()
    return data?.user || null
  }, [])

  const login = useCallback(async (email, password) => {
    setStatus(STATUS.AUTHENTICATING)
    setError(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      resetSession()
      const message = data?.message || 'Login failed'
      setError(message)
      throw new Error(message)
    }

    const authToken = data.token
    setToken(authToken)
    try {
      sessionStorage.setItem('authToken', authToken)
    } catch (e) {
      // ignore storage errors
    }

    let nextUser = data.user || null
    try {
      const refreshed = await fetchProfile(authToken)
      if (refreshed) nextUser = { ...refreshed }
    } catch (err) {
      console.warn('Unable to refresh profile, using login payload', err)
    }

    setUser(nextUser)
    setStatus(STATUS.AUTHENTICATED)
    return nextUser
  }, [fetchProfile, resetSession])

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('authToken')
    } catch (e) {}
    resetSession()
  }, [resetSession])

  // initialize profile if token was loaded from sessionStorage
  useEffect(() => {
    let active = true
    async function init() {
      if (!token) return
      setStatus(STATUS.AUTHENTICATING)
      try {
        const profile = await fetchProfile(token)
        if (!active) return
        setUser(profile)
        setStatus(STATUS.AUTHENTICATED)
      } catch (err) {
        if (!active) return
        resetSession()
      }
    }
    init()
    return () => {
      active = false
    }
  }, [token, fetchProfile, resetSession])

  const refreshProfile = useCallback(async () => {
    if (!token) return null
    try {
      const profile = await fetchProfile(token)
      setUser(profile)
      setStatus(STATUS.AUTHENTICATED)
      return profile
    } catch (err) {
      setError(err.message)
      resetSession()
      throw err
    }
  }, [token, fetchProfile, resetSession])

  const updateUser = useCallback((updater) => {
    setUser((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  const value = useMemo(() => ({
    token,
    user,
    status,
    error,
    login,
    logout,
    refreshProfile,
    updateUser,
    authorizedFetch,
  }), [token, user, status, error, login, logout, refreshProfile, updateUser, authorizedFetch])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
