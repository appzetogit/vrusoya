import React from 'react';
import { motion } from 'framer-motion';
import { useWebsiteContent } from '../../../hooks/useContent';

const InfoPage = ({ type }) => {
    const { data: pageData, isLoading } = useWebsiteContent(type);
    const isLegalPolicyPage = [
        'privacy-policy',
        'terms-conditions',
        'refund-policy',
        'shipping-policy',
        'cancellation-policy',
        'disclaimer',
        'cookie-policy'
    ].includes(type);

    // Default Fallback Content Config
    const defaultContentMap = {
        'about-us': {
            title: "About Vrushahi",
            subtitle: "Delivering nature's finest to your doorstep",
            content: (
                <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                    <p>At Vrushahi, we believe in the power of pure, unadulterated nature. Our journey began with a simple mission: to bridge the gap between conscientious farmers and mindful consumers.</p>
                    <p>We source premium dry fruits, nuts, seeds, and organic staples directly from growers who practice sustainable farming. Every product is handpicked, quality-checked, and packed with care to ensure you get nothing but the best.</p>
                </div>
            )
        },
        'terms-conditions': {
            title: "Terms and Conditions",
            subtitle: "User Agreement",
            content: (
                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>Welcome to Vrushahi. By accessing our website, you agree to be bound by these terms and conditions.</p>
                    <h3 className="text-xl font-bold text-footerBg mb-2">1. Use of Service</h3>
                    <p>You agree to use our service for lawful purposes only and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.</p>
                </div>
            )
        },
        'privacy-policy': {
            title: "Privacy Policy",
            subtitle: "Your trust is our priority",
            content: (
                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>
                    <h3 className="text-xl font-bold text-footerBg mb-2">1. Information Collection</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter.</p>
                </div>
            )
        },
    };

    const config = defaultContentMap[type] || defaultContentMap['about-us'];

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const displayTitle = pageData?.title || config.title;
    const displaySubtitle = pageData?.subtitle || config.subtitle;
    // content can be a string (HTML from Quill) or fallback JSX
    const displayContent = pageData?.content ? (
        <div
            className={`quill-content ${isLegalPolicyPage ? 'policy-content' : ''}`}
            dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
    ) : config.content;

    return (
        <div className="min-h-screen bg-white py-4 md:py-8 px-4 lg:px-8 overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto md:px-0"
            >
                <div className="text-center mb-6 md:mb-8">
                    <h1 className={`${isLegalPolicyPage ? 'text-xl md:text-2xl lg:text-4xl' : 'text-2xl md:text-3xl lg:text-5xl'} font-black text-footerBg uppercase tracking-tighter mb-2`}>{displayTitle}</h1>
                    {displaySubtitle && <p className="text-primary font-black tracking-[0.2em] uppercase text-[10px] md:text-xs">{displaySubtitle}</p>}
                </div>

                <div className="px-1 md:px-0 overflow-x-hidden">
                    {displayContent}
                </div>
            </motion.div>

            <style>{`
                .quill-content {
                    color: #4b5563;
                    line-height: 1.8;
                    font-size: 1rem;
                    max-width: 100%;
                    overflow-x: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .quill-content h1,
                .quill-content h2,
                .quill-content h3,
                .quill-content h4,
                .quill-content h5,
                .quill-content h6 {
                    color: #111827;
                    font-weight: 800;
                    line-height: 1.2;
                    margin-top: 1.5em;
                    margin-bottom: 0.6em;
                }
                .quill-content h1 { font-size: 2.2rem; }
                .quill-content h2 { font-size: 1.8rem; }
                .quill-content h3 { font-size: 1.5rem; }
                .quill-content h4 { font-size: 1.25rem; }
                .quill-content p {
                    margin-bottom: 1rem;
                    max-width: 100%;
                }
                .quill-content strong {
                    font-weight: 700;
                    color: #111827;
                }
                .quill-content em {
                    font-style: italic;
                }
                .quill-content u {
                    text-decoration: underline;
                }
                .quill-content s {
                    text-decoration: line-through;
                }
                .quill-content a {
                    color: #0f766e;
                    text-decoration: underline;
                    word-break: break-word;
                }
                .quill-content ul,
                .quill-content ol {
                    margin: 1rem 0 1.25rem;
                    padding-left: 1.5rem;
                    max-width: 100%;
                }
                .quill-content ul {
                    list-style: disc;
                }
                .quill-content ol {
                    list-style: decimal;
                }
                .quill-content li {
                    margin-bottom: 0.5rem;
                }
                .quill-content blockquote {
                    border-left: 4px solid #16a34a;
                    padding-left: 1rem;
                    margin: 1.25rem 0;
                    color: #374151;
                    font-style: italic;
                    max-width: 100%;
                }
                .quill-content .ql-align-center {
                    text-align: center;
                }
                .quill-content .ql-align-right {
                    text-align: right;
                }
                .quill-content .ql-align-justify {
                    text-align: justify;
                }
                .quill-content .ql-indent-1 { padding-left: 3rem; }
                .quill-content .ql-indent-2 { padding-left: 6rem; }
                .quill-content .ql-indent-3 { padding-left: 9rem; }
                .quill-content img {
                    display: block;
                    max-width: 100%;
                    height: auto;
                    border-radius: 1rem;
                    margin: 1.25rem 0;
                }
                .quill-content iframe {
                    max-width: 100%;
                }
                .quill-content * {
                    max-width: 100%;
                }
                .quill-content .ql-size-small { font-size: 0.875rem; }
                .quill-content .ql-size-large { font-size: 1.25rem; }
                .quill-content .ql-size-huge { font-size: 1.5rem; }
                .quill-content.policy-content {
                    font-size: 0.92rem;
                    line-height: 1.7;
                }
                .quill-content.policy-content h1 { font-size: 1.7rem; }
                .quill-content.policy-content h2 { font-size: 1.45rem; }
                .quill-content.policy-content h3 { font-size: 1.2rem; }
                .quill-content.policy-content h4 { font-size: 1.05rem; }
            `}</style>
        </div >
    );
};
export default InfoPage;

