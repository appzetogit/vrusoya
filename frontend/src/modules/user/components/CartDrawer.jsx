import React from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useCartStore from '../../../store/useCartStore';
import { useProducts } from '../../../hooks/useProducts';
import toast from 'react-hot-toast';

const CartDrawer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        isCartDrawerOpen,
        closeCartDrawer,
        getCart,
        removeFromCart,
        updateCartQty,
    } = useCartStore();
    const { data: products = [] } = useProducts();

    React.useEffect(() => {
        if (!isCartDrawerOpen || user) return;
        closeCartDrawer();
        navigate('/login?redirect=%2Fcart');
    }, [closeCartDrawer, isCartDrawerOpen, navigate, user]);

    React.useEffect(() => {
        if (!isCartDrawerOpen) return undefined;

        const scrollY = window.scrollY;
        const originalBodyStyles = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
        };
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeCartDrawer();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalBodyStyles.overflow;
            document.body.style.position = originalBodyStyles.position;
            document.body.style.top = originalBodyStyles.top;
            document.body.style.width = originalBodyStyles.width;
            window.scrollTo(0, scrollY);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [closeCartDrawer, isCartDrawerOpen]);

    const getVariantById = React.useCallback((variantId) => {
        for (const product of products) {
            const variant = product.variants?.find((item) => String(item.id) === String(variantId));
            if (variant) {
                return { ...variant, product };
            }
        }
        return null;
    }, [products]);

    const cartItems = getCart(user?.id);

    const enrichedCart = React.useMemo(() => (
        cartItems.map((item) => {
            const variantData = getVariantById(item.packId);
            if (variantData) {
                return {
                    ...item,
                    id: variantData.id,
                    name: variantData.product.name,
                    weight: variantData.weight,
                    price: Number(variantData.price || 0),
                    mrp: Number(variantData.mrp || variantData.price || 0),
                    image: variantData.product.image,
                    category: variantData.product.category,
                    slug: variantData.product.slug,
                    productId: variantData.product.id,
                    stock: Number(variantData.stock || 0),
                };
            }

            if (item.itemMeta) {
                return {
                    ...item,
                    id: item.packId,
                    name: item.itemMeta.name,
                    weight: item.itemMeta.weight,
                    price: Number(item.itemMeta.price || 0),
                    mrp: Number(item.itemMeta.mrp || item.itemMeta.price || 0),
                    image: item.itemMeta.image,
                    category: item.itemMeta.category,
                    slug: item.itemMeta.slug,
                    productId: item.itemMeta.productId,
                    stock: Number(item.itemMeta.stock || 0),
                };
            }

            const product = products.find((entry) => String(entry.id) === String(item.packId));
            if (!product) return null;

            return {
                ...item,
                id: product.id,
                name: product.name,
                weight: product.weight,
                price: Number(product.price || 0),
                mrp: Number(product.mrp || product.price || 0),
                image: product.image,
                category: product.category,
                slug: product.slug,
                productId: product.id,
                stock: Number(product.stock?.quantity || 0),
            };
        }).filter(Boolean)
    ), [cartItems, getVariantById, products]);

    const subtotal = enrichedCart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleNavigate = (path) => {
        closeCartDrawer();
        navigate(path);
    };

    if (!isCartDrawerOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[11000] overscroll-none">
            <button
                type="button"
                aria-label="Close cart drawer"
                className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
                onClick={closeCartDrawer}
            />

            <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-[22rem] flex-col overflow-hidden overscroll-contain touch-pan-y bg-white shadow-2xl md:max-w-[24rem]">
                <div className="flex items-center justify-between border-b border-accent/20 px-4 py-3 shadow-sm z-10">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Shopping cart</p>
                        <h2 className="mt-0.5 text-[1.4rem] font-black leading-none text-textPrimary">Your Cart</h2>
                    </div>
                    <button
                        type="button"
                        onClick={closeCartDrawer}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-textPrimary transition-colors hover:text-primary bg-background px-2 py-1.5 rounded-md"
                    >
                        <X size={14} />
                        Close
                    </button>
                </div>

                {enrichedCart.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                            <ShoppingCart size={28} />
                        </div>
                        <h3 className="text-lg font-black text-textPrimary">Your cart is empty</h3>
                        <p className="mt-2 max-w-xs text-sm text-textPrimary/60">Add a product to see it here instantly.</p>
                    </div>
                ) : (
                    <>
                        <div
                            className="min-h-0 flex-1 overflow-y-scroll overscroll-contain px-4 py-3 touch-pan-y pointer-events-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/80]"
                            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                        >
                            <div className="space-y-2.5">
                                {enrichedCart.map((item) => (
                                    <div key={item.id} className="rounded-[16px] border border-primary/10 bg-white p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-primary/30 touch-pan-y">
                                        <div className="flex items-start gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleNavigate(`/product/${item.slug || item.productId || item.id}`)}
                                                className="h-[65px] w-[55px] shrink-0 overflow-hidden rounded-lg bg-background p-1"
                                            >
                                                <img src={item.image} alt={item.name} className="h-full w-full object-contain mix-blend-multiply" />
                                            </button>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNavigate(`/product/${item.slug || item.productId || item.id}`)}
                                                            className="text-left text-[13.5px] font-bold leading-tight text-textPrimary transition-colors hover:text-primary"
                                                        >
                                                            {item.name}
                                                        </button>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9.5px] text-textPrimary/55">
                                                            {item.category && (
                                                                <span className="uppercase tracking-wide">{item.category}</span>
                                                            )}
                                                            {item.weight && (
                                                                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                                                                    {item.weight}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(user?.id, item.id)}
                                                        className="text-textPrimary/40 transition-colors hover:text-red-500 p-0.5"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                <div className="mt-2.5 flex items-center justify-between gap-2">
                                                    <div className="flex items-center overflow-hidden rounded bg-background/50 border border-primary/15">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCartQty(user?.id, item.id, item.qty - 1)}
                                                            className="px-2 py-1 text-textPrimary transition-colors hover:bg-white hover:text-primary"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="min-w-[28px] text-center text-[12px] font-bold text-textPrimary">{item.qty}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (item.stock > 0 && item.qty >= item.stock) {
                                                                    toast.error(`Only ${item.stock} items available in stock`);
                                                                    return;
                                                                }
                                                                updateCartQty(user?.id, item.id, item.qty + 1);
                                                            }}
                                                            className="px-2 py-1 text-textPrimary transition-colors hover:bg-white hover:text-primary"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col items-end min-w-0">
                                                        <div className="flex items-baseline gap-1.5 mt-0.5">
                                                            {item.mrp > item.price && (
                                                                <span className="text-[10px] line-through text-textPrimary/40">
                                                                    Rs.{(item.mrp * item.qty).toFixed(2)}
                                                                </span>
                                                            )}
                                                            <span className="text-[14px] font-black text-textPrimary">
                                                                Rs.{(item.price * item.qty).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className="border-t border-accent/30 bg-white px-4 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10"
                            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
                        >
                            <div className="mb-3.5 flex items-center justify-between">
                                <span className="text-[14px] font-bold text-textPrimary uppercase tracking-wide">Subtotal</span>
                                <span className="text-[17px] font-black text-primary">Rs.{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleNavigate('/cart')}
                                    className="flex-1 rounded-xl bg-background px-3 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-textPrimary transition-colors hover:bg-[#e0e0e0]"
                                >
                                    View Cart
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleNavigate('/checkout')}
                                    className="flex-1 rounded-xl bg-secondary px-3 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-colors hover:bg-primary shadow-sm hover:shadow-md"
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
};

export default CartDrawer;
