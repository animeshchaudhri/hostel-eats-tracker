import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
    maxlength: [20, 'Room number cannot exceed 20 characters']
  },
  loginCode: {
    type: String,
    required: [true, 'Login code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Login code must be at least 3 characters'],
    maxlength: [20, 'Login code cannot exceed 20 characters']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Store hashed password for security (based on login code)
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Transform _id to id for frontend compatibility
      ret.id = ret._id;
      delete ret._id;
      // Remove sensitive fields from JSON output
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries (loginCode already has unique index)
userSchema.index({ roomNumber: 1 });
userSchema.index({ isAdmin: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by login code
userSchema.statics.findByLoginCode = function(loginCode) {
  return this.findOne({ loginCode: loginCode.toUpperCase(), isActive: true });
};

// Static method to get all active users
userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to get all students (non-admin users)
userSchema.statics.getStudents = function() {
  return this.find({ isAdmin: false, isActive: true }).sort({ name: 1 });
};

// Static method to get all admins
userSchema.statics.getAdmins = function() {
  return this.find({ isAdmin: true, isActive: true }).sort({ name: 1 });
};

const User = mongoose.model('User', userSchema);

export default User;
