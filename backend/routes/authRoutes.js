const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); // Fixed path and filename

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.get('/me', ensureAuthenticated, authController.getMe);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/quota', ensureAuthenticated, authController.getQuota);

module.exports = router;