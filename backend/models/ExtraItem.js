import mongoose from 'mongoose';

const extraItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Item category is required'],
    enum: ['rice', 'dal', 'roti', 'dal_rice', 'special'],
    default: 'special'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unit: {
    type: String,
    default: 'piece',
    trim: true
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
extraItemSchema.index({ category: 1, isActive: 1 });
extraItemSchema.index({ name: 1 });

const ExtraItem = mongoose.model('ExtraItem', extraItemSchema);

export default ExtraItem;
