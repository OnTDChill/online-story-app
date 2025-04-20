const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.user && req.user.user.role === 'Admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  };
  
module.exports = adminMiddleware;