const mongoose = require('mongoose')
const { Schema } = mongoose

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  identifier: { type: String },
  indexedIn: { type: String, enum: ['WOS','SCOPUS','UGC','BOOK_CHAPTER','BOOK','PATENT','PATENT_GRANT','OTHERS'], required: true },
  journalName: { type: String },
  issnIsbn: { type: String },
  dateOfPublication: { type: Date },
  collaborators: { type: [String], default: [] },
  authors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  correspondingAuthor: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true })

// Text index for searching title and journalName
ArticleSchema.index({ title: 'text', journalName: 'text' })

module.exports = mongoose.model('Article', ArticleSchema)
