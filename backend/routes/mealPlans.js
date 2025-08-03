import express from 'express';
import MealPlan from '../models/MealPlan.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all meal plans (public - for landing page)
router.get('/', async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ isActive: true }).sort({ price: 1 });
    
    res.status(200).json({
      success: true,
      message: 'Meal plans retrieved successfully',
      plans: mealPlans
    });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve meal plans'
    });
  }
});

// Get meal plan by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mealPlan = await MealPlan.findById(id);
    
    if (!mealPlan) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Meal plan retrieved successfully',
      plan: mealPlan
    });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve meal plan'
    });
  }
});

// Create new meal plan (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      price,
      mealsPerDay,
      totalMeals,
      includes,
      features,
      mealTypes
    } = req.body;

    // Validation
    if (!name || !description || !type || !price || !mealsPerDay || !totalMeals || !mealTypes) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All required fields must be provided'
      });
    }

    const mealPlan = new MealPlan({
      name,
      description,
      type,
      price,
      mealsPerDay,
      totalMeals,
      includes: includes || [],
      features: features || [],
      mealTypes
    });

    await mealPlan.save();

    res.status(201).json({
      success: true,
      message: 'Meal plan created successfully',
      plan: mealPlan
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create meal plan'
    });
  }
});

// Update meal plan (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const mealPlan = await MealPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      plan: mealPlan
    });
  } catch (error) {
    console.error('Update meal plan error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update meal plan'
    });
  }
});

// Delete meal plan (Admin only) - Soft delete
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete meal plan'
    });
  }
});

export default router;
