import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// import { useShop } from '../../../context/ShopContext';
import { useBannersBySection } from '../../../hooks/useContent';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const rawBanners = useBannersBySection('hero');

    // Flatten banners that have multiple slides
    const banners = React.useMemo(() => {
        return rawBanners.flatMap(b => {
            if (b.slides && b.slides.length > 0) {
                return b.slides.map(s => ({
                    ...b,
                    image: s.image,
                    publicId: s.publicId,
                    title: s.title || b.title,
                    subtitle: s.subtitle || b.subtitle,
                    badgeText: s.badgeText || b.badgeText,
                    link: s.link || b.link,
                    ctaText: s.ctaText || b.ctaText
                }));
            }
            return [b];
        });
    }, [rawBanners]);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide
    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

    // Fallback if no banners
    if (banners.length === 0) return null;

    const currentSlide = banners[currentIndex];

    // Safety check for undefined slide
    if (!currentSlide) return null;

    return (
        <div className="w-full bg-background py-4 md:py-6 px-3 md:px-12">
            <div className="w-full">
                <div className="relative w-full rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/6] bg-[#fdfdfd] border border-mint/20 group">

                    {/* Slider Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <button
                                type="button"
                                onClick={() => currentSlide.link && navigate(currentSlide.link)}
                                className="absolute inset-0 z-0 cursor-pointer"
                                aria-label={currentSlide.title || 'Banner slide'}
                            >
                                <motion.img
                                    initial={{ scale: 1.05 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 6, ease: "linear" }}
                                    src={currentSlide.image}
                                    alt={currentSlide.title}
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=1600';
                                    }}
                                />
                            </button>
                        </motion.div>
                    </AnimatePresence>

                    {/* Slider Controls (Desktop Hover) */}
                    <div className="hidden md:flex absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-between px-4 pointer-events-none">
                        <button
                            onClick={prevSlide}
                            className="pointer-events-auto p-2 md:p-3 rounded-full bg-white/10 hover:bg-white hover:text-black text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="pointer-events-auto p-2 md:p-3 rounded-full bg-white/10 hover:bg-white hover:text-black text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Slider Controls (Mobile Always Visible) */}
                    <div className="md:hidden absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-2 pointer-events-none">
                        <button
                            onClick={prevSlide}
                            className="pointer-events-auto p-2 rounded-full bg-black/35 text-white backdrop-blur-sm border border-white/25 shadow-md active:scale-95"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="pointer-events-auto p-2 rounded-full bg-black/35 text-white backdrop-blur-sm border border-white/25 shadow-md active:scale-95"
                            aria-label="Next banner"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Bottom Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`transition-all duration-500 rounded-full h-1 ${currentIndex === idx ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HeroSection;
