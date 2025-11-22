const User = require('../models/User')

/**
 * Find existing form for year or create a new FormDetails subdoc and push to user.forms
 */
async function findOrCreateForm(userDoc, formYear) {
  let form = (userDoc.forms || []).find((f) => f.formYear === Number(formYear))
  if (!form) {
    // push a new embedded form
    userDoc.forms = userDoc.forms || []
    userDoc.forms.push({ formYear: Number(formYear) })
    form = userDoc.forms[userDoc.forms.length - 1]
  }
  return form
}

function recalcTotalFromResearch(form) {
  if (!form) return 0
  const sum = (form.research || []).reduce((acc, r) => acc + (r.apiScore || 0), 0)
  form.totalScore = sum
  return sum
}

function recalcTotalFromApprovals(form) {
  if (!form) return 0
  const sum = (form.approvals || []).reduce((acc, a) => acc + (a.pointsAwarded || 0), 0)
  form.totalScore = sum
  return sum
}

module.exports = { findOrCreateForm, recalcTotalFromResearch, recalcTotalFromApprovals }
