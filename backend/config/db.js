const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property_db12';
    console.log('Connecting to MongoDB URI:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Handle MongoDB events for security monitoring
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };