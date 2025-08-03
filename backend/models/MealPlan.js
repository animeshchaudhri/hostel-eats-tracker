import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    trim: true,
    maxlength: [500, 'Plan description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Plan type is required'],
    enum: ['mini_single', 'mini_double', 'full_double'],
    default: 'mini_single'
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Price cannot be negative']
  },
  mealsPerDay: {
    type: Number,
    required: [true, 'Meals per day is required'],
    min: [1, 'At least 1 meal per day required'],
    max: [3, 'Maximum 3 meals per day']
  },
  totalMeals: {
    type: Number,
    required: [true, 'Total meals is required'],
    min: [1, 'At least 1 total meal required']
  },
  includes: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  mealTypes: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  }]
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
mealPlanSchema.index({ type: 1, isActive: 1 });
mealPlanSchema.index({ price: 1 });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
