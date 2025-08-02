import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Login with login code
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { loginCode } = req.body;

    // Find user by login code
    const user = await User.findByLoginCode(loginCode);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid login code'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Account is deactivated'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, loginCode: user.loginCode },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        loginCode: user.loginCode,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during login'
    });
  }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

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

    res.status(200).json({
      message: 'Token is valid',
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        loginCode: user.loginCode,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
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
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Error verifying token'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    // Verify token (even if expired, we still want to check if it's valid)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Allow expired tokens for refresh
        decoded = jwt.decode(token);
      } else {
        throw error;
      }
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'User not found or deactivated'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, loginCode: user.loginCode },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        loginCode: user.loginCode,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token'
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Error refreshing token'
    });
  }
});

export default router;
