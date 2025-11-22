const INDEX_POINTS = {
  WOS: 5,
  SCOPUS: 3,
  UGC: 1,
  BOOK_CHAPTER: 1,
  BOOK: 2,
  PATENT: 2,
  PATENT_GRANT: 4,
  OTHERS: 0,
}

function scoreForArticle(articleDoc, userId) {
  if (!articleDoc) return 0

  const indexKey = articleDoc.indexedIn
  let basePoints = INDEX_POINTS[indexKey] || 0

  // +1 if the user is corresponding author
  try {
    if (articleDoc.correspondingAuthor && String(articleDoc.correspondingAuthor) === String(userId)) {
      basePoints += 1
    }
  } catch (e) {
    // ignore comparison errors
  }

  let authorCount = 1
  if (Array.isArray(articleDoc.authors) && articleDoc.authors.length > 0) authorCount = articleDoc.authors.length

  const raw = basePoints / (authorCount || 1)
  return Math.round(raw * 100) / 100
}

module.exports = { INDEX_POINTS, scoreForArticle }
