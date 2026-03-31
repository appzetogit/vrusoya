import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import {
    ArrowLeft,
    Download,
    Calendar
} from 'lucide-react';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

import { useProducts } from '../../../hooks/useProducts';
import { useAllOrders } from '../../../hooks/useOrders';

const InventoryReportsPage = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [activeTab, setActiveTab] = useState('category'); // 'category' or 'sku'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: orders = [], isLoading: loadingOrders } = useAllOrders();

    const isLoading = loadingProducts || loadingOrders;

    const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

    const getOrderDate = (order) => {
        const rawDate = order?.createdAt || order?.date;
        const parsedDate = rawDate ? new Date(rawDate) : null;
        return parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
    };

    const getProductStock = (product) => {
        const variants = Array.isArray(product?.variants) ? product.variants : [];
        if (variants.length > 0) {
            return variants.reduce((sum, variant) => sum + Number(variant?.stock || 0), 0);
        }
        return Number(product?.stock?.quantity || 0);
    };

    const getProductValue = (product) => {
        const variants = Array.isArray(product?.variants) ? product.variants : [];
        if (variants.length > 0) {
            return variants.reduce(
                (sum, variant) => sum + (Number(variant?.stock || 0) * Number(variant?.price || 0)),
                0
            );
        }
        return Number(product?.stock?.quantity || 0) * Number(product?.price || 0);
    };

    const getProductImage = (product) =>
        product?.image ||
        product?.imageUrl ||
        product?.images?.[0] ||
        'https://placehold.co/100x100/png';

    const findProductMatch = (item) => {
        const itemId = String(item?.id || '');
        const productId = String(item?.productId || '');

        for (const product of products) {
            const normalizedProductId = String(product?._id || product?.id || '');
            const variants = Array.isArray(product?.variants) ? product.variants : [];
            const matchedVariant = variants.find((variant) => String(variant?.id || variant?._id || '') === itemId);

            if (matchedVariant) {
                return { product, variant: matchedVariant };
            }

            if (productId && normalizedProductId === productId) {
                const variantByWeight = variants.find(
                    (variant) => String(variant?.weight || '').trim() === String(item?.weight || '').trim()
                );
                return { product, variant: variantByWeight || null };
            }

            if (normalizedProductId && normalizedProductId === itemId) {
                return { product, variant: null };
            }
        }

        return { product: null, variant: null };
    };

    const filteredOrders = useMemo(() => {
        const now = new Date();
        let startDate = null;
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (dateRange === 'Last 7 Days') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        } else if (dateRange === 'Last 30 Days') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
        } else if (dateRange === 'Last 90 Days') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
        } else if (dateRange === 'Custom') {
            if (!customDateRange.startDate || !customDateRange.endDate) return [];
            startDate = new Date(customDateRange.startDate);
            endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
        }

        if (!startDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return [];
        }

        return orders.filter((order) => {
            const orderDate = getOrderDate(order);
            return (
                normalizeStatus(order?.status) !== 'cancelled' &&
                orderDate &&
                orderDate >= startDate &&
                orderDate <= endDate
            );
        });
    }, [orders, dateRange, customDateRange]);

    // Valuation Logic
    const valuationData = useMemo(() => {
        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = { id: cat, category: cat, items: 0, totalStock: 0, value: 0 };
            }
            const stock = getProductStock(p);
            const value = getProductValue(p);

            categories[cat].items += 1;
            categories[cat].totalStock += stock;
            categories[cat].value += value;
        });
        return Object.values(categories).sort((a, b) => b.value - a.value);
    }, [products]);

    // Sales Logic
    const productSalesData = useMemo(() => {
        const sales = {};
        filteredOrders.forEach(order => {
            order.items?.forEach(item => {
                const { product, variant } = findProductMatch(item);
                const baseId = String(item?.productId || product?._id || product?.id || item?.id || item?.name);
                const variantId = String(variant?.id || variant?._id || item?.id || '');
                const salesKey = variantId ? `${baseId}::${variantId}` : baseId;

                if (!sales[salesKey]) {
                    const productName = product?.name || item?.name || 'Unnamed Product';
                    const weightLabel = variant?.weight || item?.weight;

                    sales[salesKey] = {
                        id: salesKey,
                        name: weightLabel ? `${productName} (${weightLabel})` : productName,
                        category: product?.category || 'Uncategorized',
                        unitsSold: 0,
                        revenue: 0,
                        image: item?.image || getProductImage(product)
                    };
                }

                sales[salesKey].unitsSold += Number(item?.qty || 0);
                sales[salesKey].revenue += Number(item?.qty || 0) * Number(item?.price || 0);
            });
        });

        return Object.values(sales)
            .map(s => ({
                ...s,
                avgPrice: s.unitsSold > 0 ? s.revenue / s.unitsSold : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [filteredOrders, products]);

    const totalInventoryValue = valuationData.reduce((sum, item) => sum + item.value, 0);
    const totalItemsInStock = valuationData.reduce((sum, item) => sum + item.totalStock, 0);
    const topCategory = valuationData[0]?.category || 'N/A';

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const exportRows = useMemo(() => {
        if (activeTab === 'category') {
            return valuationData.map((row) => ({
                Category: row.category,
                'Unique Products': row.items,
                'Total Quantity': row.totalStock,
                'Estimated Value': row.value
            }));
        }

        return productSalesData.map((row) => ({
            'Product Name': row.name,
            Category: row.category,
            'Units Sold': row.unitsSold,
            'Average Price': row.avgPrice,
            'Total Revenue': row.revenue
        }));
    }, [activeTab, valuationData, productSalesData]);

    const handleExport = () => {
        if (exportRows.length === 0) return;

        const headers = Object.keys(exportRows[0]);
        const csvContent = [
            headers.join(','),
            ...exportRows.map((row) =>
                headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const tabSlug = activeTab === 'category' ? 'category-report' : 'sku-report';
        const dateSlug = new Date().toISOString().slice(0, 10);

        downloadLink.href = url;
        downloadLink.download = `inventory-${tabSlug}-${dateSlug}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

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
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Stock Valuation</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Real-time inventory value report</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select
                                value={dateRange}
                                onChange={(e) => {
                                    setDateRange(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 focus:outline-none focus:border-black"
                            >
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>Custom</option>
                            </select>
                        </div>
                        {dateRange === 'Custom' && (
                            <>
                                <input
                                    type="date"
                                    value={customDateRange.startDate}
                                    onChange={(e) => {
                                        setCustomDateRange((prev) => ({ ...prev, startDate: e.target.value }));
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold focus:outline-none focus:border-black"
                                />
                                <input
                                    type="date"
                                    value={customDateRange.endDate}
                                    onChange={(e) => {
                                        setCustomDateRange((prev) => ({ ...prev, endDate: e.target.value }));
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold focus:outline-none focus:border-black"
                                />
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportRows.length === 0}
                        className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => { setActiveTab('category'); setCurrentPage(1); }}
                    className={`px-6 py-3 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'category'
                        ? 'border-black text-black bg-gray-50'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                        }`}
                >
                    📊 Category-wise Report
                </button>
                <button
                    onClick={() => { setActiveTab('sku'); setCurrentPage(1); }}
                    className={`px-6 py-3 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'sku'
                        ? 'border-black text-black bg-gray-50'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                        }`}
                >
                    📦 SKU-wise Sales
                </button>
            </div>

            {/* Report Content - Category View */}
            {activeTab === 'category' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                <p className="text-xs font-bold text-green-600 uppercase mb-2">Total Inventory Value</p>
                                <h3 className="text-3xl font-black text-green-900">{formatCurrency(totalInventoryValue)}</h3>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-2">Total Items in Stock</p>
                                <h3 className="text-3xl font-black text-blue-900">{totalItemsInStock.toLocaleString()}</h3>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                <p className="text-xs font-bold text-purple-600 uppercase mb-2">Top Category</p>
                                <h3 className="text-xl font-black text-purple-900">{topCategory}</h3>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <AdminTable>
                                <AdminTableHeader>
                                    <AdminTableHead>Category</AdminTableHead>
                                    <AdminTableHead className="text-center">Unique Products</AdminTableHead>
                                    <AdminTableHead className="text-center">Total Quantity</AdminTableHead>
                                    <AdminTableHead className="text-right">Estimated Value</AdminTableHead>
                                </AdminTableHeader>
                                <AdminTableBody>
                                    {valuationData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row) => (
                                        <AdminTableRow key={row.id}>
                                            <AdminTableCell>
                                                <span className="font-bold text-sm text-gray-900">{row.category}</span>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-center">
                                                <span className="text-sm text-gray-600">{row.items}</span>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-center">
                                                <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{row.totalStock} units</span>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-right">
                                                <span className="font-black text-sm text-gray-900">{formatCurrency(row.value)}</span>
                                            </AdminTableCell>
                                        </AdminTableRow>
                                    ))}
                                </AdminTableBody>
                            </AdminTable>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(valuationData.length / itemsPerPage)}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            totalItems={valuationData.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                </div>
            )}

            {/* Product Sales Report - SKU View */}
            {activeTab === 'sku' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Product Sales Report</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Top selling products and revenue for the selected date range</p>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Total Revenue (All Products)</p>
                                <h3 className="text-3xl font-black text-emerald-900">
                                    {formatCurrency(productSalesData.reduce((sum, p) => sum + p.revenue, 0))}
                                </h3>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-2">Total Units Sold</p>
                                <h3 className="text-3xl font-black text-blue-900">
                                    {productSalesData.reduce((sum, p) => sum + p.unitsSold, 0).toLocaleString()}
                                </h3>
                            </div>
                        </div>

                        {/* Product Sales Table */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <AdminTable>
                                <AdminTableHeader>
                                    <AdminTableHead>Product Name</AdminTableHead>
                                    <AdminTableHead>Category</AdminTableHead>
                                    <AdminTableHead className="text-center">Units Sold</AdminTableHead>
                                    <AdminTableHead className="text-center">Avg Price</AdminTableHead>
                                    <AdminTableHead className="text-right">Total Revenue</AdminTableHead>
                                </AdminTableHeader>
                                <AdminTableBody>
                                    {productSalesData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                                        <AdminTableRow key={product.id}>
                                            <AdminTableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                        <img src={product.image} className="w-full h-full object-contain" alt="" />
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-900">{product.name}</span>
                                                </div>
                                            </AdminTableCell>
                                            <AdminTableCell>
                                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">
                                                    {product.category}
                                                </span>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-center">
                                                <span className="text-sm font-bold text-gray-900">{product.unitsSold}</span>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-center">
                                                <span className="text-sm text-gray-600">{formatCurrency(product.avgPrice)}</span>
                                            </AdminTableCell>
                                            <AdminTableCell className="text-right">
                                                <span className="font-black text-sm text-emerald-600">{formatCurrency(product.revenue)}</span>
                                            </AdminTableCell>
                                        </AdminTableRow>
                                    ))}
                                </AdminTableBody>
                            </AdminTable>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(productSalesData.length / itemsPerPage)}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            totalItems={productSalesData.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryReportsPage;
