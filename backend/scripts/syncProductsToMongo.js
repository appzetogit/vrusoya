import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const sourceUri = process.env.MONGO_URI;
const targetUri = process.env.TARGET_MONGO_URI;

if (!sourceUri) {
  console.error('Missing MONGO_URI in environment.');
  process.exit(1);
}

if (!targetUri) {
  console.error('Missing TARGET_MONGO_URI in environment.');
  process.exit(1);
}

const run = async () => {
  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  const targetConn = await mongoose.createConnection(targetUri).asPromise();

  try {
    const SourceProduct = sourceConn.model(Product.modelName, Product.schema, Product.collection.name);
    const TargetProduct = targetConn.model(Product.modelName, Product.schema, Product.collection.name);

    const sourceProducts = await SourceProduct.find({}).lean();

    if (sourceProducts.length === 0) {
      console.log('No products found in source database.');
      return;
    }

    const operations = sourceProducts.map((doc) => {
      const filter = doc.id ? { id: doc.id } : { _id: doc._id };
      return {
        replaceOne: {
          filter,
          replacement: doc,
          upsert: true
        }
      };
    });

    const result = await TargetProduct.bulkWrite(operations, { ordered: false });
    const targetCount = await TargetProduct.countDocuments({});

    console.log(`Source products: ${sourceProducts.length}`);
    console.log(`Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);
    console.log(`Target total products: ${targetCount}`);
  } finally {
    await sourceConn.close();
    await targetConn.close();
  }
};

run()
  .then(() => {
    console.log('Product sync complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Product sync failed:', err.message);
    process.exit(1);
  });
