const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const hodController = require('../controllers/hodController')

router.get('/forms/:year', authenticate, requireRole('HOD'), hodController.listForms)
router.post('/approve-section', authenticate, requireRole('HOD'), hodController.approveSection)

module.exports = router
