import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for admin seeding');

    const email = 'vrushahi@gmail.com';
    const password = 'sumeet@2626';
    const name = 'Vrushahi Admin';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Admin.updateOne(
      { email },
      { 
        $set: { 
          email, 
          password: hashedPassword, 
          name 
        } 
      },
      { upsert: true }
    );

    console.log('Admin user seeded/updated successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Admin seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
