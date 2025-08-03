import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MealPlan from '../models/MealPlan.js';
import ExtraItem from '../models/ExtraItem.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedMealPlans = async () => {
  try {
    console.log('🌱 Seeding meal plans...');

    // Clear existing meal plans
    await MealPlan.deleteMany({});
    console.log('🗑️ Cleared existing meal plans');

    // Define meal plans
    const mealPlans = [
      {
        name: 'Mini Thali (Single)',
        description: 'Perfect for students who prefer either lunch or dinner',
        type: 'mini_single',
        price: 2300,
        mealsPerDay: 1,
        totalMeals: 30,
        includes: ['1 Sabji', '3 Rotis', 'Salad'],
        features: [
          '1 special meal once a week (festival meal, chicken, egg etc)',
          'Free home delivery',
          'Homely taste'
        ],
        mealTypes: ['lunch'], // Default to lunch, can be changed
        isActive: true
      },
      {
        name: 'Mini Thali (Double)',
        description: 'Great value for students who want both lunch and dinner',
        type: 'mini_double',
        price: 4600,
        mealsPerDay: 2,
        totalMeals: 60,
        includes: ['1 Sabji', '3 Rotis', 'Salad'],
        features: [
          '1 special meal once a week (festival meal, chicken, egg etc)',
          'Free home delivery',
          'Homely taste'
        ],
        mealTypes: ['lunch', 'dinner'],
        isActive: true
      },
      {
        name: 'Full Thali (Double)',
        description: 'Complete meal solution with all essentials included',
        type: 'full_double',
        price: 7600,
        mealsPerDay: 2,
        totalMeals: 60,
        includes: ['1 Sabji', '3 Rotis', 'Dal', 'Rice', 'Salad'],
        features: [
          '1 special meal once a week (festival meal, chicken, egg etc)',
          'Free home delivery',
          'Homely taste'
        ],
        mealTypes: ['lunch', 'dinner'],
        isActive: true
      }
    ];

    // Insert meal plans
    const createdPlans = await MealPlan.insertMany(mealPlans);
    console.log(`✅ Created ${createdPlans.length} meal plans`);

    return createdPlans;
  } catch (error) {
    console.error('❌ Error seeding meal plans:', error);
    throw error;
  }
};

const seedExtraItems = async () => {
  try {
    console.log('🌱 Seeding extra items...');

    // Clear existing extra items
    await ExtraItem.deleteMany({});
    console.log('🗑️ Cleared existing extra items');

    // Define extra items
    const extraItems = [
      {
        name: 'Extra Rice',
        description: 'Additional portion of steamed rice',
        price: 20,
        category: 'rice',
        unit: 'bowl',
        isActive: true
      },
      {
        name: 'Extra Dal',
        description: 'Additional portion of lentil curry',
        price: 25,
        category: 'dal',
        unit: 'bowl',
        isActive: true
      },
      {
        name: 'Extra Dal Rice',
        description: 'Combination of dal and rice',
        price: 40,
        category: 'dal_rice',
        unit: 'plate',
        isActive: true
      },
      {
        name: 'Extra Roti',
        description: 'Additional fresh wheat bread',
        price: 10,
        category: 'roti',
        unit: 'piece',
        isActive: true
      },
      {
        name: 'Special Sabji',
        description: 'Premium vegetable dish',
        price: 50,
        category: 'special',
        unit: 'bowl',
        isActive: true
      },
      {
        name: 'Extra Papad',
        description: 'Crispy papad (2 pieces)',
        price: 15,
        category: 'special',
        unit: 'serving',
        isActive: true
      },
      {
        name: 'Extra Pickle',
        description: 'Traditional homemade pickle',
        price: 10,
        category: 'special',
        unit: 'serving',
        isActive: true
      },
      {
        name: 'Extra Curd',
        description: 'Fresh yogurt',
        price: 20,
        category: 'special',
        unit: 'bowl',
        isActive: true
      }
    ];

    // Insert extra items
    const createdItems = await ExtraItem.insertMany(extraItems);
    console.log(`✅ Created ${createdItems.length} extra items`);

    return createdItems;
  } catch (error) {
    console.error('❌ Error seeding extra items:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting database seeding...');
    
    await seedMealPlans();
    await seedExtraItems();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • 3 Meal Plans created');
    console.log('   • 8 Extra Items created');
    console.log('\n💡 Meal Plans:');
    console.log('   • Mini Thali (Single): ₹2,300 - 30 meals');
    console.log('   • Mini Thali (Double): ₹4,600 - 60 meals');
    console.log('   • Full Thali (Double): ₹7,600 - 60 meals');
    console.log('\n🍽️ Extra Items available for additional orders');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly

  seedDatabase();


export { seedMealPlans, seedExtraItems, seedDatabase };
