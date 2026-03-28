import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeaturedSectionByName } from '../../../hooks/useContent';
import { useProducts } from '../../../hooks/useProducts';
import bgOffer from '../../../assets/special_offers_bg.png';

const SpecialOffersSection = () => {
    const navigate = useNavigate();
    const { data: sectionData } = useFeaturedSectionByName('special-offers');
    const { data: products = [] } = useProducts();
    const featuredProducts = sectionData?.products || [];
    const productsToShow = featuredProducts.length > 0
        ? featuredProducts
        : [...products]
            .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
            .slice(0, 5);

    if (productsToShow.length === 0) return null;

    const featured = productsToShow[0];
    const sideProducts = productsToShow.slice(1, 5);
    const featuredImage = featured?.image || featured?.images?.[0]?.url;
    const SPECIAL_META_PREFIX = 'SO_META::';
    const parsedMeta = (() => {
        const raw = sectionData?.subtitle;
        if (!raw || typeof raw !== 'string' || !raw.startsWith(SPECIAL_META_PREFIX)) return null;
        try {
            return JSON.parse(raw.slice(SPECIAL_META_PREFIX.length));
        } catch {
            return null;
        }
    })();
    const sectionTitle = sectionData?.title || 'Special Offers';
    const sectionSubtitle = (sectionData?.subtitle && !String(sectionData.subtitle).startsWith(SPECIAL_META_PREFIX))
        ? sectionData.subtitle
        : parsedMeta?.subtitle || 'Premium handpicked collections for your daily needs.';
    const featuredTag = sectionData?.featuredTag || parsedMeta?.featuredTag || 'Featured';
    const ctaText = sectionData?.ctaText || parsedMeta?.ctaText || 'Grab Offer NOW';
    const deliveryLabel = sectionData?.deliveryLabel || parsedMeta?.deliveryLabel || 'FRESH DELIVERY';
    const deliveryText = sectionData?.deliveryText || parsedMeta?.deliveryText || 'FREE SHIPPING on orders above ₹499!';
    const getDisplayPrice = (product) => {
        const direct = Number(product?.price || 0);
        const variantPrice = Number(product?.variants?.[0]?.price || 0);
        const variantMrp = Number(product?.variants?.[0]?.mrp || 0);
        const unitPrice = Number(product?.unitPrice || 0);
        const mrp = Number(product?.mrp || 0);
        return direct || variantPrice || unitPrice || mrp || variantMrp || null;
    };
    const featuredPrice = getDisplayPrice(featured);

    return (
        <section className="relative py-5 md:py-7 px-4 md:px-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src={bgOffer}
                    alt="Special Offers Background"
                    className="w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:bg-gradient-to-r md:from-white/90 md:via-white/60 md:to-transparent" />
            </div>

            <div className="container mx-auto relative z-10">
                <div className="relative mb-4 md:mb-7">
                    <div className="text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-['Poppins'] font-bold text-textPrimary tracking-tight uppercase leading-none mb-2 md:mb-3"
                        >
                            Special <span className="text-secondary">Offers</span>
                        </motion.h2>
                        <div className="w-24 md:w-48 h-1 bg-secondary mx-auto rounded-full mt-1 md:mt-2" />
                        <p className="text-textPrimary/70 text-xs md:text-lg font-medium mx-auto max-w-md mt-2 md:mt-3">{sectionSubtitle}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3 md:gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="group relative bg-white/40 backdrop-blur-md rounded-3xl md:rounded-[2.1rem] p-3 md:p-5 border border-white/60 shadow-lg md:shadow-2xl overflow-hidden min-h-[220px] md:min-h-[280px] flex flex-col md:flex-row items-center gap-2 md:gap-4"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-all duration-1000" />

                        <div className="w-full md:w-[42%] h-[150px] md:h-[260px] relative z-10 flex items-center justify-center p-2 md:p-3 bg-white/50 rounded-2xl md:rounded-[1.5rem] shadow-inner border border-white/80 group-hover:shadow-xl md:group-hover:shadow-2xl transition-all duration-500">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={featuredImage}
                                alt={featured?.name}
                                className="w-full h-full object-contain filter drop-shadow-3xl"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left relative z-10 w-full pt-2 md:pt-0">
                            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 rounded-full bg-white/70 border border-white/70 text-[9px] md:text-[11px] font-bold tracking-wider uppercase text-primary mb-2 md:mb-3">
                                <Gift size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                {featuredTag}
                            </div>
                            <h3 className="text-base md:text-2xl font-black text-textPrimary leading-tight mb-1 md:mb-2 tracking-tighter capitalize line-clamp-2 md:line-clamp-none">
                                {featured?.name}
                            </h3>
                            <div className="flex items-baseline justify-center md:justify-start gap-2 md:gap-3 mb-3 md:mb-4">
                                <span className="text-xl md:text-3xl font-black text-primary">
                                    {featuredPrice ? `₹${featuredPrice}` : 'Price on request'}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(featured?.slug ? `/product/${featured.slug}` : '/shop')}
                                className="group/btn relative inline-flex items-center justify-center w-full md:w-auto gap-2 md:gap-2.5 px-4 md:px-7 py-2.5 md:py-3 rounded-full bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-[2px] shadow-lg md:shadow-xl hover:shadow-primary/30 hover:bg-primaryHover transition-all overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                                    {ctaText} <ArrowRight size={16} className="w-4 h-4 md:w-5 md:h-5 md:group-hover/btn:translate-x-2 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500" />
                            </button>
                        </div>
                    </motion.div>

                    <div className="space-y-3">
                        <div className="bg-white/30 backdrop-blur-sm p-2 md:p-3 rounded-2xl md:rounded-[2rem] border border-white/40 space-y-2 md:space-y-3 shadow-lg md:shadow-xl">
                            {sideProducts.map((product, index) => {
                                const image = product.image || product.images?.[0]?.url;
                                const price = getDisplayPrice(product);

                                return (
                                    <motion.button
                                        key={product._id || product.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ x: 8 }}
                                        onClick={() => navigate(product.slug ? `/product/${product.slug}` : '/shop')}
                                        className="w-full text-left bg-white/60 hover:bg-white rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/60 shadow-sm flex items-center gap-2.5 md:gap-3 transition-all duration-300 group/item"
                                    >
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/80 rounded-lg md:rounded-xl p-1.5 md:p-2 border border-accent/20 flex-shrink-0 relative overflow-hidden">
                                            <img src={image} alt={product.name} className="w-full h-full object-contain group-hover/item:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs md:text-base font-bold text-textPrimary line-clamp-1 mb-0.5 md:mb-1 group-hover/item:text-secondary transition-colors tracking-tight">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm md:text-lg font-black text-secondary">
                                                    {price ? `₹${price}` : 'Price on request'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full border border-secondary/20 flex items-center justify-center text-secondary group-hover/item:bg-secondary group-hover/item:text-white transition-all">
                                            <ArrowRight size={14} className="md:w-[18px] md:h-[18px] w-[14px] h-[14px]" />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="bg-primary text-white/90 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] shadow-lg md:shadow-xl text-center relative overflow-hidden group/tag">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                            <p className="text-[9px] md:text-xs font-black uppercase tracking-[3px] md:tracking-[5px] mb-0.5 md:mb-1 opacity-60">{deliveryLabel}</p>
                            <h4 className="text-sm md:text-xl font-bold tracking-tight px-3 md:px-4">{deliveryText}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SpecialOffersSection;
