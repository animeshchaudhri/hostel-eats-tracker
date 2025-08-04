import { body, param, query, validationResult } from 'express-validator';

// Utility function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserCreate = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('roomNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  
  body('loginCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Login code must be between 3 and 20 characters')
    .isAlphanumeric()
    .withMessage('Login code must contain only letters and numbers'),
  
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
  
  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  
  body('loginCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Login code must be between 3 and 20 characters')
    .isAlphanumeric()
    .withMessage('Login code must contain only letters and numbers'),
  
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('loginCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Login code must be between 3 and 20 characters')
    .isAlphanumeric()
    .withMessage('Login code must contain only letters and numbers'),
  
  handleValidationErrors
];

// Meal entry validation rules
export const validateMealEntryCreate = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  body('entryDate')
    .isISO8601()
    .withMessage('Entry date must be a valid date (YYYY-MM-DD format)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (date > today) {
        throw new Error('Entry date cannot be in the future');
      }
      
      if (date < oneYearAgo) {
        throw new Error('Entry date cannot be more than one year ago');
      }
      
      return true;
    }),
  
  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner'])
    .withMessage('Meal type must be breakfast, lunch, or dinner'),
  
  body('dishName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Dish name must be between 1 and 200 characters'),
  
  body('cost')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Cost must be between 0 and 10000'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

export const validateMealEntryUpdate = [
  body('entryDate')
    .optional()
    .isISO8601()
    .withMessage('Entry date must be a valid date (YYYY-MM-DD format)')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        if (date > today) {
          throw new Error('Entry date cannot be in the future');
        }
        
        if (date < oneYearAgo) {
          throw new Error('Entry date cannot be more than one year ago');
        }
      }
      return true;
    }),
  
  body('mealType')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner'])
    .withMessage('Meal type must be breakfast, lunch, or dinner'),
  
  body('dishName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Dish name must be between 1 and 200 characters'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Cost must be between 0 and 10000'),
  
  body('totalCost')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Total cost must be between 0 and 10000'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

export const validateUserIdParam = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  handleValidationErrors
];

// Query validation
export const validateDateRangeQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD format)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD format)')
    .custom((endDate, { req }) => {
      if (endDate && req.query.startDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        
        if (end < start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  query('mealType')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner'])
    .withMessage('Meal type must be breakfast, lunch, or dinner'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  handleValidationErrors
];
