import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Search,
    GripVertical,
    X
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

import { useAddFeaturedSection, useFeaturedSectionByName, useUpdateFeaturedSection } from '../../../hooks/useContent';
import { useProducts } from '../../../hooks/useProducts';

const HomepageSectionPage = () => {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const { data: sectionData, isLoading: loading, refetch: refetchSection } = useFeaturedSectionByName(sectionId);
    const { data: allProducts = [] } = useProducts();
    const addSectionMutation = useAddFeaturedSection();
    const updateSectionMutation = useUpdateFeaturedSection();

    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [specialTextConfig, setSpecialTextConfig] = useState({
        title: '',
        subtitle: '',
        featuredTag: '',
        ctaText: '',
        deliveryLabel: '',
        deliveryText: ''
    });
    const itemsPerPage = 10;

    const products = sectionData?.products || [];


    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return products.slice(startIndex, startIndex + itemsPerPage);
    }, [products, currentPage]);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const [orderedProducts, setOrderedProducts] = useState([]);
    const getMetaPrefix = () => (sectionId === 'new-products' ? 'NP_META::' : 'SO_META::');

    const parseSpecialMeta = (rawSubtitle) => {
        const prefix = getMetaPrefix();
        if (!rawSubtitle || typeof rawSubtitle !== 'string') return null;
        if (!rawSubtitle.startsWith(prefix)) return null;
        try {
            return JSON.parse(rawSubtitle.slice(prefix.length));
        } catch {
            return null;
        }
    };

    useEffect(() => {
        setOrderedProducts(paginatedProducts);
    }, [paginatedProducts]);

    useEffect(() => {
        if (!['special-offers', 'new-products'].includes(sectionId)) return;
        const prefix = getMetaPrefix();
        const parsedMeta = parseSpecialMeta(sectionData?.subtitle);
        setSpecialTextConfig({
            title: sectionData?.title || (sectionId === 'new-products' ? 'New Products' : 'Special Offers'),
            subtitle: sectionData?.subtitle && !String(sectionData.subtitle).startsWith(prefix)
                ? sectionData.subtitle
                : parsedMeta?.subtitle || (sectionId === 'new-products' ? 'Newly added picks for your everyday needs' : 'Premium handpicked collections for your daily needs.'),
            featuredTag: sectionData?.featuredTag || parsedMeta?.featuredTag || (sectionId === 'new-products' ? 'New Launch' : 'Featured'),
            ctaText: sectionData?.ctaText || parsedMeta?.ctaText || (sectionId === 'new-products' ? 'Explore' : 'Grab Offer NOW'),
            deliveryLabel: sectionData?.deliveryLabel || parsedMeta?.deliveryLabel || (sectionId === 'new-products' ? '' : 'FRESH DELIVERY'),
            deliveryText: sectionData?.deliveryText || parsedMeta?.deliveryText || (sectionId === 'new-products' ? '' : 'FREE SHIPPING on orders above ₹499!')
        });
    }, [sectionData, sectionId]);

    const handleReorder = (newOrder) => {
        setOrderedProducts(newOrder);
        
        // Construct the new full list of IDs
        const startIndex = (currentPage - 1) * itemsPerPage;
        const newGlobalList = [...products];
        newGlobalList.splice(startIndex, itemsPerPage, ...newOrder);
        
        const updatedProductIds = newGlobalList.map(p => p._id || p.id);
        
        // Debounce update? For now direct update to see responsiveness.
        // Optimistic UI is handled by local state.
        updateSectionMutation.mutate({
            id: sectionData._id,
            data: { name: sectionId, products: updatedProductIds },
            optimisticData: {
                ...sectionData,
                name: sectionId,
                products: newGlobalList
            }
        });
    };

    // Get section title based on ID
    const getSectionTitle = () => {
        if (sectionData?.title) return sectionData.title;
        switch (sectionId) {
            case 'top-selling': return 'Top Selling Products';
            case 'today-top-deal': return 'Today Top Deal';
            case 'special-offers': return 'Special Offers';
            case 'new-products': return 'New Products';
            case 'new-arrivals': return 'New Arrivals';
            default: return 'Section Details';
        }
    };

    const handleRemoveProduct = async (productId) => {
        if (!sectionData) return;
        const updatedProductIds = products
            .filter(p => (p._id || p.id) !== productId)
            .map(p => p._id || p.id);

        try {
            await updateSectionMutation.mutateAsync({
                id: sectionData._id,
                data: { name: sectionId, products: updatedProductIds },
                optimisticData: {
                    ...sectionData,
                    name: sectionId,
                    products: products.filter(p => (p._id || p.id) !== productId)
                }
            });
        } catch (error) { }
    };

    const handleAddProduct = async (productId) => {
        // Prevent duplicates
        if (products.some(p => (p._id || p.id) === productId)) {
            toast.error('Product already in section');
            return;
        }

        try {
            if (!sectionData?._id) {
                await addSectionMutation.mutateAsync({
                    name: sectionId,
                    title: getSectionTitle(),
                    products: [productId],
                    isActive: true,
                    order: sectionId === 'top-selling' ? 0 : sectionId === 'today-top-deal' ? 1 : sectionId === 'special-offers' ? 2 : sectionId === 'new-products' ? 3 : 0
                });
                await refetchSection();
            } else {
                const updatedProductIds = [
                    ...products.map(p => p._id || p.id),
                    productId
                ];
                await updateSectionMutation.mutateAsync({
                    id: sectionData._id,
                    data: { name: sectionId, products: updatedProductIds },
                    optimisticData: {
                        ...sectionData,
                        name: sectionId,
                        products: [...products, allProducts.find((p) => (p._id || p.id) === productId)].filter(Boolean)
                    }
                });
            }
            setSearchTerm('');
        } catch (error) {
            toast.error('Failed to add product');
        }
    };

    const handleSaveSpecialTexts = async () => {
        const isNewProductsSection = sectionId === 'new-products';
        const metaPrefix = getMetaPrefix();
        const payload = isNewProductsSection
            ? {
                title: specialTextConfig.title || 'New Products',
                subtitle: specialTextConfig.subtitle || 'Newly added picks for your everyday needs'
            }
            : {
                title: specialTextConfig.title || 'Special Offers',
                subtitle: `${metaPrefix}${JSON.stringify({
                    subtitle: specialTextConfig.subtitle || '',
                    featuredTag: specialTextConfig.featuredTag || 'Featured',
                    ctaText: specialTextConfig.ctaText || 'Grab Offer NOW',
                    deliveryLabel: specialTextConfig.deliveryLabel || 'FRESH DELIVERY',
                    deliveryText: specialTextConfig.deliveryText || 'FREE SHIPPING on orders above ₹499!'
                })}`,
                featuredTag: specialTextConfig.featuredTag || 'Featured',
                ctaText: specialTextConfig.ctaText || 'Grab Offer NOW',
                deliveryLabel: specialTextConfig.deliveryLabel || 'FRESH DELIVERY',
                deliveryText: specialTextConfig.deliveryText || 'FREE SHIPPING on orders above ₹499!'
            };

        try {
            if (!sectionData?._id) {
                await addSectionMutation.mutateAsync({
                    name: sectionId,
                    ...payload,
                    products: [],
                    isActive: true,
                    order: isNewProductsSection ? 3 : 2
                });
            } else {
                await updateSectionMutation.mutateAsync({
                    id: sectionData._id,
                    data: { name: sectionId, ...payload },
                    optimisticData: {
                        ...sectionData,
                        name: sectionId,
                        ...payload
                    }
                });
            }
            await refetchSection();
        } catch (error) {
            // Error toast is already handled by mutation hooks.
        }
    };

    const filteredSuggestions = allProducts.filter(p => {
        const name = p.name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const notInSection = !products.some(sp => (sp._id || sp.id) === (p._id || p.id));
        return matchesSearch && notInSection;
    }).slice(0, 10);

    return (
        <div className="space-y-6 font-['Inter'] pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">{getSectionTitle()}</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage products displayed in this section</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-gray-200 ${isAdding ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                            }`}
                    >
                        {isAdding ? <X size={16} /> : <Plus size={16} />}
                        {isAdding ? 'Cancel' : 'Add Products'}
                    </button>
                </div>
            </div>

            {/* Inline Selection Dropdown */}
            {['special-offers', 'new-products'].includes(sectionId) && (
                <div className="bg-white p-5 rounded-2xl border border-primary/20 shadow-sm">
                    <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider mb-4">
                        {sectionId === 'new-products' ? 'New Products Text Settings' : 'Special Offer Text Settings'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={specialTextConfig.title}
                            onChange={(e) => setSpecialTextConfig(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Section title"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                        />
                        <input
                            type="text"
                            value={specialTextConfig.subtitle}
                            onChange={(e) => setSpecialTextConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                            placeholder="Section subtitle"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                        />
                        {sectionId === 'special-offers' && (
                            <>
                                <input
                                    type="text"
                                    value={specialTextConfig.featuredTag}
                                    onChange={(e) => setSpecialTextConfig(prev => ({ ...prev, featuredTag: e.target.value }))}
                                    placeholder="Featured tag text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                                />
                                <input
                                    type="text"
                                    value={specialTextConfig.ctaText}
                                    onChange={(e) => setSpecialTextConfig(prev => ({ ...prev, ctaText: e.target.value }))}
                                    placeholder="Button text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                                />
                                <input
                                    type="text"
                                    value={specialTextConfig.deliveryLabel}
                                    onChange={(e) => setSpecialTextConfig(prev => ({ ...prev, deliveryLabel: e.target.value }))}
                                    placeholder="Delivery label"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                                />
                                <input
                                    type="text"
                                    value={specialTextConfig.deliveryText}
                                    onChange={(e) => setSpecialTextConfig(prev => ({ ...prev, deliveryText: e.target.value }))}
                                    placeholder="Delivery text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                                />
                            </>
                        )}
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleSaveSpecialTexts}
                            className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                        >
                            Save Texts
                        </button>
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5 animate-in slide-in-from-top-2 duration-300 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                            />
                        </div>
                        <button
                            onClick={() => { setIsAdding(false); setSearchTerm(''); }}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            Done
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map(product => (
                                <button
                                    key={product._id || product.id}
                                    onClick={() => handleAddProduct(product._id || product.id)}
                                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 p-1 shrink-0 overflow-hidden">
                                        <img src={product.image || product.images?.[0]?.url} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">{product.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">₹{product.price}</span>
                                            <span className="text-[9px] text-gray-400 font-mono">#{product.sku || (product._id || product.id).slice(-6)}</span>
                                        </div>
                                    </div>
                                    <Plus size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                </button>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center text-gray-400">
                                <Search size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">No matching products found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {products.length > 0 ? (
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead width="50px"></AdminTableHead>
                            <AdminTableHead>Product Name</AdminTableHead>
                            <AdminTableHead>Category</AdminTableHead>
                            <AdminTableHead>Price</AdminTableHead>
                            <AdminTableHead className="text-right">Action</AdminTableHead>
                        </AdminTableHeader>
                        <Reorder.Group as="tbody" axis="y" values={orderedProducts} onReorder={handleReorder} className="divide-y divide-gray-100">
                            {orderedProducts.map((product) => {
                                const price = product.price || product.variants?.[0]?.price || product.variants?.[0]?.mrp || 'N/A';
                                return (
                                    <Reorder.Item
                                        as="tr"
                                        key={product._id || product.id}
                                        value={product}
                                        className="group border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                                    >
                                        <AdminTableCell>
                                            <div className="text-gray-300 cursor-move group-hover:text-gray-500">
                                                <GripVertical size={16} />
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                    <img src={product.image} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{product.sku || product._id || product.id}</p>
                                                </div>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm text-gray-600">{product.category && typeof product.category === 'object' ? product.category.name : product.category}</span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm font-bold text-gray-900">
                                                {price !== 'N/A' ? `₹${price}` : 'N/A'}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-right">
                                            <button
                                                onClick={() => handleRemoveProduct(product._id || product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </AdminTableCell>
                                    </Reorder.Item>
                                );
                            })}
                        </Reorder.Group>
                    </AdminTable>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <Plus size={32} />
                        </div>
                        <p className="font-bold text-gray-900">No products in this section yet</p>
                        <p className="text-xs mt-1">Click "Add Products" to populate this section</p>
                    </div>
                )}
                {products.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        totalItems={products.length}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </div>
        </div >
    );
};

export default HomepageSectionPage;
