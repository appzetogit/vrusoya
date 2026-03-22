import express from 'express';
import { createEnquiry, getEnquiries, updateEnquiryStatus } from '../controllers/enquiryController.js';

const router = express.Router();

router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.put('/:id', updateEnquiryStatus);

export default router;
