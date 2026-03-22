import React from 'react';
import { motion } from 'framer-motion';
import { useFeaturedSectionByName } from '../../../hooks/useContent';
import ProductCard from './ProductCard';

const NewProductsSection = () => {
    const { data: sectionData } = useFeaturedSectionByName('new-products');
    const products = sectionData?.products || [];

    const SPECIAL_META_PREFIX = 'NP_META::';
    const parsedMeta = (() => {
        const raw = sectionData?.subtitle;
        if (!raw || typeof raw !== 'string' || !raw.startsWith(SPECIAL_META_PREFIX)) return null;
        try {
            return JSON.parse(raw.slice(SPECIAL_META_PREFIX.length));
        } catch {
            return null;
        }
    })();

    const title = sectionData?.title || 'New Products';
    const subtitle = (sectionData?.subtitle && !String(sectionData.subtitle).startsWith(SPECIAL_META_PREFIX))
        ? sectionData.subtitle
        : parsedMeta?.subtitle || 'Newly added picks for your everyday needs';
    const titleWords = String(title).trim().split(/\s+/).filter(Boolean);
    const highlightedWord = titleWords.length > 1 ? titleWords[titleWords.length - 1] : '';
    const primaryTitle = titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : title;

    if (products.length === 0) return null;

    return (
        <section className="bg-background py-6 md:py-8 px-4 md:px-24">
            <div className="container mx-auto">
                <div className="flex items-center justify-center mb-4 md:mb-6">
                    <div className="text-center">
                        <h2 className="text-2xl md:text-4xl font-['Poppins'] font-bold text-textPrimary tracking-tight uppercase">
                            {primaryTitle}{' '}
                            {highlightedWord && <span className="text-secondary">{highlightedWord}</span>}
                        </h2>
                        <div className="w-32 md:w-48 h-1 bg-secondary mx-auto rounded-full mt-2" />
                        <p className="text-textPrimary/70 text-sm md:text-base font-medium mt-2">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 snap-x">
                    {products.slice(0, 8).map((product, index) => (
                        <motion.div
                            key={product._id || product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="min-w-[160px] w-[170px] md:min-w-[280px] md:w-[280px] flex-shrink-0 snap-start"
                        >
                            <ProductCard product={product} showVault={false} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewProductsSection;
