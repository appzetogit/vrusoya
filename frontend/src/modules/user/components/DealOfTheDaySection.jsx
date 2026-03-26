import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useFeaturedSectionByName } from '../../../hooks/useContent';

const DealOfTheDaySection = () => {
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);
    const showArrows = useInView(sectionRef, { amount: 0.35 });
    const { data: sectionData } = useFeaturedSectionByName('today-top-deal');
    const dealsToShow = sectionData?.products || [];

    const handleScroll = (direction = 'right') => {
        const node = scrollRef.current;
        if (!node) return;
        const delta = Math.max(220, Math.floor(node.clientWidth * 0.75));
        node.scrollBy({ left: direction === 'left' ? -delta : delta, behavior: 'smooth' });
    };

    if (dealsToShow.length === 0) return null;

    return (
        <section ref={sectionRef} className="bg-background pt-4 pb-3 md:pt-8 md:pb-6 md:py-10 px-4 md:px-12 relative overflow-hidden">
            <div className="container mx-auto bg-white rounded-[16px] md:rounded-[24px] px-3 md:px-6 py-4 md:py-8 relative border border-accent/40 shadow-sm">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/40 rounded-full blur-3xl opacity-70 pointer-events-none" />
                <div className="text-center mb-6 md:mb-12 relative z-10">
                    <div className="flex flex-col items-center gap-1 md:gap-2 mb-2">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-['Poppins'] font-bold text-textPrimary tracking-tight uppercase"
                        >
                            Deal of the <span className="text-secondary">Day</span>
                        </motion.h2>
                        <div className="w-32 md:w-48 h-1 bg-secondary mx-auto rounded-full mt-1 md:mt-2" />
                    </div>
                    <p className="text-textPrimary/70 text-[11px] md:text-base font-medium mb-2 md:mb-6">
                        Snatch these incredible deals before they're gone!
                    </p>
                </div>

                <div className="relative z-10 overflow-visible">
                    {showArrows && (
                        <>
                            <button
                                type="button"
                                onClick={() => handleScroll('left')}
                                className="absolute left-1 md:-left-10 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-2 md:p-3 rounded-full text-textPrimary hover:bg-secondary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                                aria-label="Scroll deals left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleScroll('right')}
                                className="absolute right-1 md:-right-10 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-2 md:p-3 rounded-full text-textPrimary hover:bg-secondary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                                aria-label="Scroll deals right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                    <div
                        ref={scrollRef}
                        className="flex gap-3 md:gap-6 px-2 md:px-16 py-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scroll-smooth pb-2 no-scrollbar"
                    >
                        {dealsToShow.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="min-w-[45vw] w-[45vw] md:min-w-[280px] md:w-[280px] flex-shrink-0 whitespace-normal"
                            >
                                <ProductCard product={product} showVault={false} compact={window.innerWidth < 768} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DealOfTheDaySection;
