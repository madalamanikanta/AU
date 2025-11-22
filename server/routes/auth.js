const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { validate } = require('../middleware/validate')
const authController = require('../controllers/authController')

router.post('/register', body('email').isEmail(), body('password').isLength({ min: 6 }), validate, authController.register)
router.post('/login', body('email').isEmail(), body('password').exists(), validate, authController.login)
router.get('/me', authController.me)
router.patch('/profile', authController.updateProfile)

module.exports = router
