import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ChevronDown, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const calculatePer100g = (price, quantity, unit, weightStr) => {
    let q = parseFloat(quantity);
    let u = unit ? unit.toLowerCase().trim() : '';

    const validUnits = ['g', 'gm', 'gms', 'kg', 'kgs'];
    const hasValidStructuredData = q && validUnits.includes(u);

    if (!hasValidStructuredData && weightStr) {
        const match = String(weightStr).match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/);
        if (match) {
            q = parseFloat(match[1]);
            u = match[3].toLowerCase();
        }
    }

    if (!q) return null;

    if (['g', 'gm', 'gms'].includes(u)) {
        return ((price / q) * 100).toFixed(2);
    }
    if (['kg', 'kgs'].includes(u)) {
        return ((price / (q * 1000)) * 100).toFixed(2);
    }

    return null;
};

const getVariantLabel = (variant) => {
    if (variant?.weight) return variant.weight;

    const quantity = variant?.quantity ?? '';
    const unit = variant?.unit ?? '';
    return `${quantity}${unit}`.trim();
};

const ProductCard = ({ product, showVault = true, compact = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, getCart, openCartDrawer } = useCartStore();
    const toggleWishlist = useUserStore((state) => state.toggleWishlist);
    const wishlistMap = useUserStore((state) => state.wishlist);
    const userWishlist = user ? (wishlistMap[user.id] || []) : [];

    const fallbackVariant = {
        id: `${product.id || product._id || product.slug || product.name}-default`,
        quantity: product.quantity || '',
        unit: product.unit || '',
        weight: product.weight || 'Standard',
        price: product.price || 0,
        mrp: product.mrp || product.price || 0,
        stock: product.stock?.quantity || 0,
    };
    const variantOptions = Array.isArray(product.variants) && product.variants.length > 0
        ? product.variants
        : [fallbackVariant];
    const hasVariants = variantOptions.length > 0;
    const hasMultipleVariants = variantOptions.length > 1;
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [isVariantMenuOpen, setIsVariantMenuOpen] = useState(false);
    const variantMenuRef = useRef(null);

    useEffect(() => {
        setSelectedVariantId(String(variantOptions[0].id));
        setIsVariantMenuOpen(false);
    }, [product.id, product._id, product.slug, variantOptions[0]?.id]);

    useEffect(() => {
        if (!isVariantMenuOpen) return undefined;

        const handlePointerDown = (event) => {
            if (variantMenuRef.current && !variantMenuRef.current.contains(event.target)) {
                setIsVariantMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isVariantMenuOpen]);

    const defaultVariant = hasVariants
        ? variantOptions.reduce((lowest, variant) => (
            Number(variant.price || 0) < Number(lowest.price || 0) ? variant : lowest
        ), variantOptions[0])
        : null;
    const selectedVariant = hasVariants
        ? variantOptions.find((variant) => String(variant.id) === String(selectedVariantId)) || null
        : null;
    const activeVariant = selectedVariant || defaultVariant;
    const displayVariant = activeVariant || defaultVariant;

    const itemId = displayVariant?.id || product.id;
    const isWishlisted = userWishlist.includes(itemId);

    const displayPrice = hasVariants
        ? Number(displayVariant?.price || 0)
        : Number(product.price || 0);
    const displayMrp = hasVariants
        ? Number(displayVariant?.mrp || displayVariant?.price || 0)
        : Number(product.mrp || product.price || 0);
    const per100gPrice = hasVariants
        ? calculatePer100g(
            displayPrice,
            displayVariant?.quantity,
            displayVariant?.unit,
            displayVariant?.weight
        )
        : calculatePer100g(displayPrice, product.quantity, product.unit, product.weight);

    const activeStock = hasVariants
        ? Number(activeVariant?.stock || 0)
        : Number(product.stock?.quantity || 0);
    const selectionRequired = hasMultipleVariants && !selectedVariant;
    const cartItems = getCart(user?.id);
    const isInCart = !selectionRequired && cartItems.some((item) => String(item.packId) === String(itemId));
    const cartItemMeta = {
        name: product.name,
        weight: displayVariant?.weight || product.weight || 'Standard',
        price: displayPrice,
        mrp: displayMrp,
        image: product.image,
        category: product.category,
        slug: product.slug,
        productId: product.id || product._id,
        stock: activeStock,
    };

    return (
        <motion.div
            layout
            onClick={() => navigate(`/product/${product.slug || product.id}`)}
            className="group/product relative bg-white border border-accent/50 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
        >
            <div className={`relative ${compact ? 'aspect-[16/9]' : 'aspect-[5/4]'} w-full overflow-hidden bg-gradient-to-b from-background to-accent/20 flex items-center justify-center`}>
                {product.tag && (
                    <div className="absolute top-2 left-0 z-10 md:top-3">
                        <span className="bg-secondary text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-3 md:py-1 rounded-r-lg shadow-sm">
                            {product.tag}
                        </span>
                    </div>
                )}

                {displayMrp > displayPrice && (
                    <div className="absolute top-2 right-2 z-10 md:top-3 md:right-3">
                        <span className="bg-accent text-textPrimary text-[7px] md:text-[9px] font-bold px-1 py-0.5 rounded shadow-sm border border-secondary/30">
                            {Math.round(((displayMrp - displayPrice) / displayMrp) * 100)}% off
                        </span>
                    </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 z-10 md:bottom-3 md:left-3 md:right-3 flex items-center justify-between">
                    <div className="bg-emerald-600 text-white flex items-center gap-0.5 px-1.5 py-1 rounded text-[7px] md:text-[9px] font-bold shadow-sm">
                        <Star size={9} fill="currentColor" />
                        <span>{product.rating}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                                navigate('/login');
                                return;
                            }
                            toggleWishlist(user.id, itemId);
                        }}
                        className="bg-white/90 backdrop-blur-sm border border-white/70 text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full shadow-sm active:scale-95"
                    >
                        <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
                    </button>
                </div>

                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover/product:scale-110"
                />
            </div>

            <div className={`${compact ? 'p-2 md:p-2.5' : 'p-3 md:px-4 md:pt-3'} pb-0 flex-1 flex flex-col`}>
                <h3 className="text-[9px] md:text-[12px] font-bold text-textPrimary leading-tight mb-1 md:mb-1.5 line-clamp-2">
                    {product.name}
                </h3>

                <div className={`mt-auto ${compact ? 'space-y-0.5' : 'space-y-0.5 md:space-y-1'}`}>
                    {hasVariants && (
                        <div
                            ref={variantMenuRef}
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setIsVariantMenuOpen((open) => !open)}
                                className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-[9px] md:text-[11px] font-medium text-textPrimary outline-none transition-colors hover:border-primary focus:border-primary flex items-center justify-between gap-2"
                                aria-haspopup="listbox"
                                aria-expanded={isVariantMenuOpen}
                            >
                                <span>{selectedVariant ? getVariantLabel(selectedVariant) : getVariantLabel(defaultVariant)}</span>
                                <ChevronDown size={14} className={`transition-transform ${isVariantMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isVariantMenuOpen && (
                                <div
                                    className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto overflow-x-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                                    role="listbox"
                                    aria-label={`Weight options for ${product.name}`}
                                >
                                    {variantOptions.map((variant) => {
                                        const isSelected = String(variant.id) === String(selectedVariantId);

                                        return (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVariantId(String(variant.id));
                                                    setIsVariantMenuOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between px-3 py-2 text-left text-[9px] md:text-[11px] transition-colors ${isSelected
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'text-textPrimary hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{getVariantLabel(variant)}</span>
                                                <span className="text-[8px] md:text-[10px] font-medium text-gray-500">₹{variant.price}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] md:text-sm font-black text-black tracking-tight">₹{displayPrice}</span>
                            {displayMrp > displayPrice && (
                                <span className="text-[9px] md:text-[11px] text-gray-600 line-through">₹{displayMrp}</span>
                            )}
                            {per100gPrice && (
                                <span className="text-[8px] md:text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                    (₹{per100gPrice}/100g)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={`w-auto overflow-hidden ${compact ? '-mx-2 md:-mx-3' : '-mx-3 md:-mx-4'}`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                if (selectionRequired) {
                                    toast.error('Please choose a weight option');
                                    return;
                                }

                                if (activeStock <= 0) {
                                    toast.error('Item is currently out of stock');
                                    return;
                                }

                                if (isInCart) {
                                    navigate('/cart');
                                    return;
                                }

                                if (!user) {
                                    navigate('/login?redirect=/cart');
                                    return;
                                }

                                addToCart(user?.id, itemId, 1, cartItemMeta);
                                openCartDrawer();
                            }}
                            disabled={!selectionRequired && activeStock <= 0}
                            className={`group/btn w-full py-3 md:py-3.5 rounded-t-none rounded-b-2xl md:rounded-b-3xl text-[8px] md:text-[10px] font-bold uppercase tracking-[0.18em] active:scale-[0.99] flex items-center justify-center border-t translate-y-0 xl:translate-y-full group-hover/product:translate-y-0 transition-[transform,background-color] duration-300 ease-out shadow-inner ${!selectionRequired && activeStock <= 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                : isInCart
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                                    : 'bg-primary hover:bg-secondary text-white border-primary/80'
                                }`}
                        >
                            {!selectionRequired && activeStock <= 0
                                ? 'Out of Stock'
                                : selectionRequired
                                    ? 'Choose Option'
                                    : isInCart
                                        ? 'Go to Cart'
                                        : (
                                            <div className="grid place-items-center">
                                                <span className="col-start-1 row-start-1 transition-all duration-300 ease-out transform xl:group-hover/btn:-translate-y-4 xl:group-hover/btn:opacity-0 xl:group-hover/btn:scale-75">
                                                    Add to Cart
                                                </span>
                                                <ShoppingCart
                                                    strokeWidth={2.5}
                                                    className="col-start-1 row-start-1 w-4 h-4 lg:w-5 lg:h-5 transition-all duration-300 ease-out transform translate-y-4 opacity-0 scale-50 xl:group-hover/btn:translate-y-0 xl:group-hover/btn:opacity-100 xl:group-hover/btn:scale-100 hidden xl:block"
                                                />
                                            </div>
                                        )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
