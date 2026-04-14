import React from 'react';
import { ArrowRight, LayoutTemplate, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOffers } from '../../../hooks/useOffers';

const OffersPage = () => {
    const { data: offers = [], isLoading } = useOffers();
    const activeOffers = offers.filter((offer) => offer?.isActive);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="bg-footerBg text-white py-16 px-6 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <span className="px-4 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Limited Time Offers
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Best Deals For You</h1>
                    <p className="text-gray-400 font-medium max-w-lg mx-auto">
                        Browse curated offer collections built from our featured products and seasonal picks.
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                {isLoading ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6 animate-pulse">
                            <LayoutTemplate size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Loading Offers</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Fetching the latest live collections for this page.
                        </p>
                    </div>
                ) : activeOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeOffers.map((offer) => (
                            <article
                                key={offer._id}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                    {offer.image ? (
                                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 text-primary">
                                            <LayoutTemplate size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-footerBg px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {offer.products?.length || 0} Products
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 leading-tight">
                                            {offer.title || 'Special Offer'}
                                        </h3>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wide">
                                            {offer.slug || 'Curated collection'}
                                        </p>
                                    </div>

                                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3">
                                        {offer.description || 'Explore this curated offer collection and discover the products bundled inside it.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            <Package size={12} />
                                            {offer.products?.length || 0} linked products
                                        </div>
                                    </div>

                                    <Link
                                        to={offer.slug ? `/offers/${offer.slug}` : '/catalog'}
                                        className="pt-4 border-t border-gray-50 mt-auto flex items-center justify-between text-footerBg hover:text-primary transition-colors"
                                    >
                                        <span className="font-black tracking-widest uppercase text-sm">View Collection</span>
                                        <span className="w-12 h-12 bg-footerBg text-white rounded-xl flex items-center justify-center hover:bg-primary transition-colors shadow-lg shadow-footerBg/20">
                                            <ArrowRight size={20} className="-rotate-45" />
                                        </span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                            <LayoutTemplate size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Active Offers</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We do not have any live offer collections right now. Check back again soon.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
