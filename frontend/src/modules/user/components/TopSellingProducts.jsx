import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { useFeaturedSectionByName } from '../../../hooks/useContent';

const TopSellingProducts = () => {
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);
    const showArrows = useInView(sectionRef, { amount: 0.35 });
    const { data: sectionData, isLoading } = useFeaturedSectionByName('top-selling');
    const topProducts = sectionData?.products || [];

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <section className="bg-white pt-6 pb-4 md:py-6 px-4 md:px-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-4 md:mb-14 space-y-2">
                        <div className="skeleton shimmer h-7 md:h-10 w-64 md:w-96 rounded-md mx-auto" />
                        <div className="skeleton shimmer w-40 md:w-72 h-1.5 rounded-full mx-auto" />
                    </div>

                    <div className="py-8 md:py-14">
                        <LoadingSpinner label="Loading bestsellers..." />
                    </div>
                </div>
            </section>
        );
    }
    if (topProducts.length === 0) return null;

    return (
        <section ref={sectionRef} className="bg-white pt-6 pb-4 md:py-6 px-4 md:px-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <div className="container mx-auto">
                <div className="text-center mb-4 md:mb-14 space-y-2">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-4xl font-['Poppins'] font-bold text-textPrimary tracking-tight"
                    >
                        Top Selling <span className="text-secondary">Products</span>
                    </motion.h2>
                    <div className="w-40 md:w-72 h-1.5 bg-secondary mx-auto rounded-full mt-2" />
                </div>

                <div className="relative">
                    {showArrows && (
                        <>
                            <button
                                type="button"
                                onClick={() => scroll('left')}
                                className="absolute left-1 md:-left-14 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-2 md:p-3 rounded-full text-textPrimary hover:bg-secondary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                                aria-label="Scroll top selling left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll('right')}
                                className="absolute right-1 md:-right-14 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-2 md:p-3 rounded-full text-textPrimary hover:bg-secondary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                                aria-label="Scroll top selling right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                    {/* Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 md:px-12 snap-x"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {topProducts.map((product, index) => (
                            <motion.div
                                key={product._id || product.id || index}
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

export default TopSellingProducts;
