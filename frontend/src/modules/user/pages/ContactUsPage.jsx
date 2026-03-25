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
    <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon size={22} strokeWidth={2.2} />
        </div>
        <div className="space-y-1">
            <h3 className="text-lg md:text-[1.45rem] font-bold text-footerBg">{title}</h3>
            <div className="text-sm md:text-base text-gray-600 leading-relaxed">
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
    const namePattern = /^[A-Za-z\s]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
            nextValue = value.replace(/[^A-Za-z\s]/g, '');
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
            toast.error('Name should contain only letters and spaces.');
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
        <div className="min-h-screen bg-[#fcfdfb] px-3 py-2 md:px-6 md:py-3 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-6xl"
            >
                <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_20px_60px_rgba(24,40,24,0.08)]">
                    <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                        <section className="space-y-6 bg-gradient-to-br from-[#f7fbf4] to-white p-5 md:p-6 lg:p-7">
                            <div className="space-y-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Contact Us</p>
                                <h1 className="text-[1.65rem] md:text-[2rem] font-black text-footerBg tracking-tight">Our Contact Details</h1>
                                <div className="h-px w-full bg-black/10 relative">
                                    <div className="absolute left-0 top-0 h-px w-28 bg-primary" />
                                </div>
                                <p className="text-sm md:text-base text-gray-600">Reach us easily for orders, queries, or support.</p>
                            </div>

                            <div className="space-y-6 pt-1">
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

                        <section className="space-y-6 border-t border-primary/10 p-5 md:p-6 lg:border-t-0 lg:border-l lg:border-primary/10 lg:p-7">
                            <div className="space-y-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Quick Form</p>
                                <h2 className="text-[1.65rem] md:text-[2rem] font-black text-footerBg tracking-tight">Get in Touch</h2>
                                <div className="h-px w-full bg-black/10 relative">
                                    <div className="absolute left-0 top-0 h-px w-28 bg-primary" />
                                </div>
                                <p className="text-sm md:text-base text-gray-600">Have a question or need support? We&apos;re just a message away.</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-bold text-footerBg">Your Name</span>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            inputMode="text"
                                            pattern="[A-Za-z\\s]+"
                                            title="Name should contain only letters and spaces"
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-colors focus:border-primary"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-bold text-footerBg">Your Email</span>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="name@example.com"
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-colors focus:border-primary"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-bold text-footerBg">Phone Number</span>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            inputMode="numeric"
                                            maxLength={10}
                                            pattern="\\d{10}"
                                            title="Phone number must be exactly 10 digits"
                                            placeholder="9876543210"
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-colors focus:border-primary"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-bold text-footerBg">Company</span>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => handleChange('company', e.target.value)}
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-colors focus:border-primary"
                                        />
                                    </label>
                                </div>

                                <label className="block space-y-2">
                                    <span className="text-sm font-bold text-footerBg">Your Message</span>
                                    <textarea
                                        rows="6"
                                        value={formData.message}
                                        onChange={(e) => handleChange('message', e.target.value)}
                                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm outline-none transition-colors focus:border-primary"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFormFilled}
                                    className={`inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-black uppercase tracking-[0.16em] text-white transition-colors ${isSubmitting || !isFormFilled
                                        ? 'cursor-not-allowed bg-[#e8f3e6] text-[#8aa487]'
                                        : 'bg-primary text-white hover:bg-primary/90'
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
