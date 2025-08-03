import express from 'express';
import ExtraItem from '../models/ExtraItem.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all extra items (public - for ordering)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const extraItems = await ExtraItem.find(query).sort({ category: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      message: 'Extra items retrieved successfully',
      items: extraItems
    });
  } catch (error) {
    console.error('Get extra items error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve extra items'
    });
  }
});

// Get extra item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const extraItem = await ExtraItem.findById(id);
    
    if (!extraItem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Extra item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Extra item retrieved successfully',
      item: extraItem
    });
  } catch (error) {
    console.error('Get extra item error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve extra item'
    });
  }
});

// Create new extra item (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      unit
    } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, price, and category are required'
      });
    }

    const extraItem = new ExtraItem({
      name,
      description,
      price,
      category,
      unit: unit || 'piece'
    });

    await extraItem.save();

    res.status(201).json({
      success: true,
      message: 'Extra item created successfully',
      item: extraItem
    });
  } catch (error) {
    console.error('Create extra item error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create extra item'
    });
  }
});

// Update extra item (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const extraItem = await ExtraItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!extraItem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Extra item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Extra item updated successfully',
      item: extraItem
    });
  } catch (error) {
    console.error('Update extra item error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update extra item'
    });
  }
});

// Delete extra item (Admin only) - Soft delete
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const extraItem = await ExtraItem.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!extraItem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Extra item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Extra item deleted successfully'
    });
  } catch (error) {
    console.error('Delete extra item error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete extra item'
    });
  }
});

export default router;
