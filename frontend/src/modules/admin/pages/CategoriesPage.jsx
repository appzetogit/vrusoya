import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/apiUrl';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Layers,
    Image as ImageIcon,
    Upload,
    Loader,
    CheckCircle2,
    EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import Pagination from '../components/Pagination';

const CategoriesPage = () => {
    const queryClient = useQueryClient();
    const refreshCategories = () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
    };

    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [newItem, setNewItem] = useState({
        name: '',
        slug: '',
        image: '',
        status: 'Active',
        showInNavbar: true,
        showInShopByCategory: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories`);
            const data = await res.json();

            if (res.ok) {
                setSubCategories(data);
            } else {
                toast.error(data.message || 'Failed to load categories');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Image upload failed');
        return data.url;
    };

    const handleSubmit = async (e, isEdit = false) => {
        e.preventDefault();
        setSubmitLoading(true);
        const toastId = toast.loading(isEdit ? 'Updating...' : 'Creating...');

        try {
            const method = isEdit ? 'PUT' : 'POST';
            const targetId = editingSub?._id || editingSub?.id;
            const url = isEdit
                ? `${API_BASE_URL}/categories/${targetId}`
                : `${API_BASE_URL}/categories`;

            const source = isEdit ? editingSub : newItem;
            let imageUrl = source.image || '';
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }
            const finalSlug = (source.slug || source.name)
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-');

            const payload = {
                name: source.name,
                slug: finalSlug,
                image: imageUrl,
                status: source.status,
                showInNavbar: source.showInNavbar,
                showInShopByCategory: source.showInShopByCategory
            };

            if (!payload.name?.trim()) {
                throw new Error('Category name is required');
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(isEdit ? 'Category updated' : 'Category created', { id: toastId });
                fetchData();
                refreshCategories();
                setCurrentPage(1);
                setShowAddModal(false);
                setEditingSub(null);
                setNewItem({ name: '', slug: '', image: '', status: 'Active', showInNavbar: true, showInShopByCategory: true });
                setImageFile(null);
                setPreview(null);
            } else {
                toast.error(data.message || 'Operation failed', { id: toastId });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to save', { id: toastId });
        } finally {
            setSubmitLoading(false);
        }
    };

    const toggleSubStatus = async (sub) => {
        const newStatus = sub.status === 'Active' ? 'Hidden' : 'Active';
        try {
            const res = await fetch(`${API_BASE_URL}/categories/${sub._id || sub.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sub.name,
                    slug: sub.slug,
                    status: newStatus,
                    showInNavbar: sub.showInNavbar,
                    showInShopByCategory: sub.showInShopByCategory
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Status changed to ${newStatus}`);
                fetchData();
                refreshCategories();
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Deleted');
                setSubCategories((prev) => prev.filter((s) => (s._id || s.id) !== id));
                refreshCategories();
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting');
        }
    };

    const filteredSubs = useMemo(() => {
        const getObjectIdMs = (value) => {
            const id = String(value || '');
            if (!/^[a-f\d]{24}$/i.test(id)) return 0;
            const seconds = parseInt(id.slice(0, 8), 16);
            return Number.isFinite(seconds) ? seconds * 1000 : 0;
        };

        const getCreatedMs = (sub) => {
            const created = new Date(sub.createdAt || 0).getTime();
            if (Number.isFinite(created) && created > 0) return created;
            return getObjectIdMs(sub._id || sub.id);
        };

        return subCategories
            .filter((sub) => {
                const matchesSearch =
                    sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.slug?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const createdDiff = getCreatedMs(b) - getCreatedMs(a);
                if (createdDiff !== 0) return createdDiff;
                return getObjectIdMs(b._id || b.id) - getObjectIdMs(a._id || a.id);
            });
    }, [subCategories, searchTerm, statusFilter]);

    const paginatedSubs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSubs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSubs, currentPage]);

    const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);

    return (
        <div className="space-y-8 font-['Inter']">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Category Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        setNewItem({ name: '', slug: '', image: '', status: 'Active', showInNavbar: true, showInShopByCategory: true });
                        setImageFile(null);
                        setPreview(null);
                        setShowAddModal(true);
                    }}
                    className="bg-[#2c5336] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#1f3b26] transition-all shadow-lg shadow-[#2c5336]/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Categories</p>
                            <p className="text-2xl font-black text-footerBg">{subCategories.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <Layers size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Levels</p>
                            <p className="text-2xl font-black text-footerBg">{subCategories.filter((s) => s.status === 'Active').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hidden Levels</p>
                            <p className="text-2xl font-black text-footerBg">{subCategories.filter((s) => s.status !== 'Active').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                            <EyeOff size={22} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                    />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['All', 'Active', 'Hidden'].map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setStatusFilter(s);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-[#2c5336] shadow-sm' : 'text-gray-400 hover:text-footerBg'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center"><Loader className="animate-spin inline-block text-gray-300" /></div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead className="py-3 text-gray-600">Category</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600">Image</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600">Slug</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600">Products</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600">Navbar</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600">Shop Strip</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600">Status</AdminTableHead>
                            <AdminTableHead className="py-3 text-gray-600 text-right">Actions</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {paginatedSubs.map((sub) => (
                                <AdminTableRow key={sub._id || sub.id} className="hover:bg-gray-50">
                                    <AdminTableCell className="py-3">
                                        <span className="font-medium text-gray-900 text-sm">{sub.name}</span>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3">
                                        <div className="w-11 h-11 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {sub.image ? (
                                                <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={14} className="text-gray-300" />
                                            )}
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3">
                                        <span className="text-xs text-gray-600 font-mono">{sub.slug || '-'}</span>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3">
                                        <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                                            {sub.productCount || 0}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sub.showInNavbar ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                            {sub.showInNavbar ? 'Yes' : 'No'}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sub.showInShopByCategory ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                            {sub.showInShopByCategory ? 'Yes' : 'No'}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3">
                                        <button
                                            onClick={() => toggleSubStatus(sub)}
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex w-fit items-center gap-1.5 transition-all ${sub.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                        >
                                            {sub.status === 'Active' ? <CheckCircle2 size={10} strokeWidth={3} /> : <EyeOff size={10} strokeWidth={3} />}
                                            {sub.status}
                                        </button>
                                    </AdminTableCell>
                                    <AdminTableCell className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setPreview(null);
                                                    setEditingSub({
                                                        ...sub,
                                                        slug: sub.slug || '',
                                                        image: sub.image || '',
                                                        showInNavbar: sub.showInNavbar ?? true,
                                                        showInShopByCategory: sub.showInShopByCategory ?? true
                                                    });
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub._id || sub.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))}
                            {paginatedSubs.length === 0 && (
                                <AdminTableRow>
                                    <AdminTableCell colSpan="8" className="px-6 py-8 text-center text-sm text-gray-400">
                                        No categories found
                                    </AdminTableCell>
                                </AdminTableRow>
                            )}
                        </AdminTableBody>
                    </AdminTable>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredSubs.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}

            {(showAddModal || editingSub) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingSub(null); setImageFile(null); setPreview(null); }} />
                    <div className="bg-white rounded-[1.5rem] w-full max-w-[460px] relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-sm font-black text-footerBg uppercase tracking-tight">{editingSub ? 'Edit Category' : 'New Category'}</h2>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Standalone category</p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setEditingSub(null); setImageFile(null); setPreview(null); }} className="p-1">
                                <Plus size={16} className="rotate-45 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={(e) => handleSubmit(e, !!editingSub)} className="p-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Image</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                                        {(preview || (editingSub ? editingSub.image : newItem.image)) ? (
                                            <img
                                                src={preview || (editingSub ? editingSub.image : newItem.image)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon size={18} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-black text-footerBg uppercase tracking-widest hover:bg-white"
                                        >
                                            <span className="inline-flex items-center gap-2"><Upload size={12} /> Upload Image</span>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editingSub ? editingSub.name : newItem.name}
                                    onChange={(e) => editingSub ? setEditingSub({ ...editingSub, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-[#2c5336]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Slug (Optional)</label>
                                <input
                                    type="text"
                                    value={editingSub ? editingSub.slug : newItem.slug}
                                    onChange={(e) => editingSub ? setEditingSub({ ...editingSub, slug: e.target.value }) : setNewItem({ ...newItem, slug: e.target.value })}
                                    placeholder="auto-generated if empty"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-[#2c5336]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Status</label>
                                    <select
                                        value={editingSub ? editingSub.status : newItem.status}
                                        onChange={(e) => editingSub ? setEditingSub({ ...editingSub, status: e.target.value }) : setNewItem({ ...newItem, status: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-[10px] font-bold text-footerBg outline-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Hidden">Hidden</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer self-end">
                                    <input
                                        type="checkbox"
                                        checked={editingSub ? editingSub.showInNavbar : newItem.showInNavbar}
                                        onChange={(e) => editingSub ? setEditingSub({ ...editingSub, showInNavbar: e.target.checked }) : setNewItem({ ...newItem, showInNavbar: e.target.checked })}
                                        className="w-3.5 h-3.5 text-[#2c5336] rounded focus:ring-[#2c5336]"
                                    />
                                    <span className="text-[9px] font-black text-footerBg uppercase">In Navbar</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer self-end">
                                    <input
                                        type="checkbox"
                                        checked={editingSub ? editingSub.showInShopByCategory : newItem.showInShopByCategory}
                                        onChange={(e) => editingSub ? setEditingSub({ ...editingSub, showInShopByCategory: e.target.checked }) : setNewItem({ ...newItem, showInShopByCategory: e.target.checked })}
                                        className="w-3.5 h-3.5 text-[#2c5336] rounded focus:ring-[#2c5336]"
                                    />
                                    <span className="text-[9px] font-black text-footerBg uppercase">In Shop Strip</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="w-full bg-[#2c5336] text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#1f3b26] disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {submitLoading && <Loader size={12} className="animate-spin" />}
                                {editingSub ? 'Save' : 'Create'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
