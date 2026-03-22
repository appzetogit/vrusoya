import React, { useEffect, useMemo, useState } from 'react';
import { Mail, MessageSquare, Phone, Search, Loader2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';
import { useAuth } from '../../../context/AuthContext';
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from '../components/AdminTable';
import { AnimatePresence, motion } from 'framer-motion';
import Pagination from '../components/Pagination';

const statusStyles = {
    new: 'bg-amber-50 text-amber-700 border-amber-200',
    reviewed: 'bg-sky-50 text-sky-700 border-sky-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

const EnquiriesPage = () => {
    const { getAuthHeaders } = useAuth();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/enquiries`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch enquiries');
            }

            const data = await response.json();
            setEnquiries(data);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch enquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const filteredEnquiries = useMemo(() => {
        return enquiries.filter((enquiry) => {
            const matchesSearch = [enquiry.name, enquiry.email, enquiry.phone, enquiry.company, enquiry.message]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || enquiry.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [enquiries, searchTerm, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / itemsPerPage));

    const paginatedEnquiries = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        return filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEnquiries, page]);

    const handleStatusChange = async (id, status) => {
        setUpdatingId(id);
        try {
            const response = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update enquiry');
            }

            setEnquiries((current) => current.map((item) => (
                item._id === id ? { ...item, status: data.status } : item
            )));
            toast.success('Enquiry status updated');
        } catch (error) {
            toast.error(error.message || 'Failed to update enquiry');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-8 font-['Inter']">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Enquiries</h1>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Contact form submissions</p>
                </div>
                <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    {filteredEnquiries.length} active rows
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, phone..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:border-primary focus:bg-white"
                    />
                </div>

                <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1">
                    {['all', 'new', 'reviewed', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead>Sender</AdminTableHead>
                        <AdminTableHead>Contact</AdminTableHead>
                        <AdminTableHead>Company</AdminTableHead>
                        <AdminTableHead>Date</AdminTableHead>
                        <AdminTableHead>Status</AdminTableHead>
                        <AdminTableHead className="text-right">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {loading ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                        <Loader2 size={28} className="animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Loading enquiries...</span>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : filteredEnquiries.length === 0 ? (
                            <AdminTableRow>
                                <AdminTableCell colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                                        <MessageSquare size={28} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No enquiries found</span>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        ) : paginatedEnquiries.map((enquiry) => (
                            <AdminTableRow key={enquiry._id}>
                                <AdminTableCell className="whitespace-normal">
                                    <div className="min-w-[180px]">
                                        <p className="text-sm font-black text-footerBg">{enquiry.name}</p>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="whitespace-normal">
                                    <div className="min-w-[220px] space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail size={14} className="text-primary" />
                                            <span>{enquiry.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone size={14} className="text-primary" />
                                            <span>{enquiry.phone}</span>
                                        </div>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="whitespace-normal">
                                    <span className="text-sm font-semibold text-gray-600">{enquiry.company || '-'}</span>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <span className="text-sm font-semibold text-gray-500">
                                        {new Date(enquiry.createdAt).toLocaleDateString()}
                                    </span>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <select
                                        value={enquiry.status}
                                        onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                                        disabled={updatingId === enquiry._id}
                                        className={`min-w-[120px] rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider outline-none ${statusStyles[enquiry.status] || statusStyles.new}`}
                                    >
                                        <option value="new">New</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </AdminTableCell>
                                <AdminTableCell className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEnquiry(enquiry)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary transition-all hover:bg-primary hover:text-white"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </AdminTableCell>
                            </AdminTableRow>
                        ))}
                    </AdminTableBody>
                </AdminTable>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={filteredEnquiries.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            <AnimatePresence>
                {selectedEnquiry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEnquiry(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-gray-100 bg-white shadow-2xl"
                        >
                            <div className="flex items-start justify-between border-b border-gray-100 p-6">
                                <div>
                                    <h2 className="text-xl font-black text-footerBg">Enquiry Details</h2>
                                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                                        Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedEnquiry(null)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="grid gap-6 p-6 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Name</p>
                                    <p className="text-base font-bold text-footerBg">{selectedEnquiry.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Company</p>
                                    <p className="text-base font-bold text-footerBg">{selectedEnquiry.company || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Email</p>
                                    <p className="text-sm font-semibold text-gray-600 break-all">{selectedEnquiry.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Phone</p>
                                    <p className="text-sm font-semibold text-gray-600">{selectedEnquiry.phone}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Status</p>
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusStyles[selectedEnquiry.status] || statusStyles.new}`}>
                                        {selectedEnquiry.status}
                                    </span>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Message</p>
                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{selectedEnquiry.message}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnquiriesPage;
