import FeaturedSection from '../models/FeaturedSection.js';

export const getFeaturedSections = async (req, res) => {
  try {
    const sections = await FeaturedSection.find({}).populate('products').sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedSectionByName = async (req, res) => {
  try {
    const requestedName = String(req.params.name || '').trim().toLowerCase();
    let section = await FeaturedSection.findOne({ name: requestedName }).populate('products');

    // Ensure critical homepage sections exist even on fresh/partial DBs.
    if (!section && (requestedName === 'top-selling' || requestedName === 'today-top-deal' || requestedName === 'special-offers' || requestedName === 'new-products')) {
      const defaults =
        requestedName === 'top-selling'
          ? {
              name: 'top-selling',
              title: 'Top Selling Products',
              products: [],
              isActive: true,
              order: 0
            }
          : requestedName === 'today-top-deal'
            ? {
                name: 'today-top-deal',
                title: 'Today Top Deal',
                products: [],
                isActive: true,
                order: 1
              }
            : requestedName === 'special-offers'
              ? {
                name: 'special-offers',
                title: 'Special Offers',
                subtitle: 'Premium handpicked collections for your daily needs.',
                featuredTag: 'Featured',
                ctaText: 'Grab Offer NOW',
                deliveryLabel: 'FRESH DELIVERY',
                deliveryText: 'FREE SHIPPING on orders above ₹499!',
                products: [],
                isActive: true,
                order: 2
              }
              : {
                name: 'new-products',
                title: 'New Products',
                subtitle: 'Newly added picks for your everyday needs',
                featuredTag: 'New Launch',
                ctaText: 'Explore',
                deliveryLabel: '',
                deliveryText: '',
                products: [],
                isActive: true,
                order: 3
              };

      section = await FeaturedSection.create(defaults);
      section = await FeaturedSection.findById(section._id).populate('products');
    }

    if (section) {
      res.json(section);
    } else {
      res.status(404).json({ message: 'Section not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFeaturedSection = async (req, res) => {
  try {
    const section = await FeaturedSection.create(req.body);
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateFeaturedSection = async (req, res) => {
  try {
    const section = await FeaturedSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFeaturedSection = async (req, res) => {
  try {
    await FeaturedSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
