const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { authenticate } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const formController = require('../controllers/formController')
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

router.post(
  '/submit-research',
  authenticate,
  body('formYear').isInt().withMessage('formYear must be an integer'),
  body('articles').isArray({ min: 1 }).withMessage('articles must be a non-empty array'),
  validate,
  formController.submitResearch
)

router.get('/:year', authenticate, formController.getForm)

router.post('/:year/research/:researchIndex/proofs', authenticate, upload.single('proof'), formController.uploadProof)

module.exports = router
