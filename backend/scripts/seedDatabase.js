import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import MealEntry from '../models/MealEntry.js';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://animesh:NlfyCy2kbXacsuAF@cluster0.o1jeydb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MealEntry.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      roomNumber: 'ADMIN',
      loginCode: 'ADMIN123',
      isAdmin: true,
      password: 'ADMIN123_2025'
    });
    await adminUser.save();
    console.log('👑 Created admin user');

    // Create sample students
    const students = [
      {
        name: 'Animesh Chaudhri',
        roomNumber: 'A101',
        loginCode: 'ANIM001',
        isAdmin: false,
        password: 'ANIM001_2025'
      },
      {
        name: 'Rahul Sharma',
        roomNumber: 'B202',
        loginCode: 'RAHU002',
        isAdmin: false,
        password: 'RAHU002_2025'
      },
      {
        name: 'Priya Patel',
        roomNumber: 'C303',
        loginCode: 'PRIY003',
        isAdmin: false,
        password: 'PRIY003_2025'
      },
      {
        name: 'Arjun Singh',
        roomNumber: 'D404',
        loginCode: 'ARJN004',
        isAdmin: false,
        password: 'ARJN004_2025'
      },
      {
        name: 'Sneha Gupta',
        roomNumber: 'E505',
        loginCode: 'SNEH005',
        isAdmin: false,
        password: 'SNEH005_2025'
      }
    ];

    const createdStudents = [];
    for (const studentData of students) {
      const student = new User(studentData);
      await student.save();
      createdStudents.push(student);
    }
    console.log('👥 Created student users');

    // Create sample meal entries
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    const sampleMealEntries = [
      // Animesh's entries
      {
        userId: createdStudents[0]._id,
        entryDate: today,
        mealType: 'breakfast',
        dishName: 'Aloo Paratha',
        cost: 45
      },
      {
        userId: createdStudents[0]._id,
        entryDate: today,
        mealType: 'lunch',
        dishName: 'Dal Rice',
        cost: 80
      },
      {
        userId: createdStudents[0]._id,
        entryDate: yesterday,
        mealType: 'breakfast',
        dishName: 'Poha',
        cost: 35
      },
      {
        userId: createdStudents[0]._id,
        entryDate: yesterday,
        mealType: 'lunch',
        dishName: 'Rajma Rice',
        cost: 85
      },
      {
        userId: createdStudents[0]._id,
        entryDate: yesterday,
        mealType: 'dinner',
        dishName: 'Chicken Curry',
        cost: 120
      },

      // Rahul's entries
      {
        userId: createdStudents[1]._id,
        entryDate: today,
        mealType: 'breakfast',
        dishName: 'Bread Butter',
        cost: 25
      },
      {
        userId: createdStudents[1]._id,
        entryDate: today,
        mealType: 'lunch',
        dishName: 'Chole Bhature',
        cost: 95
      },
      {
        userId: createdStudents[1]._id,
        entryDate: yesterday,
        mealType: 'dinner',
        dishName: 'Fish Curry',
        cost: 110
      },

      // Priya's entries
      {
        userId: createdStudents[2]._id,
        entryDate: today,
        mealType: 'breakfast',
        dishName: 'Idli Sambar',
        cost: 40
      },
      {
        userId: createdStudents[2]._id,
        entryDate: today,
        mealType: 'lunch',
        dishName: 'Veg Biryani',
        cost: 90
      },
      {
        userId: createdStudents[2]._id,
        entryDate: yesterday,
        mealType: 'dinner',
        dishName: 'Paneer Butter Masala',
        cost: 110
      },

      // Arjun's entries
      {
        userId: createdStudents[3]._id,
        entryDate: dayBeforeYesterday,
        mealType: 'breakfast',
        dishName: 'Upma',
        cost: 30
      },
      {
        userId: createdStudents[3]._id,
        entryDate: dayBeforeYesterday,
        mealType: 'lunch',
        dishName: 'Sambar Rice',
        cost: 75
      },

      // Sneha's entries
      {
        userId: createdStudents[4]._id,
        entryDate: dayBeforeYesterday,
        mealType: 'breakfast',
        dishName: 'Dosa',
        cost: 50
      },
      {
        userId: createdStudents[4]._id,
        entryDate: dayBeforeYesterday,
        mealType: 'dinner',
        dishName: 'Mutton Curry',
        cost: 150
      }
    ];

    for (const entryData of sampleMealEntries) {
      const entry = new MealEntry(entryData);
      await entry.save();
    }
    console.log('🍽️ Created sample meal entries');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: ADMIN123');
    console.log('Students: ANIM001, RAHU002, PRIY003, ARJN004, SNEH005');

    // Close connection
    await mongoose.connection.close();
    console.log('📪 Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this script is executed directly
  seedData();


export default seedData;
