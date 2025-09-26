const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/refresh-token', authenticateToken, authController.refreshToken);

module.exports = router;