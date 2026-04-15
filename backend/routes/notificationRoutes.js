import express from 'express';
import { sendNotification, getNotificationHistory, getPublicNotificationFeed, deleteNotification } from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes for sending notifications
router.post('/send', protect, admin, sendNotification);
router.get('/history', protect, admin, getNotificationHistory);
router.delete('/:id', protect, admin, deleteNotification);
router.get('/public', getPublicNotificationFeed);

export default router;
