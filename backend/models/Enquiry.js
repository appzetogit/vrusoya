import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-z\s]+$/, 'Name should contain only letters and spaces']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[0-9\s\-()]{10,15}$/, 'Please enter a valid phone number']
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
