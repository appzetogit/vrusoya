import SubCategory from '../models/SubCategory.js';

import Product from '../models/Product.js';

// Get all sub-categories
export const getSubCategories = async (req, res) => {
    try {
        const subs = await SubCategory.find();

        // Get product counts
        const subsWithCounts = await Promise.all(subs.map(async (sub) => {
            const count = await Product.countDocuments({ subcategory: sub.slug });
            return {
                ...sub.toObject(),
                productCount: count
            };
        }));

        res.json(subsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new sub-category
export const createSubCategory = async (req, res) => {
    try {
        const {
            name,
            slug,
            status,
            showInNavbar,
            showInShopByCategory,
            parent,
            image,
            description
        } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const finalSlug = String(slug || name)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-');

        const newSub = new SubCategory({
            name: String(name).trim(),
            slug: finalSlug,
            status: status || 'Active',
            showInNavbar: showInNavbar !== undefined ? showInNavbar : true,
            showInShopByCategory: showInShopByCategory !== undefined ? showInShopByCategory : true,
            parent: parent || null,
            image,
            description
        });

        await newSub.save();
        res.status(201).json(newSub);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Slug already exists. Please use a different name/slug.' });
        }
        res.status(400).json({ message: error.message || 'Failed to create category' });
    }
};

// Update sub-category
export const updateSubCategory = async (req, res) => {
    try {
        const {
            name,
            slug,
            status,
            showInNavbar,
            showInShopByCategory,
            parent,
            image,
            description
        } = req.body;
        const sub = await SubCategory.findById(req.params.id);

        if (sub) {
            if (name !== undefined) sub.name = String(name).trim() || sub.name;
            if (slug !== undefined) {
                sub.slug = String(slug).toLowerCase().trim().replace(/\s+/g, '-');
            }
            if (status) sub.status = status;
            if (showInNavbar !== undefined) sub.showInNavbar = showInNavbar;
            if (showInShopByCategory !== undefined) sub.showInShopByCategory = showInShopByCategory;
            if (parent !== undefined) sub.parent = parent || null;
            if (image !== undefined) sub.image = image;
            if (description !== undefined) sub.description = description;

            const updatedSub = await sub.save();
            res.json(updatedSub);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Slug already exists. Please use a different name/slug.' });
        }
        res.status(400).json({ message: error.message || 'Failed to update category' });
    }
};

// Delete sub-category
export const deleteSubCategory = async (req, res) => {
    try {
        const sub = await SubCategory.findById(req.params.id);
        if (sub) {
            await sub.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
