import StockHistory from '../models/StockHistory.js';

export const getStockHistory = async (req, res) => {
  try {
    const type = String(req.query.type || 'all').trim().toLowerCase();
    const search = String(req.query.search || '').trim();

    const query = {};

    if (type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { performedBy: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }

    const history = await StockHistory.find(query).sort({ createdAt: -1, _id: -1 }).lean();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
