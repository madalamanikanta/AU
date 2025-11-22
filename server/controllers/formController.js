const Article = require('../models/article')
const User = require('../models/User')
const { scoreForArticle } = require('../utils/scoreCalculator')
const { findOrCreateForm, recalcTotalFromResearch } = require('../services/formService')

/** Submit research entries: creates Article docs, attaches to user's FormDetails for year */
async function submitResearch(req, res, next) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Not authenticated' })

    const { formYear, articles } = req.body
    if (!formYear) return res.status(400).json({ message: 'formYear is required' })
    if (!Array.isArray(articles) || articles.length === 0) return res.status(400).json({ message: 'articles array required' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const form = await findOrCreateForm(user, formYear)

    // create articles and corresponding research entries
    for (const art of articles) {
      const articleDoc = new Article({
        title: art.title,
        identifier: art.identifier,
        indexedIn: art.indexedIn,
        journalName: art.journalName,
        issnIsbn: art.issnIsbn,
        dateOfPublication: art.dateOfPublication,
        collaborators: art.collaborators || [],
        authors: art.authors || [userId],
        correspondingAuthor: art.correspondingAuthor || userId,
        createdBy: userId,
        metadata: art.metadata || {},
      })
      await articleDoc.save()

      const apiScore = scoreForArticle(articleDoc, userId)
      form.research = form.research || []
      form.research.push({ article: articleDoc._id, apiScore })
    }

    // mark approvals/research section as submitted
    form.status = 'SUBMITTED'
    form.submittedAt = new Date()
    recalcTotalFromResearch(form)

    await user.save()
    return res.json({ message: 'Submitted', form })
  } catch (err) {
    next(err)
  }
}

async function getForm(req, res, next) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Not authenticated' })
    const year = Number(req.params.year) || new Date().getFullYear()
    const user = await User.findById(userId).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    const form = (user.forms || []).find((f) => f.formYear === Number(year))
    return res.json({ form })
  } catch (err) {
    next(err)
  }
}

// Placeholder uploadProof - expects multer to have stored file on req.file
async function uploadProof(req, res, next) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Not authenticated' })
    const year = Number(req.params.year)
    const researchIndex = Number(req.params.researchIndex)
    if (isNaN(year) || isNaN(researchIndex)) return res.status(400).json({ message: 'Invalid params' })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const form = (user.forms || []).find((f) => f.formYear === Number(year))
    if (!form) return res.status(404).json({ message: 'Form not found for year' })
    const entry = form.research && form.research[researchIndex]
    if (!entry) return res.status(404).json({ message: 'Research entry not found' })

    // Multer should set req.file. We'll store basic file info in proofs
    const file = req.file
    if (!file) return res.status(400).json({ message: 'No file uploaded' })
    entry.proofs = entry.proofs || []
    entry.proofs.push({ url: `/uploads/${file.filename}`, filename: file.originalname, uploadedAt: new Date() })

    await user.save()
    return res.json({ message: 'Proof uploaded', entry })
  } catch (err) {
    next(err)
  }
}

module.exports = { submitResearch, getForm, uploadProof }
