import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeaturedSectionByName } from '../../../hooks/useContent';
import ProductCard from './ProductCard';
import { useProducts } from '../../../hooks/useProducts';

const NewProductsSection = () => {
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);
    const showArrows = useInView(sectionRef, { amount: 0.35 });
    const { data: sectionData } = useFeaturedSectionByName('new-products');
    const { data: allProducts = [] } = useProducts();
    const featuredProducts = sectionData?.products || [];
    const products = featuredProducts.length > 0
        ? featuredProducts
        : [...allProducts]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 8);

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

    const handleScroll = (direction = 'right') => {
        const node = scrollRef.current;
        if (!node) return;
        const delta = Math.max(220, Math.floor(node.clientWidth * 0.75));
        node.scrollBy({ left: direction === 'left' ? -delta : delta, behavior: 'smooth' });
    };

    if (products.length === 0) return null;

    return (
        <section ref={sectionRef} className="bg-background py-6 md:py-8 px-4 md:px-24">
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

                <div className="relative">
                    {showArrows && (
                        <>
                            <button
                                type="button"
                                onClick={() => handleScroll('left')}
                                className="absolute left-1 md:-left-14 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-2 md:p-3 rounded-full text-textPrimary hover:bg-secondary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                                aria-label="Scroll new products left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleScroll('right')}
                                className="absolute right-1 md:-right-14 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-2 md:p-3 rounded-full text-textPrimary hover:bg-secondary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                                aria-label="Scroll new products right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 md:px-12 snap-x"
                    >
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
            </div>
        </section>
    );
};

export default NewProductsSection;
