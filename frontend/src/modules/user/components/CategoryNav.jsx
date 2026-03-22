
import React, { useEffect, useRef, useState } from 'react';
import { useCategories } from '../../../hooks/useProducts';
import {
    Store,
    ChevronDown,
    Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryNav = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { data: rawCategories = [] } = useCategories();
    const navRef = useRef(null);


    // Deduplicate and filter active categories
    const categoriesDB = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        for (const cat of rawCategories) {
            const id = cat._id || cat.id;
            if (id && !seen.has(id) && cat.status === 'Active' && cat.showInNavbar === true) {
                seen.add(id);
                unique.push(cat);
            }
        }
        return unique.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [rawCategories]);

    // Build Shop dropdown from categories only.
    const shopMenuData = React.useMemo(() => {
        return [{
            title: 'Shop Categories',
            items: categoriesDB.map(cat => ({
                name: cat.name,
                slug: cat.slug,
                path: `/category/${cat.slug}`
            }))
        }];
    }, [categoriesDB]);

    // Build Top Level Navigation Items
    const navItems = React.useMemo(() => {
        const items = [
            { name: 'Home', icon: Home, path: '/' },
            {
                name: 'Shop',
                icon: Store,
                path: '/catalog',
                hasMenu: true,
                menuData: shopMenuData
            }
        ];

        // Add Categories as top level links
        categoriesDB.forEach(cat => {
            items.push({
                name: cat.name,
                icon: Store,
                path: `/category/${cat.slug}`,
                hasMenu: false
            });
        });

        return items;
    }, [categoriesDB, shopMenuData]);

    const activeItem = navItems.find(c => c.name === activeMenu);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={navRef} className="bg-secondary text-background py-3.5 hidden md:block border-t border-primary/20 shadow-lg relative" style={{ zIndex: 10000 }}>
            <div className="w-full overflow-x-auto no-scrollbar px-4 lg:px-12">
                <div className="w-max min-w-full flex items-center justify-between gap-6 lg:gap-8 text-[10px] lg:text-[11px] font-black tracking-widest uppercase">
                    {navItems.map((cat, index) => {
                        const Icon = cat.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center shrink-0"
                                onMouseEnter={() => cat.hasMenu && setActiveMenu(cat.name)}
                                onMouseLeave={() => cat.hasMenu && setActiveMenu(null)}
                            >
                                {cat.hasMenu ? (
                                    <button
                                        type="button"
                                        onClick={() => setActiveMenu(prev => (prev === cat.name ? null : cat.name))}
                                        className={`flex items-center gap-2 py-1 transition-all duration-300 ${activeMenu === cat.name ? 'text-white' : 'hover:text-white text-background/90'}`}
                                    >
                                        <Icon size={14} className={`transition-colors duration-300 ${activeMenu === cat.name ? 'text-white' : 'text-white/80'}`} />
                                        <span className="whitespace-nowrap">{cat.name}</span>
                                        <ChevronDown size={11} className={`ml-0.5 transition-transform duration-300 ${activeMenu === cat.name ? 'rotate-180' : ''}`} />
                                    </button>
                                ) : (
                                    <Link
                                        to={cat.path}
                                        onClick={() => setActiveMenu(null)}
                                        className={`flex items-center gap-2 py-1 transition-all duration-300 ${activeMenu === cat.name ? 'text-white' : 'hover:text-white text-background/90'}`}
                                    >
                                        <Icon size={14} className={`transition-colors duration-300 ${activeMenu === cat.name ? 'text-white' : 'text-white/80'}`} />
                                        <span className="whitespace-nowrap">{cat.name}</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Popup Mega Menu */}
            <AnimatePresence>
                {activeMenu && activeItem && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-background shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] rounded-b-[2rem] border-t border-primary/10 overflow-hidden"
                        style={{ zIndex: 10001 }}
                        onMouseEnter={() => setActiveMenu(activeItem.name)}
                        onMouseLeave={() => setActiveMenu(null)}
                    >
                        <div className="max-w-[1500px] mx-auto px-12 py-12">
                            {activeItem.menuType === 'products' ? (
                                <div>
                                    <h4 className="text-primary font-black text-[12px] tracking-[0.15em] mb-6 border-b border-primary/10 pb-3 uppercase">
                                        Top Products in {activeItem.name}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {activeItem.products.map((product) => (
                                            <Link
                                                key={product.id || product._id}
                                                to={`/product/${product.slug || product.id}`}
                                                className="group bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                <div className="aspect-[4/5] w-full overflow-hidden rounded-lg mb-3 bg-white p-2 border border-primary/5">
                                                    <img
                                                        src={product.image || product.images?.[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <h5 className="font-bold text-textPrimary text-[11px] leading-tight mb-1 line-clamp-2 min-h-[2.5em]">
                                                    {product.name}
                                                </h5>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary font-black text-xs">
                                                        ₹{product.variants?.[0]?.price || product.price || 0}
                                                    </span>
                                                    {(product.variants?.[0]?.mrp || product.mrp) > (product.variants?.[0]?.price || product.price) && (
                                                        <span className="text-gray-400 text-[10px] line-through">
                                                            ₹{product.variants?.[0]?.mrp || product.mrp}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={`${activeMenu.startsWith('Shop') ? 'max-w-6xl' : ''}`}>
                                    {activeItem.menuData?.map((section, idx) => (
                                        <div key={idx} className="space-y-6">
                                            <h4 className="text-primary font-black text-[12px] tracking-[0.15em] mb-6 border-b border-primary/10 pb-3 uppercase flex items-center gap-2.5">
                                                <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                                                <span>{section.title}</span>
                                            </h4>
                                            <ul className={`grid gap-x-10 gap-y-5 ${activeMenu.startsWith('Shop') ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                                                {section.items.map((item, i) => (
                                                    <li key={i} className="group/item">
                                                        <div className="flex items-start gap-2.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-[6px] flex-shrink-0" />
                                                            <Link
                                                                to={item.path || `/category/${item.slug}`}
                                                                onClick={() => setActiveMenu(null)}
                                                                className="text-textPrimary group-hover/item:text-primary font-black text-[12px] leading-tight transition-all duration-200 tracking-wide uppercase"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryNav;
