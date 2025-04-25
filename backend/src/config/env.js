require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/online-story-app',
  nodeEnv: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_for_development'
};