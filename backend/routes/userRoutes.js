import express from 'express';
import { 
    getUsers, registerUser, loginUser, logoutUser, 
    getUserProfile, updateUserProfile, toggleBanUser, 
    getUserById, updateFcmToken, sendOtpForLogin, verifyOtpForLogin 
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const sendMethodNotAllowed = (req, res) => {
    res.set('Allow', 'PUT');
    res.status(405).json({
        message: 'Method not allowed. Use PUT /api/users/fcm-token with authentication and a { token, platform } payload.'
    });
};

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// New OTP Flow
router.post('/send-otp-login', sendOtpForLogin);
router.post('/verify-otp-login', verifyOtpForLogin);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.route('/fcm-token')
    .put(protect, updateFcmToken)
    .all(sendMethodNotAllowed);
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id/ban', protect, admin, toggleBanUser);

export default router;
