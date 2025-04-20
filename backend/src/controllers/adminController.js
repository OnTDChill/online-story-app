const User = require('../models/User');
const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const Transaction = require('../models/Transaction');
const ReadingProgress = require('../models/ReadingProgress');

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStories = await Story.countDocuments();
    const totalChapters = await Chapter.countDocuments();
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    const totalViews = await Story.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const revenueToday = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          type: { $in: ['deposit', 'sale'] }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      totalStories,
      totalChapters,
      newUsersToday,
      totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
      revenueToday: revenueToday.length > 0 ? revenueToday[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await User.countDocuments(query);
    
    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, email, role, diamonds, rubies, svipPoints } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (diamonds !== undefined) user.diamonds = diamonds;
    if (rubies !== undefined) user.rubies = rubies;
    if (svipPoints !== undefined) user.svipPoints = svipPoints;
    
    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Story management
const getAllStories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, genre, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) query.genre = genre;
    if (status) query.status = status;
    
    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await Story.countDocuments(query);
    
    res.json({ stories, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const { title, description, author, genre, status, type } = req.body;
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    if (title) story.title = title;
    if (description) story.description = description;
    if (author) story.author = author;
    if (genre) story.genre = genre;
    if (status) story.status = status;
    if (type) story.type = type;
    
    await story.save();
    res.json({ message: 'Story updated successfully', story });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    // Chapters will be deleted by the pre hook in the Story model
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Revenue data
const getRevenueData = async (req, res) => {
  try {
    const { period = 'day', startDate, endDate } = req.query;
    
    let start, end, groupBy;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days if no dates provided
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    }
    
    // Set grouping based on period
    switch (period) {
      case 'day':
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' }, 
          day: { $dayOfMonth: '$createdAt' } 
        };
        break;
      case 'month':
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        };
        break;
      case 'year':
        groupBy = { 
          year: { $year: '$createdAt' } 
        };
        break;
      default:
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' }, 
          day: { $dayOfMonth: '$createdAt' } 
        };
    }
    
    const revenueData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: start, $lte: end },
          type: { $in: ['deposit', 'sale'] }
        } 
      },
      { 
        $group: { 
          _id: groupBy,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format the data for frontend
    const formattedData = revenueData.map(item => {
      let date;
      if (period === 'day') {
        date = new Date(item._id.year, item._id.month - 1, item._id.day);
      } else if (period === 'month') {
        date = new Date(item._id.year, item._id.month - 1, 1);
      } else {
        date = new Date(item._id.year, 0, 1);
      }
      
      return {
        date: date.toISOString().split('T')[0],
        total: item.total,
        count: item.count
      };
    });
    
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllStories,
  updateStory,
  deleteStory,
  getRevenueData
};