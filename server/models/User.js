const mongoose = require('mongoose')

const ProfileSchema = require('./profile')
const FormDetailsSchema = require('./formDetails')

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  isHod: { type: Boolean, default: false },
  role: { type: String, enum: ['FACULTY', 'HOD', 'ADMIN'], default: 'FACULTY' },
  profile: { type: ProfileSchema },
  forms: { type: [FormDetailsSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
