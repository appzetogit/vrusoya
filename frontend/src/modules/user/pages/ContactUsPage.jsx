import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useWebsiteContent } from '../../../hooks/useContent';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const DEFAULT_CONTACT = {
    address: 'Shop no1, near vasant dada kusti kendra Vasant nagar, Sangli Maharashtra 416415',
    phone: '+91-9970907005',
    email: 'vrushahigroup@gmail.com'
};

const ContactItem = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4 md:gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-[#ecf8e9] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <Icon size={22} strokeWidth={2.2} />
        </div>
        <div className="space-y-2">
            <h3 className="text-[1.15rem] md:text-[1.45rem] font-black tracking-tight text-footerBg">{title}</h3>
            <div className="max-w-[28rem] text-[15px] md:text-[1.02rem] text-slate-600 leading-[1.7]">
                {children}
            </div>
        </div>
    </div>
);

const ContactUsPage = () => {
    const { data: footerData } = useWebsiteContent('footer-config');
    const contact = footerData?.content?.contact || DEFAULT_CONTACT;
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const namePattern = /^[^\d]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.com$/i;
    const phonePattern = /^\d{10}$/;
    const isFormFilled = [
        formData.name,
        formData.email,
        formData.phone,
        formData.company,
        formData.message
    ].every((value) => String(value || '').trim() !== '');

    const handleChange = (field, value) => {
        let nextValue = value;

        if (field === 'name') {
            nextValue = value.replace(/\d/g, '');
        }

        if (field === 'phone') {
            nextValue = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData(prev => ({ ...prev, [field]: nextValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.company || !formData.message) {
            toast.error('All fields are required.');
            return;
        }

        if (!namePattern.test(formData.name.trim())) {
            toast.error('Name should not contain numbers.');
            return;
        }

        if (!emailPattern.test(formData.email.trim())) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (!phonePattern.test(formData.phone.trim())) {
            toast.error('Phone number must be exactly 10 digits.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/enquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    company: formData.company.trim(),
                    message: formData.message.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit enquiry');
            }

            toast.success('Your enquiry has been submitted.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                message: ''
            });
        } catch (error) {
            toast.error(error.message || 'Failed to submit enquiry');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fcf7_0%,_#fbfdfb_45%,_#ffffff_100%)] px-3 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="mx-auto max-w-[84rem]"
            >
                <div className="overflow-hidden rounded-[2.2rem] border border-[#dfead9] bg-white shadow-[0_18px_55px_rgba(65,101,71,0.08)] lg:rounded-[2.5rem]">
                    <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                        <section className="space-y-8 bg-[linear-gradient(180deg,_#fbfdf9_0%,_#ffffff_100%)] p-6 md:p-8 lg:p-9 xl:p-10">
                            <div className="space-y-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Contact Us</p>
                                <h1 className="text-[2rem] md:text-[2.5rem] font-black text-footerBg tracking-[-0.03em]">Our Contact Details</h1>
                                <div className="relative h-px w-full bg-[#d8dfd2]">
                                    <div className="absolute left-0 top-0 h-px w-28 bg-primary" />
                                </div>
                                <p className="max-w-xl text-base md:text-[1.05rem] text-slate-600">Reach us easily for orders, queries, or support.</p>
                            </div>

                            <div className="space-y-8 pt-1 md:pt-3">
                                <ContactItem icon={MapPin} title="Store Address">
                                    <p>{contact.address}</p>
                                </ContactItem>

                                <ContactItem icon={Mail} title="Email">
                                    <p>{contact.email}</p>
                                </ContactItem>

                                <ContactItem icon={Phone} title="Call Us">
                                    <p>{contact.phone}</p>
                                </ContactItem>
                            </div>
                        </section>

                        <section className="space-y-8 border-t border-[#e4ecdf] p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-9 xl:p-10">
                            <div className="space-y-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Quick Form</p>
                                <h2 className="text-[2rem] md:text-[2.5rem] font-black text-footerBg tracking-[-0.03em]">Get in Touch</h2>
                                <div className="relative h-px w-full bg-[#d8dfd2]">
                                    <div className="absolute left-0 top-0 h-px w-28 bg-primary" />
                                </div>
                                <p className="max-w-2xl text-base md:text-[1.05rem] text-slate-600">Have a question or need support? We&apos;re just a message away.</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-extrabold text-footerBg">Your Name</span>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            inputMode="text"
                                            className="h-14 w-full rounded-[1.05rem] border border-[#dbe4d7] bg-white px-5 text-[15px] text-footerBg outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-extrabold text-footerBg">Your Email</span>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="name@example.com"
                                            className="h-14 w-full rounded-[1.05rem] border border-[#dbe4d7] bg-white px-5 text-[15px] text-footerBg outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-extrabold text-footerBg">Phone Number</span>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            inputMode="numeric"
                                            maxLength={10}
                                            placeholder="9876543210"
                                            className="h-14 w-full rounded-[1.05rem] border border-[#dbe4d7] bg-white px-5 text-[15px] text-footerBg outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-extrabold text-footerBg">Company</span>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => handleChange('company', e.target.value)}
                                            className="h-14 w-full rounded-[1.05rem] border border-[#dbe4d7] bg-white px-5 text-[15px] text-footerBg outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                </div>

                                <label className="block space-y-2">
                                    <span className="text-sm font-extrabold text-footerBg">Your Message</span>
                                    <textarea
                                        rows="7"
                                        value={formData.message}
                                        onChange={(e) => handleChange('message', e.target.value)}
                                        className="min-h-[12rem] w-full resize-none rounded-[1.45rem] border border-[#dbe4d7] bg-white px-5 py-4 text-[15px] text-footerBg outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFormFilled}
                                    className={`inline-flex h-12 items-center justify-center rounded-[0.95rem] px-7 text-sm font-black uppercase tracking-[0.16em] transition-all duration-200 ${isSubmitting || !isFormFilled
                                        ? 'cursor-not-allowed bg-[#e8f3e6] text-[#8aa487]'
                                        : 'bg-primary text-white shadow-[0_12px_26px_rgba(60,179,74,0.22)] hover:bg-primary/90'
                                        }`}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Ask A Question'}
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ContactUsPage;

