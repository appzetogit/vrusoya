import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { useFeaturedSectionByName } from '../../../hooks/useContent';

const DealOfTheDaySection = () => {
    const scrollRef = useRef(null);
    const { data: sectionData } = useFeaturedSectionByName('today-top-deal');
    const dealsToShow = sectionData?.products || [];

    if (dealsToShow.length === 0) return null;

    return (
        <section className="bg-background pt-4 pb-3 md:pt-8 md:pb-6 md:py-10 px-4 md:px-12 relative overflow-hidden">
            <div className="container mx-auto bg-white rounded-[16px] md:rounded-[24px] px-3 md:px-6 py-4 md:py-8 relative border border-accent/40 shadow-sm">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/40 rounded-full blur-3xl opacity-70 pointer-events-none" />
                <div className="absolute top-0 right-0 md:top-6 md:right-6 z-20 bg-background px-2.5 py-1.5 md:px-4 md:py-2 rounded-bl-[20px] rounded-tr-[16px] md:rounded-2xl border-l border-b border-accent/40 md:border md:border-accent/40 shadow-sm">
                    <div className="flex items-center justify-end gap-1 md:gap-2 mb-0.5 md:mb-1">
                        <span className="bg-accent/30 text-primary px-1.5 md:px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold tracking-widest uppercase border border-accent">
                            Ends Soon
                        </span>
                    </div>
                    <div className="flex gap-1 md:gap-1.5 text-primary font-bold text-[10px] md:text-sm">
                        <span className="bg-white px-1.5 md:px-2 py-0.5 rounded border border-accent/40">12</span>:
                        <span className="bg-white px-1.5 md:px-2 py-0.5 rounded border border-accent/40">45</span>:
                        <span className="bg-white px-1.5 md:px-2 py-0.5 rounded border border-accent/40">30</span>
                    </div>
                </div>

                <div className="text-center mb-6 md:mb-12 relative z-10 pt-12 md:pt-0">
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

                <div className="relative z-10">
                    <div
                        ref={scrollRef}
                        className="flex gap-3 md:gap-6 py-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scroll-smooth pb-2 no-scrollbar"
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
