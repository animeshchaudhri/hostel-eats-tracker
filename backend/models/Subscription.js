import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  mealPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealPlan',
    required: [true, 'Meal plan ID is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  remainingMeals: {
    type: Number,
    required: [true, 'Remaining meals is required'],
    min: [0, 'Remaining meals cannot be negative']
  },
  totalMeals: {
    type: Number,
    required: [true, 'Total meals is required'],
    min: [1, 'Total meals must be at least 1']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ mealPlanId: 1 });
subscriptionSchema.index({ startDate: 1, endDate: 1 });
subscriptionSchema.index({ status: 1 });

// Compound index for finding active subscriptions
subscriptionSchema.index({ userId: 1, status: 1, startDate: 1, endDate: 1 });

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for subscription progress
subscriptionSchema.virtual('progress').get(function() {
  if (this.totalMeals === 0) return 0;
  const consumed = this.totalMeals - this.remainingMeals;
  return Math.round((consumed / this.totalMeals) * 100);
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
