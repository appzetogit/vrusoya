import Settings from '../models/Settings.js';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const FSSAI_REGEX = /^\d{14}$/;

// @desc    Get setting by key
// @route   GET /api/settings/:key
// @access  Public
export const getSetting = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (setting) {
      res.json(setting);
    } else {
      // Return default if not found
      res.json({ key: req.params.key, value: '' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update or create setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
export const updateSetting = async (req, res) => {
  const { value } = req.body;
  try {
    if (req.params.key === 'invoice_settings') {
      const normalizedValue = {
        sellerName: String(value?.sellerName || '').trim(),
        sellerAddress: String(value?.sellerAddress || '').trim(),
        companyOfficeAddress: String(value?.companyOfficeAddress || '').trim(),
        gstNumber: String(value?.gstNumber || '').trim().toUpperCase(),
        panNumber: String(value?.panNumber || '').trim().toUpperCase(),
        fssai: String(value?.fssai || '').trim()
      };

      if (
        !normalizedValue.sellerName ||
        !normalizedValue.sellerAddress ||
        !normalizedValue.companyOfficeAddress ||
        !normalizedValue.gstNumber ||
        !normalizedValue.panNumber ||
        !normalizedValue.fssai
      ) {
        return res.status(400).json({ message: 'All invoice settings fields are required.' });
      }

      if (!GSTIN_REGEX.test(normalizedValue.gstNumber)) {
        return res.status(400).json({ message: 'Please enter a valid GSTIN number.' });
      }

      if (!PAN_REGEX.test(normalizedValue.panNumber)) {
        return res.status(400).json({ message: 'Please enter a valid PAN number.' });
      }

      if (!FSSAI_REGEX.test(normalizedValue.fssai)) {
        return res.status(400).json({ message: 'FSSAI number must be exactly 14 digits.' });
      }

      req.body.value = normalizedValue;
    }

    let setting = await Settings.findOne({ key: req.params.key });
    if (setting) {
      setting.value = req.body.value;
      await setting.save();
    } else {
      setting = await Settings.create({ key: req.params.key, value: req.body.value });
    }
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
