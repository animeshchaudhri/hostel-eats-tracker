import express from 'express';
import MealEntry from '../models/MealEntry.js';
import User from '../models/User.js';
import { 
  authenticateToken, 
  requireAdmin, 
  requireOwnershipOrAdmin 
} from '../middleware/auth.js';
import { 
  validateMealEntryCreate, 
  validateMealEntryUpdate, 
  validateObjectId,
  validateUserIdParam,
  validateDateRangeQuery
} from '../middleware/validation.js';

const router = express.Router();

// Get meal entries - returns user's own entries if not admin, all entries if admin
router.get('/', authenticateToken, validateDateRangeQuery, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    
    let entries;
    let totalCount;
    
    if (req.user.isAdmin) {
      // Admin can see all entries
      entries = await MealEntry.getAllEntriesWithUsers(options)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      totalCount = await MealEntry.countDocuments({ isActive: true });
    } else {
      // Students can only see their own entries
      entries = await MealEntry.getEntriesForUser(req.user._id, options)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      totalCount = await MealEntry.countDocuments({ 
        userId: req.user._id, 
        isActive: true,
        ...(startDate || endDate ? {
          entryDate: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        } : {})
      });
    }
    
    res.status(200).json({
      message: 'Meal entries retrieved successfully',
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get meal entries error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve meal entries'
    });
  }
});

// Get all meal entries (admin only) - separate endpoint for admin dashboard
router.get('/admin/all', authenticateToken, requireAdmin, validateDateRangeQuery, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    
    const entries = await MealEntry.getAllEntriesWithUsers(options)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await MealEntry.countDocuments({ isActive: true });
    
    res.status(200).json({
      message: 'Meal entries retrieved successfully',
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get meal entries error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve meal entries'
    });
  }
});

// Get meal entries for a specific user
router.get('/user/:userId', 
  authenticateToken, 
  validateUserIdParam, 
  validateDateRangeQuery,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, mealType, limit = 100, page = 1 } = req.query;
      
      const options = {};
      if (startDate) options.startDate = startDate;
      if (endDate) options.endDate = endDate;
      if (mealType) options.mealType = mealType;
      
      const entries = await MealEntry.getEntriesForUser(userId, options)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      // Get total count for pagination
      const totalCount = await MealEntry.countDocuments({ 
        userId, 
        isActive: true,
        ...(startDate || endDate ? {
          entryDate: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        } : {}),
        ...(mealType && { mealType })
      });
      
      res.status(200).json({
        message: 'User meal entries retrieved successfully',
        entries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Get user meal entries error:', error);
      res.status(500).json({
        error: 'Server Error',
        message: 'Failed to retrieve user meal entries'
      });
    }
  }
);

// Get spending summary for a user
router.get('/user/:userId/summary', 
  authenticateToken, 
  validateUserIdParam, 
  validateDateRangeQuery,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      const options = {};
      if (startDate) options.startDate = startDate;
      if (endDate) options.endDate = endDate;
      
      const summaryData = await MealEntry.getSpendingSummary(userId, options);
      const summary = summaryData[0] || {
        mealTypeBreakdown: [],
        overallTotal: 0,
        overallMeals: 0,
        overallAvg: 0
      };
      
      res.status(200).json({
        message: 'Spending summary retrieved successfully',
        summary
      });
    } catch (error) {
      console.error('Get spending summary error:', error);
      res.status(500).json({
        error: 'Server Error',
        message: 'Failed to retrieve spending summary'
      });
    }
  }
);

// Get dish frequency for a user
router.get('/user/:userId/dishes', 
  authenticateToken, 
  validateUserIdParam, 
  validateDateRangeQuery,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, limit = 20 } = req.query;
      
      const options = { limit: parseInt(limit) };
      if (startDate) options.startDate = startDate;
      if (endDate) options.endDate = endDate;
      
      const dishes = await MealEntry.getDishFrequency(userId, options);
      
      res.status(200).json({
        message: 'Dish frequency retrieved successfully',
        dishes
      });
    } catch (error) {
      console.error('Get dish frequency error:', error);
      res.status(500).json({
        error: 'Server Error',
        message: 'Failed to retrieve dish frequency'
      });
    }
  }
);

// Get a specific meal entry
router.get('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const entry = await MealEntry.findById(req.params.id)
      .populate('userId', 'name roomNumber loginCode');
    
    if (!entry || !entry.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal entry not found'
      });
    }
    
    // Check if user can access this entry
    if (!req.user.isAdmin && entry.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own meal entries'
      });
    }
    
    res.status(200).json({
      message: 'Meal entry retrieved successfully',
      entry
    });
  } catch (error) {
    console.error('Get meal entry error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve meal entry'
    });
  }
});

// Create new meal entry (admin only)
router.post('/', authenticateToken, requireAdmin, validateMealEntryCreate, async (req, res) => {
  try {
    const { userId, entryDate, mealType, dishName, cost, notes } = req.body;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found or inactive'
      });
    }
    
    // Create new meal entry
    const entry = new MealEntry({
      userId,
      entryDate: new Date(entryDate),
      mealType: mealType.toLowerCase(),
      dishName,
      cost,
      notes
    });
    
    await entry.save();
    
    // Populate user data for response
    await entry.populate('userId', 'name roomNumber loginCode');
    
    res.status(201).json({
      message: 'Meal entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create meal entry error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A meal entry for this user, date, and meal type already exists'
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create meal entry'
    });
  }
});

// Update meal entry (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateMealEntryUpdate, async (req, res) => {
  try {
    const { entryDate, mealType, dishName, cost, notes } = req.body;
    
    const entry = await MealEntry.findById(req.params.id);
    if (!entry || !entry.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal entry not found'
      });
    }
    
    // Update fields
    if (entryDate !== undefined) entry.entryDate = new Date(entryDate);
    if (mealType !== undefined) entry.mealType = mealType.toLowerCase();
    if (dishName !== undefined) entry.dishName = dishName;
    if (cost !== undefined) entry.cost = cost;
    if (notes !== undefined) entry.notes = notes;
    
    await entry.save();
    
    // Populate user data for response
    await entry.populate('userId', 'name roomNumber loginCode');
    
    res.status(200).json({
      message: 'Meal entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update meal entry error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A meal entry for this user, date, and meal type already exists'
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update meal entry'
    });
  }
});

// Delete meal entry (soft delete - admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const entry = await MealEntry.findById(req.params.id);
    
    if (!entry || !entry.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal entry not found'
      });
    }
    
    // Soft delete
    entry.isActive = false;
    await entry.save();
    
    res.status(200).json({
      message: 'Meal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal entry error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete meal entry'
    });
  }
});

// Restore deleted meal entry (admin only)
router.patch('/:id/restore', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const entry = await MealEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal entry not found'
      });
    }
    
    entry.isActive = true;
    await entry.save();
    
    // Populate user data for response
    await entry.populate('userId', 'name roomNumber loginCode');
    
    res.status(200).json({
      message: 'Meal entry restored successfully',
      entry
    });
  } catch (error) {
    console.error('Restore meal entry error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to restore meal entry'
    });
  }
});

export default router;
