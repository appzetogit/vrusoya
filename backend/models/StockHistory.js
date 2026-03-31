import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  variantId: { type: String, default: null },
  productName: { type: String, required: true },
  sku: { type: String, default: '' },
  image: { type: String, default: '' },
  type: { type: String, enum: ['adjustment', 'order', 'restock'], required: true },
  change: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  performedBy: { type: String, default: 'System' },
  reason: { type: String, default: '' },
  referenceId: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('StockHistory', stockHistorySchema);
