import StockHistory from '../models/StockHistory.js';

export const createStockHistoryEntry = async ({
  product,
  variant = null,
  type,
  change,
  previousStock,
  newStock,
  performedBy = 'System',
  reason = '',
  referenceId = ''
}) => {
  if (!product || !type || !Number.isFinite(Number(change))) return null;

  const resolvedVariant = variant || null;

  return StockHistory.create({
    productId: String(product.id || product._id || ''),
    variantId: resolvedVariant ? String(resolvedVariant.id || resolvedVariant._id || '') : null,
    productName: resolvedVariant?.weight ? `${product.name} (${resolvedVariant.weight})` : product.name,
    sku: resolvedVariant?.sku || product.sku || resolvedVariant?.id || '',
    image: product.image || product.imageUrl || product.images?.[0] || '',
    type,
    change: Number(change),
    previousStock: Number(previousStock || 0),
    newStock: Number(newStock || 0),
    performedBy,
    reason,
    referenceId
  });
};
