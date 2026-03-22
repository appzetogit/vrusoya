import almondImg from '../assets/logo.png';
import cashewImg from '../assets/logo.png';
import datesImg from '../assets/logo.png';
import anjeerImg from '../assets/logo.png';
import walnutImg from '../assets/logo.png';
import dailyPackImg from '../assets/logo.png';

export const SKUS = [
    { id: 'sku_1', name: 'California Almonds', unit: 'kg', price: 900, category: 'Nuts' },
    { id: 'sku_2', name: 'Cashew W320', unit: 'kg', price: 1100, category: 'Nuts' },
    { id: 'sku_3', name: 'Pistachios Roasted', unit: 'kg', price: 1400, category: 'Nuts' },
    { id: 'sku_4', name: 'Walnuts Kernels', unit: 'kg', price: 1300, category: 'Nuts' },
    { id: 'sku_5', name: 'Raisins Indian', unit: 'kg', price: 400, category: 'Berries' },
    { id: 'sku_6', name: 'Dried Cranberries', unit: 'kg', price: 950, category: 'Berries' },
    { id: 'sku_7', name: 'Chia Seeds', unit: 'kg', price: 600, category: 'Seeds' },
    { id: 'sku_8', name: 'Pumpkin Seeds', unit: 'kg', price: 700, category: 'Seeds' },
];

export const PACKS = [
    {
        id: '1',
        brand: 'FARMLYF ANMOL',
        name: 'Farmlyf Anmol Jumbo Size Sonora Almonds 500gm',
        category: 'nuts',
        subcategory: 'Almonds',
        mrp: 929,
        price: 782,
        unitPrice: '156.4/100g',
        rating: 4.9,
        tag: 'PREMIUM',
        discount: '15%off',
        image: almondImg,
        description: 'Experience the crunch of premium quality Sonora Almonds. Handpicked for size and quality, these almonds are perfect for snacking or gifting. Rich in protein, healthy fats, and antioxidants.'
    },
    {
        id: '2',
        brand: 'FARMLYF PREMIUM',
        name: 'Farmlyf Jumbo Roasted Royale Cashews 500g',
        category: 'nuts',
        subcategory: 'Cashews',
        mrp: 1200,
        price: 980,
        unitPrice: '196/100g',
        rating: 4.8,
        tag: 'BESTSELLER',
        discount: '18%off',
        image: cashewImg,
        description: 'Indulge in the buttery taste of our Jumbo Roasted Royale Cashews. Perfectly roasted to golden perfection, they serve as an excellent party snack or a healthy treat.'
    },
    {
        id: '3',
        brand: 'FARMLYF CLASSIC',
        name: 'Farmlyf Premium Walnuts (Akhrot) 250g',
        category: 'nuts',
        subcategory: 'Walnuts (Akhrot)',
        mrp: 450,
        price: 399,
        unitPrice: '159.6/100g',
        rating: 4.7,
        tag: 'FRESH',
        discount: '11%off',
        image: walnutImg,
        description: 'Our Premium Walnuts (Akhrot) are essential for brain health. Sourced from the finest orchards, they offer a rich, nutty flavor and are packed with Omega-3 fatty acids.'
    },
    {
        id: '4',
        brand: 'FARMLYF PREMIUM',
        name: 'Farmlyf Medjool Dates Large (Imported) 500g',
        category: 'dried-fruits',
        subcategory: 'Dates',
        mrp: 1800,
        price: 1450,
        unitPrice: '290/100g',
        rating: 4.9,
        tag: 'PREMIUM',
        discount: '19%off',
        image: datesImg,
        description: 'Taste the luxury with our Imported Large Medjool Dates. Known for their natural sweetness and soft texture, they are a perfect energy booster and distinctively delicious.'
    },
    {
        id: '5',
        brand: 'FARMLYF ANMOL',
        name: 'Farmlyf Premium Dried Figs (Anjeer) 250g',
        category: 'dried-fruits',
        subcategory: 'Dried Figs (Anjeer)',
        mrp: 650,
        price: 549,
        unitPrice: '219.6/100g',
        rating: 4.8,
        tag: 'HIGH FIBER',
        discount: '15%off',
        image: anjeerImg,
        description: 'Enjoy the chewy goodness of Farmlyf Premium Dried Figs. High in fiber and essential minerals, these figs are a healthy addition to your diet, supporting digestion and heart health.'
    }
];

export const PRODUCTS = [
    {
        id: 'p1',
        brand: 'FARMLYF ANMOL',
        name: 'Farmlyf Anmol Jumbo Size Sonora Almonds',
        category: 'nuts',
        subcategory: 'Almonds',
        rating: 4.9,
        tag: 'PREMIUM',
        image: almondImg,
        description: 'Experience the crunch of premium quality Sonora Almonds. Handpicked for size and quality, these almonds are perfect for snacking or gifting. Rich in protein, healthy fats, and antioxidants.',
        benefits: ['Heart-Healthy', 'Rich in Vitamin E', 'Supports Brain Health', 'Gluten Free'],
        specifications: [
            { label: 'Origin', value: 'California, USA' },
            { label: 'Shelf Life', value: '6 Months' },
            { label: 'Ingredients', value: 'Raw Almonds' }
        ],
        faqs: [
            { q: 'Are these roasted?', a: 'No, these are raw jumbo almonds.' },
            { q: 'How to store?', a: 'Keep in an airtight container in a cool place.' }
        ],
        nutrition: { energy: '579 Kcal', protein: '21g', fat: '50g', carbs: '22g' },
        variants: [
            { id: 'p1-v1', weight: '250g', mrp: 480, price: 399, discount: '17%off', unitPrice: '159.6/100g', stock: 5 },
            { id: 'p1-v2', weight: '500g', mrp: 929, price: 782, discount: '15%off', unitPrice: '156.4/100g', stock: 25 },
            { id: 'p1-v3', weight: '1kg', mrp: 1800, price: 1499, discount: '17%off', unitPrice: '149.9/100g', stock: 50 }
        ]
    },
    {
        id: 'p2',
        brand: 'FARMLYF PREMIUM',
        name: 'Farmlyf Jumbo Roasted Royale Cashews',
        category: 'nuts',
        subcategory: 'Cashews',
        rating: 4.8,
        tag: 'BESTSELLER',
        image: cashewImg,
        description: 'Indulge in the buttery taste of our Jumbo Roasted Royale Cashews. Perfectly roasted to golden perfection, they serve as an excellent party snack or a healthy treat.',
        benefits: ['High Magnesium', 'Good for Heart', 'Instant Energy Boost'],
        specifications: [
            { label: 'Origin', value: 'Vijayawada, India' },
            { label: 'Shelf Life', value: '4 Months' },
            { label: 'Roast Type', value: 'Dry Roasted' }
        ],
        faqs: [
            { q: 'Is it salted?', a: 'No, these are plane dry roasted jumbo cashews.' }
        ],
        nutrition: { energy: '553 Kcal', protein: '18g', fat: '44g', carbs: '30g' },
        variants: [
            { id: 'p2-v1', weight: '250g', mrp: 650, price: 549, discount: '15%off', unitPrice: '219.6/100g', stock: 12 },
            { id: 'p2-v2', weight: '500g', mrp: 1200, price: 980, discount: '18%off', unitPrice: '196/100g', stock: 40 },
            { id: 'p2-v3', weight: '1kg', mrp: 2300, price: 1899, discount: '17%off', unitPrice: '189.9/100g', stock: 15 }
        ]
    },
    {
        id: 'p3',
        brand: 'FARMLYF CLASSIC',
        name: 'Farmlyf Premium Walnuts (Akhrot)',
        category: 'nuts',
        subcategory: 'Walnuts (Akhrot)',
        rating: 4.7,
        tag: 'FRESH',
        image: walnutImg,
        description: 'Our Premium Walnuts (Akhrot) are essential for brain health. Sourced from the finest orchards, they offer a rich, nutty flavor and are packed with Omega-3 fatty acids.',
        benefits: ['Omega-3 Rich', 'Improves Brain Function', 'Anti-inflammatory'],
        specifications: [
            { label: 'Origin', value: 'Kashmir, India' },
            { label: 'Type', value: 'Kernels (Extra White)' }
        ],
        faqs: [
            { q: 'How many should I eat?', a: 'Daily consumption of 2-3 kernels is recommended.' }
        ],
        nutrition: { energy: '654 Kcal', protein: '15g', fat: '65g', carbs: '14g' },
        variants: [
            { id: 'p3-v1', weight: '250g', mrp: 450, price: 399, discount: '11%off', unitPrice: '159.6/100g', stock: 8 },
            { id: 'p3-v2', weight: '500g', mrp: 850, price: 749, discount: '12%off', unitPrice: '149.8/100g', stock: 20 }
        ]
    },
    {
        id: 'p4',
        brand: 'FARMLYF PREMIUM',
        name: 'Farmlyf Medjool Dates Large (Imported)',
        category: 'dried-fruits',
        subcategory: 'Dates',
        rating: 4.9,
        tag: 'PREMIUM',
        image: datesImg,
        description: 'Taste the luxury with our Imported Large Medjool Dates. Known for their natural sweetness and soft texture, they are a perfect energy booster and distinctively delicious.',
        benefits: ['Flash Energy', 'Natural Sugar', 'Rich in Potassium', 'Good for Digestion'],
        specifications: [
            { label: 'Origin', value: 'Middle East' },
            { label: 'Variety', value: 'Medjool' }
        ],
        faqs: [
            { q: 'Do they contain pits?', a: 'Yes, these are whole dates with seeds.' }
        ],
        nutrition: { energy: '277 Kcal', protein: '1.8g', fat: '0.2g', carbs: '75g' },
        variants: [
            { id: 'p4-v1', weight: '500g', mrp: 1800, price: 1450, discount: '19%off', unitPrice: '290/100g', stock: 30 },
            { id: 'p4-v2', weight: '1kg', mrp: 3400, price: 2799, discount: '18%off', unitPrice: '279.9/100g', stock: 10 }
        ]
    },
    {
        id: 'p5',
        brand: 'FARMLYF ANMOL',
        name: 'Farmlyf Premium Dried Figs (Anjeer)',
        category: 'dried-fruits',
        subcategory: 'Dried Figs (Anjeer)',
        rating: 4.8,
        tag: 'HIGH FIBER',
        image: anjeerImg,
        description: 'Enjoy the chewy goodness of Farmlyf Premium Dried Figs. High in fiber and essential minerals, these figs are a healthy addition to your diet, supporting digestion and heart health.',
        benefits: ['High Fiber', 'Bone Health', 'Natural Sweetness'],
        specifications: [
            { label: 'Origin', value: 'Afghanistan' },
            { label: 'Process', value: 'Sun Dried' }
        ],
        faqs: [
            { q: 'Should I soak them?', a: 'Soaking overnight makes them easier to digest and softer.' }
        ],
        nutrition: { energy: '249 Kcal', protein: '3.3g', fat: '0.9g', carbs: '64g' },
        variants: [
            { id: 'p5-v1', weight: '250g', mrp: 650, price: 549, discount: '15%off', unitPrice: '219.6/100g', stock: 4 },
            { id: 'p5-v2', weight: '500g', mrp: 1200, price: 999, discount: '17%off', unitPrice: '199.8/100g', stock: 18 }
        ]
    }
];

// Coupon Codes
export const COUPONS = [
    {
        id: 'COUP-001',
        code: 'WELCOME50',
        type: 'flat',
        value: 50,
        minOrderValue: 500,
        maxDiscount: null,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        usageLimit: 1000,
        usageCount: 0,
        perUserLimit: 1,
        applicableCategories: [],
        userEligibility: 'new',
        active: true,
        description: 'Flat ₹50 OFF on your first order!'
    },
    {
        id: 'COUP-002',
        code: 'SAVE100',
        type: 'flat',
        value: 100,
        minOrderValue: 1000,
        maxDiscount: null,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        usageLimit: 500,
        usageCount: 0,
        perUserLimit: 3,
        applicableCategories: [],
        userEligibility: 'all',
        active: true,
        description: 'Get ₹100 OFF on orders above ₹1000'
    },
    {
        id: 'COUP-003',
        code: 'NUTS15',
        type: 'percentage',
        value: 15,
        minOrderValue: 800,
        maxDiscount: 200,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        usageLimit: 300,
        usageCount: 0,
        perUserLimit: 2,
        applicableCategories: ['nuts'],
        userEligibility: 'all',
        active: true,
        description: '15% OFF on all nuts (Max ₹200)'
    },
    {
        id: 'COUP-004',
        code: 'MEGA20',
        type: 'percentage',
        value: 20,
        minOrderValue: 1500,
        maxDiscount: 300,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        usageLimit: 200,
        usageCount: 0,
        perUserLimit: 1,
        applicableCategories: [],
        userEligibility: 'all',
        active: true,
        description: '20% OFF on orders above ₹1500 (Max ₹300)'
    },
    {
        id: 'COUP-005',
        code: 'FREESHIP',
        type: 'free_shipping',
        value: 0,
        minOrderValue: 499,
        maxDiscount: null,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        usageLimit: 10000,
        usageCount: 0,
        perUserLimit: 10,
        applicableCategories: [],
        userEligibility: 'all',
        active: true,
        description: 'Free shipping on all orders!'
    }
];

