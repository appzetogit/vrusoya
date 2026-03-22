import Enquiry from '../models/Enquiry.js';

export const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = String(phone || '').trim();
    const normalizedCompany = String(company || '').trim();

    if (!normalizedName || !normalizedEmail || !normalizedPhone || !normalizedCompany || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!/^[A-Za-z\s]+$/.test(normalizedName)) {
      return res.status(400).json({ message: 'Name should contain only letters and spaces.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!/^\+?[0-9\s\-()]{10,15}$/.test(normalizedPhone)) {
      return res.status(400).json({ message: 'Please enter a valid phone number.' });
    }

    const enquiry = await Enquiry.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      company: normalizedCompany,
      message
    });

    res.status(201).json(enquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEnquiries = async (_req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
