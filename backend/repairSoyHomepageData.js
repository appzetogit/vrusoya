import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';
import FeaturedSection from './models/FeaturedSection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vrushahi';

const productMappings = {
  'soy-curd': { category: 'curd', subcategory: '' },
  'soy-milk': { category: 'milk', subcategory: 'milk-product' },
  'soy-paneer': { category: 'paneer', subcategory: 'paneer' },
  'soy-buttermilk': { category: 'butter-milk', subcategory: 'milk-product' },
  'soy-lassi': { category: 'beverages', subcategory: 'milk-product' },
  'flavered-milk': { category: 'beverages', subcategory: 'milk-product' }
};

const pickVariantPrice = (product) => Number(product?.variants?.[0]?.price || product?.price || 0);

const repair = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for repair');

    const productIds = Object.keys(productMappings);

    for (const [id, mapping] of Object.entries(productMappings)) {
      await Product.updateOne({ id }, { $set: mapping });
    }

    const products = await Product.find({ id: { $in: productIds } }).sort({ createdAt: -1, _id: -1 });

    if (products.length === 0) {
      throw new Error('No soy products found to repair');
    }

    const allIds = products.map((product) => product._id);
    const topSellingIds = [...products]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 6)
      .map((product) => product._id);
    const dealIds = [...products]
      .sort((a, b) => pickVariantPrice(a) - pickVariantPrice(b))
      .slice(0, 6)
      .map((product) => product._id);

    const sectionUpdates = [
      {
        name: 'top-selling',
        title: 'Top Selling Products',
        products: topSellingIds,
        isActive: true,
        order: 0
      },
      {
        name: 'today-top-deal',
        title: 'Deal of the Day',
        products: dealIds,
        isActive: true,
        order: 1
      },
      {
        name: 'special-offers',
        title: 'Special Offers',
        subtitle: 'SO_META::{"subtitle":"Premium handpicked collections for your daily needs.","featuredTag":"Featured","ctaText":"Grab Offer NOW","deliveryLabel":"FRESH DELIVERY","deliveryText":"FREE SHIPPING on orders above ₹599!"}',
        products: allIds.slice(0, 5),
        isActive: true,
        order: 2
      },
      {
        name: 'new-products',
        title: 'New Products',
        subtitle: 'NP_META::{"subtitle":"Newly added picks for your everyday needs","featuredTag":"New Launch","ctaText":"Explore","deliveryLabel":"","deliveryText":""}',
        products: allIds,
        isActive: true,
        order: 3
      }
    ];

    for (const section of sectionUpdates) {
      await FeaturedSection.findOneAndUpdate(
        { name: section.name },
        { $set: section },
        { upsert: true }
      );
    }

    console.log(`Repaired ${products.length} products and ${sectionUpdates.length} featured sections`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Repair failed:', error);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect failure during shutdown
    }
    process.exit(1);
  }
};

repair();

