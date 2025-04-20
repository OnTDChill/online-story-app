const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadAvatar } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/avatarUpload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;