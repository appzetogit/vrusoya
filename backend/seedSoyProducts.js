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

const buildVariant = ({ id, quantity, unit, price, stock = 100 }) => ({
  id,
  quantity: String(quantity),
  unit,
  weight: `${quantity}${unit}`,
  mrp: Number(price),
  price: Number(price),
  stock,
  unitPrice: ''
});

const soyProducts = [
  {
    id: 'soy-curd',
    slug: 'soya-curd',
    brand: 'VRUSHAHI',
    name: 'Soya Curd',
    category: 'curd',
    subcategory: '',
    description: 'Fresh soya curd with multiple pack sizes.',
    rating: 4.5,
    reviews: 0,
    tag: 'FRESH',
    image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=1200&q=80'
    ],
    variants: [
      buildVariant({ id: 'soy-curd-v1', quantity: '200', unit: 'grms', price: 20 }),
      buildVariant({ id: 'soy-curd-v2', quantity: '1', unit: 'kg', price: 100 })
    ],
    stock: { quantity: 200 },
    inStock: true
  },
  {
    id: 'soy-milk',
    slug: 'soya-milk',
    brand: 'VRUSHAHI',
    name: 'Soya Milk',
    category: 'milk',
    subcategory: 'milk-product',
    description: 'Plant-based soya milk.',
    rating: 4.5,
    reviews: 0,
    tag: 'DAIRY FREE',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=80'
    ],
    variants: [
      buildVariant({ id: 'soy-milk-v1', quantity: '1', unit: 'ltr', price: 60 })
    ],
    stock: { quantity: 100 },
    inStock: true
  },
  {
    id: 'soy-paneer',
    slug: 'soya-paneer',
    brand: 'VRUSHAHI',
    name: 'Soya Paneer',
    category: 'paneer',
    subcategory: 'paneer',
    description: 'Fresh soya paneer available in multiple pack sizes.',
    rating: 4.6,
    reviews: 0,
    tag: 'HIGH PROTEIN',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80'
    ],
    variants: [
      buildVariant({ id: 'soy-paneer-v1', quantity: '250', unit: 'grms', price: 70 }),
      buildVariant({ id: 'soy-paneer-v2', quantity: '500', unit: 'grms', price: 140 }),
      buildVariant({ id: 'soy-paneer-v3', quantity: '1', unit: 'kg', price: 280 })
    ],
    stock: { quantity: 300 },
    inStock: true
  },
  {
    id: 'soy-buttermilk',
    slug: 'soya-buttermilk',
    brand: 'VRUSHAHI',
    name: 'Soya Buttermilk',
    category: 'butter-milk',
    subcategory: 'milk-product',
    description: 'Refreshing soya buttermilk.',
    rating: 4.4,
    reviews: 0,
    tag: 'REFRESHING',
    image: 'https://images.unsplash.com/photo-1553787499-6f913324e0a5?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1553787499-6f913324e0a5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1553787499-6f913324e0a5?auto=format&fit=crop&w=1200&q=80'
    ],
    variants: [
      buildVariant({ id: 'soy-buttermilk-v1', quantity: '500', unit: 'ml', price: 20 }),
      buildVariant({ id: 'soy-buttermilk-v2', quantity: '1', unit: 'ltr', price: 40 })
    ],
    stock: { quantity: 200 },
    inStock: true
  },
  {
    id: 'soy-lassi',
    slug: 'soya-lassi',
    brand: 'VRUSHAHI',
    name: 'Soya Lassi',
    category: 'beverages',
    subcategory: 'milk-product',
    description: 'Ready-to-drink soya lassi.',
    rating: 4.4,
    reviews: 0,
    tag: 'READY TO DRINK',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80'
    ],
    variants: [
      buildVariant({ id: 'soy-lassi-v1', quantity: '200', unit: 'ml', price: 20 })
    ],
    stock: { quantity: 100 },
    inStock: true
  },
  {
    id: 'flavered-milk',
    slug: 'flavered-milk',
    brand: 'VRUSHAHI',
    name: 'Flavered Milk',
    category: 'beverages',
    subcategory: 'milk-product',
    description: 'Flavered milk ready-to-drink pack.',
    rating: 4.3,
    reviews: 0,
    tag: 'READY TO DRINK',
    image: 'https://images.unsplash.com/photo-1517448931760-9bf4414148c5?auto=format&fit=crop&w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517448931760-9bf4414148c5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1517448931760-9bf4414148c5?auto=format&fit=crop&w=1200&q=80'
    ],
    variants: [
      buildVariant({ id: 'flavered-milk-v1', quantity: '200', unit: 'ml', price: 65 })
    ],
    stock: { quantity: 100 },
    inStock: true
  }
];

const seedSoyProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for product seeding');

    for (const product of soyProducts) {
      await Product.updateOne(
        { id: product.id },
        { $set: product },
        { upsert: true }
      );
    }

    const savedProducts = await Product.find({
      id: { $in: soyProducts.map((product) => product.id) }
    }).sort({ createdAt: -1, _id: -1 });

    const productIds = savedProducts.map((product) => product._id);
    const topSellingIds = [...savedProducts]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 6)
      .map((product) => product._id);
    const dealIds = [...savedProducts]
      .sort((a, b) => {
        const aPrice = Number(a?.variants?.[0]?.price || a?.price || 0);
        const bPrice = Number(b?.variants?.[0]?.price || b?.price || 0);
        return aPrice - bPrice;
      })
      .slice(0, 6)
      .map((product) => product._id);

    const featuredSections = [
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
        products: productIds.slice(0, 5),
        isActive: true,
        order: 2
      },
      {
        name: 'new-products',
        title: 'New Products',
        subtitle: 'NP_META::{"subtitle":"Newly added picks for your everyday needs","featuredTag":"New Launch","ctaText":"Explore","deliveryLabel":"","deliveryText":""}',
        products: productIds,
        isActive: true,
        order: 3
      }
    ];

    for (const section of featuredSections) {
      await FeaturedSection.findOneAndUpdate(
        { name: section.name },
        { $set: section },
        { upsert: true, new: true }
      );
    }

    console.log(`Products upserted: ${soyProducts.length}`);
    console.log('Homepage featured sections refreshed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Product seeding failed:', error);
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors during shutdown.
    }
    process.exit(1);
  }
};

seedSoyProducts();

