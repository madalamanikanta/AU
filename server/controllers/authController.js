const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret'

async function register(req, res, next) {
  try {
    const { email, password, profile } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already registered' })
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const user = new User({ email, passwordHash, profile })
    await user.save()
    return res.status(201).json({ message: 'User created', user: { id: user._id, email: user.email } })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, isHod: user.isHod }, JWT_SECRET, { expiresIn: '8h' })
    const safeUser = { id: user._id, email: user.email, role: user.role, isHod: user.isHod }
    return res.json({ message: 'Login successful', token, user: safeUser })
  } catch (err) {
    next(err)
  }
}

async function me(req, res, next) {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'No authorization header' })
    const parts = auth.split(' ')
    const token = parts[1]
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ user })
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'No authorization header' })
    const parts = auth.split(' ')
    const token = parts[1]
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const incoming = req.body && (req.body.profile || req.body)
    if (!incoming) return res.status(400).json({ message: 'No profile data provided' })

    // Only allow the profile fields defined in ProfileSchema to be set
    const allowed = ['employeeName', 'department', 'experienceYears', 'designation', 'contactNumber']
    user.profile = user.profile || {}
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(incoming, k)) {
        user.profile[k] = incoming[k]
      }
    })

    await user.save()
    const safe = user.toObject()
    delete safe.passwordHash
    return res.json({ message: 'Profile updated', user: safe })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, me, updateProfile }
