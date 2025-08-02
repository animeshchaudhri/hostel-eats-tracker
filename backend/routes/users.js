import express from 'express';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  validateUserCreate, 
  validateUserUpdate, 
  validateObjectId 
} from '../middleware/validation.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.getActiveUsers();
    
    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve users'
    });
  }
});

// Get students only (admin only)
router.get('/students', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const students = await User.getStudents();
    
    res.status(200).json({
      message: 'Students retrieved successfully',
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve students'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve profile'
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      message: 'User retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve user'
    });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, validateUserCreate, async (req, res) => {
  try {
    const { name, roomNumber, loginCode, isAdmin = false } = req.body;

    // Check if login code already exists
    const existingUser = await User.findByLoginCode(loginCode);
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this login code already exists'
      });
    }

    // Create password based on login code (can be customized)
    const password = `${loginCode}_${new Date().getFullYear()}`;

    // Create new user
    const user = new User({
      name,
      roomNumber,
      loginCode: loginCode.toUpperCase(),
      isAdmin,
      password
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        loginCode: user.loginCode,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this login code already exists'
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create user'
    });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateUserUpdate, async (req, res) => {
  try {
    const { name, roomNumber, loginCode, isAdmin, isActive } = req.body;

    // Find user to update
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Check if new login code conflicts with existing users
    if (loginCode && loginCode.toUpperCase() !== user.loginCode) {
      const existingUser = await User.findByLoginCode(loginCode);
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A user with this login code already exists'
        });
      }
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (roomNumber !== undefined) user.roomNumber = roomNumber;
    if (loginCode !== undefined) user.loginCode = loginCode.toUpperCase();
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (isActive !== undefined) user.isActive = isActive;

    // If login code changed, update password
    if (loginCode && loginCode.toUpperCase() !== user.loginCode) {
      user.password = `${loginCode.toUpperCase()}_${new Date().getFullYear()}`;
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        loginCode: user.loginCode,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this login code already exists'
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update user'
    });
  }
});

// Delete user (soft delete - admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Prevent deletion of admin users (optional safety measure)
    if (user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cannot delete admin users'
      });
    }

    // Soft delete - just mark as inactive
    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete user'
    });
  }
});

// Reactivate user (admin only)
router.patch('/:id/reactivate', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      message: 'User reactivated successfully',
      user: {
        id: user._id,
        name: user.name,
        roomNumber: user.roomNumber,
        loginCode: user.loginCode,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to reactivate user'
    });
  }
});

export default router;
