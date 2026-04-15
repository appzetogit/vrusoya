import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [/^[^\d]+$/, 'Name should not contain numbers']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.com$/i, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  company: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  source: { type: String, default: 'contact-us' },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'resolved'],
    default: 'new'
  }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);

