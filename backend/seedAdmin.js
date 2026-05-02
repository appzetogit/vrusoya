import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vrushahi';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for admin seeding');

    const email = 'vrusoya@gmail.com';
    const password = 'vrusoya@123';
    const name = 'Vrusoya Admin';

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

