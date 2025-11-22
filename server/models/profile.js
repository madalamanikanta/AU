const mongoose = require('mongoose')
const { Schema } = mongoose

// Embedded profile schema (no _id) for embedding inside User
const ProfileSchema = new Schema({
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  designation: { type: String, required: true },
  contactNumber: { type: String },
}, { _id: false })

module.exports = ProfileSchema
