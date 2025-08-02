import mongoose from 'mongoose';

const mealEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  entryDate: {
    type: Date,
    required: [true, 'Entry date is required'],
    index: true
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: {
      values: ['breakfast', 'lunch', 'dinner'],
      message: 'Meal type must be breakfast, lunch, or dinner'
    },
    lowercase: true
  },
  dishName: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
    maxlength: [200, 'Dish name cannot exceed 200 characters']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost must be a positive number'],
    max: [10000, 'Cost cannot exceed ₹10,000']
  },
  // Additional metadata
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  // For soft deletion
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Transform _id to id for frontend compatibility
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
mealEntrySchema.index({ userId: 1, entryDate: -1 });
mealEntrySchema.index({ entryDate: -1 });
mealEntrySchema.index({ mealType: 1 });
mealEntrySchema.index({ dishName: 1 });
mealEntrySchema.index({ cost: 1 });
mealEntrySchema.index({ isActive: 1 });

// Unique constraint to prevent duplicate meals for same user on same date and meal type
mealEntrySchema.index(
  { userId: 1, entryDate: 1, mealType: 1 },
  { 
    unique: true, 
    partialFilterExpression: { isActive: true },
    name: 'unique_user_date_meal'
  }
);

// Virtual for formatted date
mealEntrySchema.virtual('formattedDate').get(function() {
  return this.entryDate.toISOString().split('T')[0];
});

// Static method to get entries for a user
mealEntrySchema.statics.getEntriesForUser = function(userId, options = {}) {
  const query = { userId, isActive: true };
  
  // Add date range filter if provided
  if (options.startDate || options.endDate) {
    query.entryDate = {};
    if (options.startDate) query.entryDate.$gte = new Date(options.startDate);
    if (options.endDate) query.entryDate.$lte = new Date(options.endDate);
  }
  
  // Add meal type filter if provided
  if (options.mealType) {
    query.mealType = options.mealType;
  }
  
  return this.find(query)
    .populate('userId', 'name roomNumber loginCode')
    .sort({ entryDate: -1, createdAt: -1 });
};

// Static method to get all entries with user details
mealEntrySchema.statics.getAllEntriesWithUsers = function(options = {}) {
  const query = { isActive: true };
  
  // Add date range filter if provided
  if (options.startDate || options.endDate) {
    query.entryDate = {};
    if (options.startDate) query.entryDate.$gte = new Date(options.startDate);
    if (options.endDate) query.entryDate.$lte = new Date(options.endDate);
  }
  
  return this.find(query)
    .populate('userId', 'name roomNumber loginCode isAdmin')
    .sort({ entryDate: -1, createdAt: -1 });
};

// Static method to get spending summary for a user
mealEntrySchema.statics.getSpendingSummary = function(userId, options = {}) {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId), isActive: true };
  
  // Add date range filter if provided
  if (options.startDate || options.endDate) {
    matchStage.entryDate = {};
    if (options.startDate) matchStage.entryDate.$gte = new Date(options.startDate);
    if (options.endDate) matchStage.entryDate.$lte = new Date(options.endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$mealType',
        totalCost: { $sum: '$cost' },
        totalMeals: { $sum: 1 },
        avgCost: { $avg: '$cost' }
      }
    },
    {
      $group: {
        _id: null,
        mealTypeBreakdown: {
          $push: {
            mealType: '$_id',
            totalCost: '$totalCost',
            totalMeals: '$totalMeals',
            avgCost: '$avgCost'
          }
        },
        overallTotal: { $sum: '$totalCost' },
        overallMeals: { $sum: '$totalMeals' }
      }
    },
    {
      $project: {
        _id: 0,
        mealTypeBreakdown: 1,
        overallTotal: 1,
        overallMeals: 1,
        overallAvg: { $divide: ['$overallTotal', '$overallMeals'] }
      }
    }
  ]);
};

// Static method to get dish frequency for a user
mealEntrySchema.statics.getDishFrequency = function(userId, options = {}) {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId), isActive: true };
  
  // Add date range filter if provided
  if (options.startDate || options.endDate) {
    matchStage.entryDate = {};
    if (options.startDate) matchStage.entryDate.$gte = new Date(options.startDate);
    if (options.endDate) matchStage.entryDate.$lte = new Date(options.endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$dishName',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' },
        avgCost: { $avg: '$cost' },
        lastOrdered: { $max: '$entryDate' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: options.limit || 20
    }
  ]);
};

const MealEntry = mongoose.model('MealEntry', mealEntrySchema);

export default MealEntry;
