const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret'

// Attach user info (id and role) to req.user if token valid
async function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'No authorization header' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid auth format' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    // Attach minimal user info. Caller may fetch full user as needed.
    req.user = { id: payload.id, email: payload.email, role: payload.role, isHod: payload.isHod }
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Factory to require a role (HOD or ADMIN)
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
    // Allow when user has the exact role, is ADMIN, or (for HOD checks) has isHod flag
    if (req.user.role === role) return next()
    if (req.user.role === 'ADMIN') return next()
    if (role === 'HOD' && req.user.isHod) return next()
    return res.status(403).json({ message: 'Insufficient permissions' })
  }
}

module.exports = { authenticate, requireRole }
