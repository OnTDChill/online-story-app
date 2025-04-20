const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getNotifications);
router.post('/', authMiddleware, createNotification);
router.put('/:id', authMiddleware, updateNotification);
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router;