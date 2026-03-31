import express from 'express';
import { getStockHistory } from '../controllers/stockHistoryController.js';

const router = express.Router();

router.get('/', getStockHistory);

export default router;
