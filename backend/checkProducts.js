import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf';

const checkProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const products = await Product.find({}, { id: 1, slug: 1, name: 1 });
    console.log(JSON.stringify(products, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
};

checkProducts();
