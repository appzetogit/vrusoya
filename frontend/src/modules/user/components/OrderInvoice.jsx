import React, { useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X, FileText, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetting } from '../../../hooks/useSettings';
import logo from '../../../assets/logo.png';

const formatINR = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(Number(amount || 0));
const INVOICE_BRAND_NAME = 'Vrusoya';

const OrderInvoice = ({ order, isOpen, onClose }) => {
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice_${order?.id}`,
    });
    const onPrintClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof handlePrint === 'function') {
            handlePrint();
        }
    };

    const { data: invoiceSettingsSetting } = useSetting('invoice_settings');
    const { data: checkoutFeeSetting } = useSetting('checkout_fee_config');
    const invoiceSettings = invoiceSettingsSetting?.value || {};

    useEffect(() => {
        if (!isOpen) return undefined;

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyPosition = document.body.style.position;
        const originalBodyTop = document.body.style.top;
        const originalBodyWidth = document.body.style.width;
        const originalRootOverflow = document.getElementById('root')?.style.overflow;
        const originalRootHeight = document.getElementById('root')?.style.height;
        const scrollY = window.scrollY;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        const rootEl = document.getElementById('root');
        if (rootEl) {
            rootEl.style.overflow = 'hidden';
            rootEl.style.height = '100vh';
        }

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.position = originalBodyPosition;
            document.body.style.top = originalBodyTop;
            document.body.style.width = originalBodyWidth;
            if (rootEl) {
                rootEl.style.overflow = originalRootOverflow || '';
                rootEl.style.height = originalRootHeight || '';
            }
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    if (!order) return null;

    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = Number(order.discount || 0);
    const shipping = Number(order.deliveryCharges || 0);
    const rawPaymentHandlingFee = Number(order.additionalFees?.paymentHandlingFee ?? 0);
    const rawPlatformFee = Number(order.additionalFees?.platformFee ?? 0);
    const rawHandlingFee = Number(order.additionalFees?.handlingFee ?? 0);
    const rawFeesSum = rawPaymentHandlingFee + rawPlatformFee + rawHandlingFee;
    const gstPercentage = Number((order.gstPercentage ?? checkoutFeeSetting?.value?.gstPercentage) || 0);
    const gstAmount = Math.round(Number(
        order.gstAmount ?? ((Math.max(0, subtotal - discount) * gstPercentage) / 100)
    ));
    const total = Number(order.amount || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const inferredHiddenFees = Math.max(
        0,
        Math.round(total - (taxableAmount + gstAmount + shipping + rawFeesSum))
    );
    const configuredPaymentFee = Number(
        checkoutFeeSetting?.value?.applyPaymentHandlingFee === false ? 0 : (checkoutFeeSetting?.value?.paymentHandlingFee || 0)
    );
    const configuredPlatformFee = Number(
        checkoutFeeSetting?.value?.applyPlatformFee === false ? 0 : (checkoutFeeSetting?.value?.platformFee || 0)
    );
    const configuredHandlingFee = Number(
        checkoutFeeSetting?.value?.applyHandlingFee === false ? 0 : (checkoutFeeSetting?.value?.handlingFee || 0)
    );
    const configuredFeesSum = configuredPaymentFee + configuredPlatformFee + configuredHandlingFee;
    const canUseSettingsFallback = rawFeesSum === 0
        && inferredHiddenFees > 0
        && configuredFeesSum > 0
        && Math.round(configuredFeesSum) === Math.round(inferredHiddenFees);
    const paymentHandlingFee = rawPaymentHandlingFee > 0 ? rawPaymentHandlingFee : (canUseSettingsFallback ? configuredPaymentFee : 0);
    const platformFee = rawPlatformFee > 0 ? rawPlatformFee : (canUseSettingsFallback ? configuredPlatformFee : 0);
    const handlingFee = rawHandlingFee > 0 ? rawHandlingFee : (canUseSettingsFallback ? configuredHandlingFee : 0);
    const otherFees = (!canUseSettingsFallback && rawFeesSum === 0) ? inferredHiddenFees : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10020] flex items-end md:items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-4xl max-h-[92dvh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header Actions */}
                        <div className="flex items-start md:items-center justify-between gap-2 px-3 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-start md:items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText size={16} className="md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-lg font-black text-footerBg tracking-tight uppercase">Tax Invoice</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Hash size={10} className="md:w-3 md:h-3 text-primary font-bold" />
                                        <p className="text-[9px] md:text-[11px] font-black text-footerBg tracking-widest uppercase break-all">Order {order.id}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={onPrintClick}
                                    className="flex items-center gap-1.5 min-h-[40px] min-w-[40px] px-2.5 md:px-4 py-2 bg-white border border-gray-200 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm select-none touch-manipulation"
                                >
                                    <Printer size={14} className="md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Print</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 transition-colors border border-transparent rounded-lg md:rounded-xl text-slate-400 hover:text-footerBg hover:bg-gray-100"
                                >
                                    <X size={20} className="md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Invoice Content */}
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 md:p-8 bg-white touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                            <div ref={componentRef} className="bg-white p-3 sm:p-5 md:p-12 text-slate-800 font-sans min-w-0">
                                {/* Branding & Official Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-5 mb-6 md:mb-12">
                                    <div className="space-y-3 md:space-y-4">
                                        <img src={logo} alt="Vrusoya" className="h-10 md:h-12 w-auto object-contain" />
                                        <div className="space-y-1">
                                            <h1 className="text-lg md:text-2xl font-black text-footerBg uppercase tracking-tighter">{INVOICE_BRAND_NAME}</h1>
                                            <p className="text-[10px] md:text-[11px] text-slate-500 max-w-[240px] leading-relaxed">
                                                {invoiceSettings.companyOfficeAddress || "Premium Quality Farm Fresh Products"}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">GSTIN: {invoiceSettings.gstNumber || "19ABCDE1234F1Z5"}</p>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto sm:text-right">
                                        <div className="inline-block px-3 md:px-4 py-1 rounded-full bg-green-50 text-green-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4 border border-green-100">
                                            Official Invoice
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Order ID</p>
                                                <p className="text-sm font-black text-footerBg">{order.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Date</p>
                                                <p className="text-sm font-black text-footerBg">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Addresses Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-12 mb-6 md:mb-12 pt-5 md:pt-8 border-t border-gray-100">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Billing & Shipping To</h4>
                                        <p className="text-sm font-black text-footerBg mb-1">{order.shippingAddress.fullName}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                            {order.shippingAddress.address}<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.pincode}<br />
                                            Phone: {order.shippingAddress.phone}
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Payment Info</h4>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-footerBg uppercase tracking-tighter">
                                                Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                            </p>
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-tighter">
                                                Status: {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                                            </p>
                                            {order.razorpay_payment_id && (
                                                <p className="text-[10px] text-slate-400 font-mono">TXN: {order.razorpay_payment_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-6 md:mb-12 overflow-x-auto">
                                    <table className="w-full min-w-[520px] sm:min-w-0">
                                        <thead>
                                            <tr className="border-b-2 border-slate-900">
                                                <th className="text-left py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                                                <th className="text-center py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                                <th className="text-right py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                                <th className="text-right py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {order.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="py-4">
                                                        <p className="text-sm font-black text-footerBg">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Product ID: {item.productId?.slice(-6).toUpperCase() || 'N/A'}</p>
                                                    </td>
                                                    <td className="py-4 text-center text-sm font-bold text-slate-600">{item.qty}</td>
                                                    <td className="py-4 text-right text-sm font-bold text-slate-600">{formatINR(item.price)}</td>
                                                    <td className="py-4 text-right text-sm font-black text-footerBg">{formatINR(item.price * item.qty)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals Summary */}
                                <div className="flex justify-end pt-5 md:pt-8 border-t border-gray-100">
                                    <div className="w-full sm:max-w-[280px] space-y-2.5 md:space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                            <span className="font-bold text-footerBg">{formatINR(subtotal)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-green-500 uppercase tracking-widest">Discount</span>
                                                <span className="font-bold text-green-500 text-xs">-{formatINR(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-400 uppercase tracking-widest">Shipping</span>
                                            <span className="font-bold text-footerBg">{formatINR(shipping)}</span>
                                        </div>
                                        {gstAmount > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">GST ({gstPercentage}%)</span>
                                                <span className="font-bold text-footerBg">{formatINR(gstAmount)}</span>
                                            </div>
                                        )}
                                        {paymentHandlingFee > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">Payment Handling Fee</span>
                                                <span className="font-bold text-footerBg">{formatINR(paymentHandlingFee)}</span>
                                            </div>
                                        )}
                                        {platformFee > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">Platform Fee</span>
                                                <span className="font-bold text-footerBg">{formatINR(platformFee)}</span>
                                            </div>
                                        )}
                                        {handlingFee > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">Handling Fee</span>
                                                <span className="font-bold text-footerBg">{formatINR(handlingFee)}</span>
                                            </div>
                                        )}
                                        {otherFees > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-400 uppercase tracking-widest">Other Checkout Fees</span>
                                                <span className="font-bold text-footerBg">{formatINR(otherFees)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
                                            <span className="text-sm font-black text-footerBg uppercase tracking-widest">Total</span>
                                            <span className="text-xl font-black text-footerBg">{formatINR(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="mt-8 md:mt-20 pt-6 md:pt-8 border-t border-gray-100 text-center">
                                    <p className="text-xs font-bold text-footerBg uppercase tracking-widest mb-1 italic">Thank you for shopping with Vrusoya!</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-lg mx-auto">
                                        This is a computer-generated document. No signature is required.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderInvoice;
