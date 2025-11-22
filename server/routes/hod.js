const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const hodController = require('../controllers/hodController')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'uploads'))
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname) || ''
		const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext
		cb(null, name)
	},
})

const upload = multer({ storage })

router.get('/forms/:year', authenticate, requireRole('HOD'), hodController.listForms)
// accept optional approval files under field name 'approvalProofs'
router.post('/approve-section', authenticate, requireRole('HOD'), upload.array('approvalProofs'), hodController.approveSection)

module.exports = router
