import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBanners, useAddBanner, useDeleteBanner } from '../../../hooks/useContent';
import { useUploadImage } from '../../../hooks/useProducts';

const emptySlide = () => ({ image: '', publicId: '', link: '/' });

const BannerListPage = () => {
    const { data: banners = [], isLoading } = useBanners();
    const addBannerMutation = useAddBanner();
    const deleteBannerMutation = useDeleteBanner();
    const uploadImageMutation = useUploadImage();

    const [slides, setSlides] = useState([emptySlide()]);

    const canSubmit = useMemo(() => {
        if (slides.length === 0) return false;
        return slides.every((slide) => slide.image && String(slide.image).trim().length > 0);
    }, [slides]);

    const addSlideRow = () => {
        setSlides((prev) => [...prev, emptySlide()]);
    };

    const removeSlideRow = (index) => {
        setSlides((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    const updateSlide = (index, key, value) => {
        setSlides((prev) => prev.map((slide, i) => (i === index ? { ...slide, [key]: value } : slide)));
    };

    const uploadSlideImage = async (index, file) => {
        if (!file) return;
        try {
            const result = await uploadImageMutation.mutateAsync(file);
            if (!result?.url) {
                toast.error('Image upload failed');
                return;
            }
            setSlides((prev) => prev.map((slide, i) => (
                i === index
                    ? { ...slide, image: result.url, publicId: result.publicId || '' }
                    : slide
            )));
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

        const normalizedSlides = slides.map((slide) => ({
            image: slide.image,
            publicId: slide.publicId || '',
            link: (slide.link || '/').trim() || '/',
            ctaText: 'Shop Now'
        }));

        const payload = {
            title: 'Slides',
            image: normalizedSlides[0].image,
            publicId: normalizedSlides[0].publicId,
            link: normalizedSlides[0].link,
            ctaText: 'Shop Now',
            section: 'hero',
            isActive: true,
            order: banners.length + 1,
            slides: normalizedSlides
        };

        try {
            await addBannerMutation.mutateAsync(payload);
            setSlides([emptySlide()]);
        } catch {
            // toast is already handled in hook
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        deleteBannerMutation.mutate(id);
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
                <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Banner Slides</h1>
                <p className="text-[11px] text-gray-400 font-semibold mt-1">Add slides with image and link only</p>

                <form onSubmit={handleSave} className="mt-5 space-y-4">
                    {slides.map((slide, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-3 items-center p-3 rounded-xl border border-gray-100 bg-gray-50">
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
                                            onChange={(e) => uploadSlideImage(index, e.target.files?.[0])}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        value={slide.link}
                                        onChange={(e) => updateSlide(index, 'link', e.target.value)}
                                        placeholder="/ or https://..."
                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeSlideRow(index)}
                                disabled={slides.length === 1}
                                className="h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                title="Remove slide"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}

                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="button"
                            onClick={addSlideRow}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-wider"
                        >
                            <Plus size={14} /> Add Slide
                        </button>
                        <button
                            type="submit"
                            disabled={addBannerMutation.isPending || !canSubmit}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider disabled:opacity-60"
                        >
                            {addBannerMutation.isPending ? <Loader size={14} className="animate-spin" /> : null}
                            Save Slides
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-footerBg uppercase tracking-tight">Saved Banners</h2>
                    <span className="text-[11px] font-bold text-gray-400">{banners.length} total</span>
                </div>

                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <Loader className="animate-spin text-gray-300" />
                    </div>
                ) : banners.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">No banners yet</div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {banners.map((banner) => (
                            <div key={banner._id || banner.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                                <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                                    <img src={banner.image || banner.slides?.[0]?.image} alt="banner" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-footerBg truncate">{banner.slides?.length || 1} slide(s)</p>
                                    <p className="text-xs text-gray-500 truncate">{banner.link || banner.slides?.[0]?.link || '/'}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(banner._id || banner.id)}
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
