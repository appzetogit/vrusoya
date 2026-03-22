import mongoose from 'mongoose';

const featuredSectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Top Selling'
  title: { type: String, required: true },
  subtitle: { type: String },
  featuredTag: { type: String, default: 'Featured' },
  ctaText: { type: String, default: 'Grab Offer NOW' },
  deliveryLabel: { type: String, default: 'FRESH DELIVERY' },
  deliveryText: { type: String, default: 'FREE SHIPPING on orders above ₹499!' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('FeaturedSection', featuredSectionSchema);
