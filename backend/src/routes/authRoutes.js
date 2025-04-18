const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUsers, getUserById, updateUser, deleteUser, changePassword, updateAvatar } = require('../controllers/authController');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');
const avatarUpload = require('../middleware/avatarUpload');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/', verifyToken, verifyAdmin, getUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);
router.put('/change-password/:id', verifyToken, changePassword);
router.put('/:id/avatar', verifyToken, avatarUpload.single('avatar'), updateAvatar);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;