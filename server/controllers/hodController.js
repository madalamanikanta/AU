const User = require('../models/User')
const Article = require('../models/article')
const { recalcTotalFromApprovals } = require('../services/formService')
const fs = require('fs')
const path = require('path')

/**
 * Return forms for the HOD's department for a given year.
 * Requires authenticate + requireRole('HOD')
 */
async function listForms(req, res, next) {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ message: 'Not authenticated' })

    const year = Number(req.params.year) || new Date().getFullYear()

    // load HOD full user to get department
    const hod = await User.findById(userId).lean()
    if (!hod) return res.status(404).json({ message: 'HOD not found' })
    const dept = hod.profile && hod.profile.department
    if (!dept) return res.status(400).json({ message: 'HOD profile missing department' })

    // Find users in same department who have a form for the year with status === 'SUBMITTED'
    const users = await User.find({ 'profile.department': dept }).lean()

    const results = []
    for (const u of users) {
      const forms = (u.forms || []).filter((f) => Number(f.formYear) === Number(year) && f.status === 'SUBMITTED')
      if (forms && forms.length) {
        // pick first matching form (should be one per year)
        const form = forms[0]

        // Build enriched entries: populate Article data referenced by form.research
        try {
          const articleIds = (form.research || []).map((r) => (r.article ? String(r.article) : null)).filter(Boolean)
          let articles = []
          if (articleIds.length) {
            articles = await Article.find({ _id: { $in: articleIds } }).lean()
          }
          const articlesById = (articles || []).reduce((acc, a) => {
            acc[String(a._id)] = a
            return acc
          }, {})

          const entries = (form.research || []).map((r, index) => {
            const art = r && r.article ? articlesById[String(r.article)] : null
            return {
              index: index + 1,
              title: (art && art.title) || r.title || '',
              journalName: (art && art.journalName) || r.journalName || '',
              issnIsbn: (art && art.issnIsbn) || r.issnIsbn || '',
              indexedIn: (art && art.indexedIn) || r.indexedIn || '',
              dateOfPublication: (art && art.dateOfPublication) || r.dateOfPublication || null,
              authorRole: (art && art.metadata && art.metadata.authorRole) || (r && r.metadata && r.metadata.authorRole) || r.authorRole || '',
              apiScore: r.apiScore || 0,
              proofs: r.proofs || [],
            }
          })

          // Attach entries to form for HOD convenience (non-persistent)
          form.entries = entries
        } catch (err) {
          // if article lookup fails, continue without entries
          console.error('Failed to populate article entries for HOD preview', err)
          form.entries = (form.research || []).map((r, index) => ({ index: index + 1, title: r.title || '', journalName: r.journalName || '', issnIsbn: r.issnIsbn || '', indexedIn: r.indexedIn || '', dateOfPublication: r.dateOfPublication || null, authorRole: (r && r.metadata && r.metadata.authorRole) || r.authorRole || '', apiScore: r.apiScore || 0, proofs: r.proofs || [] }))
        }

        results.push({ userId: u._id, email: u.email, profile: u.profile || {}, form })
      }
    }

    return res.json({ forms: results })
  } catch (err) {
    next(err)
  }
}

/** Approve or reject a section for a faculty's form */
async function approveSection(req, res, next) {
  try {
    const hodId = req.user && req.user.id
    const { facultyId, formYear, sectionName, status, pointsAwarded, comment } = req.body
    if (!facultyId || !formYear || !sectionName || !status) return res.status(400).json({ message: 'Missing required fields' })

    const faculty = await User.findById(facultyId)
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' })
    const form = (faculty.forms || []).find((f) => f.formYear === Number(formYear))
    if (!form) return res.status(404).json({ message: 'Form not found' })

    form.approvals = form.approvals || []
    let approval = form.approvals.find((a) => a.sectionName === sectionName)
    if (!approval) {
      approval = { sectionName }
      form.approvals.push(approval)
    }
    approval.status = status
    approval.pointsAwarded = Number(pointsAwarded) || 0
    approval.approvedBy = hodId
    approval.approvedAt = new Date()
    approval.comment = comment

    // If research accepted, mark research entries as hodApproved
    if (sectionName === 'research' && status === 'ACCEPTED') {
      (form.research || []).forEach((r) => {
        r.hodApproved = true
        r.hodApprovedBy = hodId
        r.hodApprovedAt = new Date()
      })
    }

    // Recalculate total score from approvals (policy choice)
    recalcTotalFromApprovals(form)

    // Update top-level form.status based on HOD action
    // If the HOD set this section to 'REJECTED', mark the whole form as 'REJECTED'.
    // If the HOD set this section to 'ACCEPTED', mark the whole form as 'ACCEPTED'.
    // Preserve detailed per-section approvals in form.approvals.
    if (status === 'REJECTED') {
      form.status = 'REJECTED'

      // Delete uploaded proof files for this form's research entries
      try {
        const uploadsDir = path.join(__dirname, '..', 'uploads')
        if (Array.isArray(form.research)) {
          for (const entry of form.research) {
            if (Array.isArray(entry.proofs)) {
              for (const p of entry.proofs) {
                try {
                  const url = (p && (p.url || p.path)) || ''
                  if (!url) continue
                  const parts = String(url).split('/')
                  const fname = parts[parts.length - 1]
                  if (!fname) continue
                  const fp = path.join(uploadsDir, fname)
                  try {
                    await fs.promises.access(fp)
                    await fs.promises.unlink(fp)
                  } catch (e) {
                    // ignore missing file
                  }
                } catch (e) {
                  // ignore per-file errors
                }
              }
              // remove proofs references from DB
              entry.proofs = []
            }
          }
        }
      } catch (e) {
        console.warn('Failed to delete uploaded proofs on reject', e)
      }

      await faculty.save()
      return res.json({ success: true })
    } else if (status === 'ACCEPTED') {
      form.status = 'ACCEPTED'
    }

    await faculty.save()
    return res.json({ message: 'Approval updated', form })
  } catch (err) {
    next(err)
  }
}

module.exports = { listForms, approveSection }
