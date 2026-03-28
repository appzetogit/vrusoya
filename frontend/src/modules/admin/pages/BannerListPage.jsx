import React, { useMemo, useState } from 'react';
import { Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBanners, useAddBanner, useDeleteBanner, useUpdateBanner } from '../../../hooks/useContent';
import { useUploadImage } from '../../../hooks/useProducts';

const emptySlide = () => ({ image: '', publicId: '', link: '/' });

const BannerListPage = () => {
    const { data: banners = [], isLoading } = useBanners();
    const addBannerMutation = useAddBanner();
    const deleteBannerMutation = useDeleteBanner();
    const updateBannerMutation = useUpdateBanner();
    const uploadImageMutation = useUploadImage();

    const [slide, setSlide] = useState(emptySlide());

    const canSubmit = useMemo(() => {
        return !!(slide.image && String(slide.image).trim().length > 0);
    }, [slide]);

    const savedSlides = useMemo(() => {
        return banners.flatMap((banner) => {
            if (Array.isArray(banner.slides) && banner.slides.length > 0) {
                return banner.slides.map((slide, slideIndex) => ({
                    bannerId: banner._id || banner.id,
                    slideIndex,
                    image: slide.image || banner.image,
                    publicId: slide.publicId || '',
                    link: slide.link || banner.link || '/',
                    totalSlides: banner.slides.length,
                    isLegacyMultiSlide: true
                }));
            }

            return [{
                bannerId: banner._id || banner.id,
                slideIndex: null,
                image: banner.image,
                publicId: banner.publicId || '',
                link: banner.link || '/',
                totalSlides: 1,
                isLegacyMultiSlide: false
            }];
        });
    }, [banners]);

    const resetSlideForm = () => {
        setSlide(emptySlide());
    };

    const updateSlide = (key, value) => {
        setSlide((prev) => ({ ...prev, [key]: value }));
    };

    const uploadSlideImage = async (file) => {
        if (!file) return;
        try {
            const result = await uploadImageMutation.mutateAsync(file);
            if (!result?.url) {
                toast.error('Image upload failed');
                return;
            }
            setSlide((prev) => ({
                ...prev,
                image: result.url,
                publicId: result.publicId || ''
            }));
        } catch {
            toast.error('Image upload failed');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!canSubmit) {
            toast.error('Please upload image for each slide');
            return;
        }

        const normalizedSlide = {
            image: slide.image,
            publicId: slide.publicId || '',
            link: (slide.link || '/').trim() || '/',
            ctaText: 'Shop Now'
        };

        try {
            await addBannerMutation.mutateAsync({
                title: `Slide ${savedSlides.length + 1}`,
                image: normalizedSlide.image,
                publicId: normalizedSlide.publicId,
                link: normalizedSlide.link,
                ctaText: 'Shop Now',
                section: 'hero',
                isActive: true,
                order: banners.length + 1,
                slides: []
            });
            resetSlideForm();
            toast.success('Slide saved');
        } catch {
            // toast is already handled in hook
        }
    };

    const handleDelete = async (savedSlide) => {
        if (!window.confirm('Delete this banner?')) return;

        try {
            if (savedSlide.isLegacyMultiSlide) {
                const banner = banners.find((item) => String(item._id || item.id) === String(savedSlide.bannerId));
                const remainingSlides = (banner?.slides || []).filter((_, index) => index !== savedSlide.slideIndex);

                if (remainingSlides.length === 0) {
                    await deleteBannerMutation.mutateAsync(savedSlide.bannerId);
                    return;
                }

                await updateBannerMutation.mutateAsync({
                    id: savedSlide.bannerId,
                    data: {
                        ...banner,
                        image: remainingSlides[0]?.image || banner.image,
                        publicId: remainingSlides[0]?.publicId || banner.publicId || '',
                        link: remainingSlides[0]?.link || banner.link || '/',
                        slides: remainingSlides
                    }
                });
                return;
            }

            await deleteBannerMutation.mutateAsync(savedSlide.bannerId);
        } catch {
            // toast is already handled in hook
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
                <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Banner Slides</h1>
                <p className="text-[11px] text-gray-400 font-semibold mt-1">Add one slide at a time with image and link only</p>

                <form onSubmit={handleSave} className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-3 items-center p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="w-[140px] h-[80px] rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                            {slide.image ? (
                                <img src={slide.image} alt="slide" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={20} className="text-gray-300" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Image + Link</label>
                            <div className="flex flex-col md:flex-row gap-2">
                                <label className="relative inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-gray-700 cursor-pointer hover:border-primary/40">
                                    {uploadImageMutation.isPending ? <Loader size={14} className="animate-spin" /> : 'Upload Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => uploadSlideImage(e.target.files?.[0])}
                                    />
                                </label>
                                <input
                                    type="text"
                                    value={slide.link}
                                    onChange={(e) => updateSlide('link', e.target.value)}
                                    placeholder="/ or https://..."
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={resetSlideForm}
                            className="h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center"
                            title="Clear slide"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={addBannerMutation.isPending || !canSubmit}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider disabled:opacity-60"
                        >
                            {addBannerMutation.isPending ? <Loader size={14} className="animate-spin" /> : null}
                            Save Slide
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-footerBg uppercase tracking-tight">Saved Slides</h2>
                    <span className="text-[11px] font-bold text-gray-400">{savedSlides.length} total</span>
                </div>

                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <Loader className="animate-spin text-gray-300" />
                    </div>
                ) : savedSlides.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">No banners yet</div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {savedSlides.map((savedSlide, index) => (
                            <div key={`${savedSlide.bannerId}-${savedSlide.slideIndex ?? 'single'}`} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                                <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                                    <img src={savedSlide.image} alt={`banner-${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-footerBg truncate">{index + 1}. Slide</p>
                                    {savedSlide.link && savedSlide.link !== '/' ? (
                                        <p className="text-xs text-gray-500 truncate">{savedSlide.link}</p>
                                    ) : null}
                                </div>
                                <button
                                    onClick={() => handleDelete(savedSlide)}
                                    className="h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerListPage;
