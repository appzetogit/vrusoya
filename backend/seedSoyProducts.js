import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlyf';

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
    category: '',
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
    category: '',
    subcategory: '',
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
    category: '',
    subcategory: '',
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
    category: '',
    subcategory: '',
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
    category: '',
    subcategory: '',
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
    category: '',
    subcategory: '',
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

    console.log(`Products upserted: ${soyProducts.length}`);
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
