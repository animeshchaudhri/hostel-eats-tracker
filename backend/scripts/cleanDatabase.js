import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const cleanDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://animesh:NlfyCy2kbXacsuAF@cluster0.o1jeydb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Drop all collections to clean everything
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`🗑️ Dropped collection: ${collection.name}`);
    }
    
    console.log('🗑️ Dropped all collections');

    // Close connection
    await mongoose.connection.close();
    console.log('📪 Database connection closed');

    console.log('\n🎉 Database cleaned successfully!');
    console.log('You can now run seedDatabase.js to populate with fresh data.');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

// Run cleaning if this script is executed directly
cleanDatabase();

export default cleanDatabase;
