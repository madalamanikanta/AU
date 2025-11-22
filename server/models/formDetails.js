const mongoose = require('mongoose')
const { Schema } = mongoose

// Research entry sub-document schema
const ResearchEntrySchema = new Schema({
  article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  addedAt: { type: Date, default: Date.now },
  apiScore: { type: Number, default: 0 },
  hodApproved: { type: Boolean, default: false },
  hodComment: { type: String },
  hodApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  hodApprovedAt: { type: Date },
  proofs: [{ url: String, filename: String, uploadedAt: Date }],
  // approvals per research entry (HOD may approve/reject individual research rows)
  approvals: [new Schema({
    status: { type: String, enum: ['ACCEPTED','REJECTED'], required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    comment: { type: String },
    proofs: [{ url: String, filename: String, uploadedAt: Date }],
  }, { _id: false })],
})

// Approval sub-document schema
const ApprovalSchema = new Schema({
  sectionName: { type: String, required: true },
  status: { type: String, enum: ['NONE','SUBMITTED','ACCEPTED','REJECTED'], default: 'NONE' },
  pointsAwarded: { type: Number, default: 0 },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  comment: { type: String },
})

// Form details schema
const FormDetailsSchema = new Schema({
  formYear: { type: Number, required: true },
  status: { type: String, enum: ['NONE','SUBMITTED','ACCEPTED','REJECTED'], default: 'NONE' },
  research: { type: [ResearchEntrySchema], default: [] },
  approvals: { type: [ApprovalSchema], default: [] },
  totalScore: { type: Number, default: 0 },
  submittedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// Export only the FormDetailsSchema (embedable)
module.exports = FormDetailsSchema
