import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

const SupportPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white py-6 px-4 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-footerBg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>

                <div className="text-center mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Support</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-footerBg uppercase tracking-tight">Need Help?</h1>
                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm md:text-base leading-7">
                        For any questions about Vrushahi, orders, policies, or website support, reach out to our team and we will help you quickly.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
                        <h2 className="text-xl font-black text-footerBg uppercase tracking-tight mb-4">Support Contact</h2>
                        <div className="space-y-4 text-gray-700 leading-7">
                            <p>
                                Reach our support team for website enquiries, product questions, order status, or any general assistance.
                                We’re available to help you with every step of your Vrushahi experience.
                            </p>
                            <div className="flex items-start gap-3">
                                <div className="p-3 rounded-2xl bg-white border border-gray-200 text-footerBg">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Email</p>
                                    <p className="text-base font-semibold text-gray-900">vrushahigroup@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-3 rounded-2xl bg-white border border-gray-200 text-footerBg">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Call Us</p>
                                    <p className="text-base font-semibold text-gray-900">9970907005</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
                        <h2 className="text-xl font-black text-footerBg uppercase tracking-tight mb-4">About Vrushahi</h2>
                        <div className="space-y-4 text-gray-700 leading-7">
                            <p>
                                Vrushahi is committed to delivering premium natural products with transparency, quality, and fast support. Our website brings you curated groceries, health staples, and trusted sourcing directly from the best producers.
                            </p>
                            <p>
                                If you need help with browsing, placing orders, tracking deliveries, or understanding our policies, our support team is here for you. Reach out anytime using the email or phone above.
                            </p>
                            <p>
                                Thank you for choosing Vrushahi. Your trust motivates us to improve every day.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SupportPage;
