import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token or user not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      error: 'Server Error',
      message: 'Error verifying token'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'Authentication required'
    });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  
  next();
};

// Middleware to check if user can access resource (admin or own resource)
export const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'Authentication required'
    });
  }
  
  // Admin can access everything
  if (req.user.isAdmin) {
    return next();
  }
  
  // User can only access their own resources
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  
  if (!resourceUserId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'User ID required'
    });
  }
  
  if (req.user._id.toString() !== resourceUserId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You can only access your own resources'
    });
  }
  
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
