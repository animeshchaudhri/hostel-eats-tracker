import express from 'express';
import Subscription from '../models/Subscription.js';
import MealPlan from '../models/MealPlan.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user's active subscriptions
router.get('/my-subscriptions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subscriptions = await Subscription.find({ 
      userId,
      status: { $in: ['active', 'pending'] }
    })
    .populate('mealPlanId')
    .sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      subscriptions
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve subscriptions'
    });
  }
});

// Get user's active subscription by user ID (Admin only)
router.get('/user/:userId/active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate('mealPlanId');
    
    res.status(200).json({
      success: true,
      message: subscription ? 'Active subscription found' : 'No active subscription',
      subscription
    });
  } catch (error) {
    console.error('Get user active subscription error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve user subscription'
    });
  }
});

// Get all subscriptions (Admin only)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, userId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name roomNumber loginCode')
      .populate('mealPlanId')
      .sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      message: 'All subscriptions retrieved successfully',
      subscriptions
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve subscriptions'
    });
  }
});

// Create new subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      userId: requestUserId,
      mealPlanId,
      startDate,
      endDate,
      amountPaid,
      notes,
      autoRenew
    } = req.body;

    // Admin can create subscription for any user, regular users can only create for themselves
    const userId = req.user.isAdmin && requestUserId ? requestUserId : req.user._id;

    // Validation
    if (!mealPlanId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Meal plan ID, start date, and end date are required'
      });
    }

    // Check if meal plan exists
    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan || !mealPlan.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Meal plan not found or inactive'
      });
    }

    // Check for overlapping active subscriptions
    const overlappingSubscription = await Subscription.findOne({
      userId,
      status: 'active',
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingSubscription) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'You already have an active subscription that overlaps with these dates'
      });
    }

    const subscription = new Subscription({
      userId,
      mealPlanId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: mealPlan.price,
      amountPaid: amountPaid || 0,
      remainingMeals: mealPlan.totalMeals,
      totalMeals: mealPlan.totalMeals,
      notes,
      autoRenew: autoRenew || false
    });

    await subscription.save();

    // Populate the subscription before returning
    await subscription.populate('mealPlanId');

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create subscription'
    });
  }
});

// Update subscription (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name roomNumber loginCode')
    .populate('mealPlanId');

    if (!subscription) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update subscription'
    });
  }
});

// Cancel subscription
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const subscription = await Subscription.findOne({
      _id: id,
      userId // Ensure user can only cancel their own subscription
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Subscription not found'
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Subscription is already cancelled'
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to cancel subscription'
    });
  }
});

// Update payment status (Admin only)
router.patch('/:id/payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid } = req.body;

    if (typeof amountPaid !== 'number' || amountPaid < 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Amount paid must be a positive number'
      });
    }

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { amountPaid },
      { new: true, runValidators: true }
    )
    .populate('userId', 'name roomNumber loginCode')
    .populate('mealPlanId');

    if (!subscription) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update payment'
    });
  }
});

// Get subscription statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const pendingSubscriptions = await Subscription.countDocuments({ status: 'pending' });
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
    
    const totalRevenue = await Subscription.aggregate([
      { $match: { status: { $in: ['active', 'expired'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const pendingRevenue = await Subscription.aggregate([
      { $match: { status: { $in: ['active', 'pending'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Subscription statistics retrieved successfully',
      stats: {
        totalSubscriptions,
        activeSubscriptions,
        pendingSubscriptions,
        expiredSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve subscription statistics'
    });
  }
});

export default router;
