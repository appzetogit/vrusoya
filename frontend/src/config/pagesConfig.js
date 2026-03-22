const buildPageConfig = (slug, title, category) => ({
    title,
    category,
    slug,
    publicPath: `/${slug}`,
    adminPath: `/admin/pages/${slug}`
});

export const PAGES_CONFIG = {
    // Legal & Policy
    'privacy-policy': buildPageConfig('privacy-policy', 'Privacy Policy', 'Legal'),
    'terms-conditions': buildPageConfig('terms-conditions', 'Terms & Conditions', 'Legal'),
    'refund-policy': buildPageConfig('refund-policy', 'Refund & Return Policy', 'Legal'),
    'shipping-policy': buildPageConfig('shipping-policy', 'Shipping Policy', 'Legal'),
    'cancellation-policy': buildPageConfig('cancellation-policy', 'Cancellation Policy', 'Legal'),
    'disclaimer': buildPageConfig('disclaimer', 'Disclaimer', 'Legal'),
    'cookie-policy': buildPageConfig('cookie-policy', 'Cookie Policy', 'Legal'),

    // Informational
    'about-us': buildPageConfig('about-us', 'About Us', 'Info'),
    'how-to-order': buildPageConfig('how-to-order', 'How to Order', 'Info'),
    'size-guide': buildPageConfig('size-guide', 'Size Guide', 'Info'),
    'payment-methods': buildPageConfig('payment-methods', 'Payment Methods', 'Info')
};

export const PAGE_ROUTE_OPTIONS = Object.values(PAGES_CONFIG).map((page) => ({
    slug: page.slug,
    label: page.title,
    category: page.category,
    url: page.publicPath,
    adminPath: page.adminPath
}));
