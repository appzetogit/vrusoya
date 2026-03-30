import TrustSignal from '../models/TrustSignal.js';

const DEFAULT_TRUST_SIGNALS = [
  { icon: 'Truck', topText: 'FREE SHIPPING', bottomText: 'On orders above Rs 1499', order: 0, isActive: true },
  { icon: 'Wallet', topText: 'SECURE PAYMENT', bottomText: '100% safe transactions', order: 1, isActive: true },
  { icon: 'ShieldCheck', topText: 'PREMIUM QUALITY', bottomText: 'Sourced from best farms', order: 2, isActive: true },
  { icon: 'Trophy', topText: 'BEST PRICES', bottomText: 'Unmatched value', order: 3, isActive: true }
];

const ensureDefaultTrustSignals = async () => {
  const existingSignals = await TrustSignal.find({}).sort({ order: 1 });

  if (existingSignals.length > 0) {
    return existingSignals;
  }

  await TrustSignal.insertMany(DEFAULT_TRUST_SIGNALS);
  return TrustSignal.find({}).sort({ order: 1 });
};

export const getTrustSignals = async (req, res) => {
  try {
    const signals = await ensureDefaultTrustSignals();
    res.json(signals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrustSignal = async (req, res) => {
  try {
    const signal = await TrustSignal.create(req.body);
    res.status(201).json(signal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTrustSignal = async (req, res) => {
  try {
    const signal = await TrustSignal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(signal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTrustSignal = async (req, res) => {
  try {
    await TrustSignal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trust signal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
