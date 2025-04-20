const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAllUsers, 
  updateUser, 
  deleteUser,
  getAllStories,
  updateStory,
  deleteStory,
  getRevenueData
} = require('../controllers/adminController');
const { 
  getStoryPlots, 
  getStoryPlotById, 
  createStoryPlot, 
  updateStoryPlot, 
  deleteStoryPlot 
} = require('../controllers/storyPlotController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats);

// User management
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Story management
router.get('/stories', authMiddleware, adminMiddleware, getAllStories);
router.put('/stories/:id', authMiddleware, adminMiddleware, updateStory);
router.delete('/stories/:id', authMiddleware, adminMiddleware, deleteStory);

// Story plot management
router.get('/plots', authMiddleware, adminMiddleware, getStoryPlots);
router.get('/plots/:id', authMiddleware, adminMiddleware, getStoryPlotById);
router.post('/plots', authMiddleware, adminMiddleware, createStoryPlot);
router.put('/plots/:id', authMiddleware, adminMiddleware, updateStoryPlot);
router.delete('/plots/:id', authMiddleware, adminMiddleware, deleteStoryPlot);

// Revenue data
router.get('/revenue', authMiddleware, adminMiddleware, getRevenueData);

module.exports = router;