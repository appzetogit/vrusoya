import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, RefreshCw, User, Mail, MapPin, Phone, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const OTPPage = () => {
    const { verifyOtp, sendOtp, completeOtpRegistration } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [signupToken, setSignupToken] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });
    const inputRefs = useRef([]);
    const namePattern = /^[A-Za-z ]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.com$/i;

    // Get phone from previous navigation state
    const phone = location.state?.contact;
    const signupStorageKey = phone ? `vrushahi_otp_signup_${phone}` : '';

    useEffect(() => {
        if (!phone) {
            navigate('/login');
            return;
        }

        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer, phone, navigate]);

    useEffect(() => {
        if (!phone) return;
        setAddressForm((prev) => ({ ...prev, phone: prev.phone || phone }));
    }, [phone]);

    useEffect(() => {
        if (!signupStorageKey || typeof window === 'undefined') return;

        try {
            const storedSession = sessionStorage.getItem(signupStorageKey);
            if (!storedSession) return;

            const parsedSession = JSON.parse(storedSession);
            if (parsedSession?.signupToken) {
                setSignupToken(parsedSession.signupToken);
            }
            if (parsedSession?.isNewUser) {
                setIsNewUser(true);
            }
            if (typeof parsedSession?.otp === 'string' && /^\d{4}$/.test(parsedSession.otp)) {
                setOtp(parsedSession.otp.split(''));
            }
        } catch (error) {
            console.error('Failed to restore OTP signup session:', error);
        }
    }, [signupStorageKey]);

    const persistSignupSession = (session) => {
        if (!signupStorageKey || typeof window === 'undefined') return;
        sessionStorage.setItem(signupStorageKey, JSON.stringify(session));
    };

    const clearSignupSession = () => {
        if (!signupStorageKey || typeof window === 'undefined') return;
        sessionStorage.removeItem(signupStorageKey);
    };

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 4);
        if (!/^\d+$/.test(data)) return;

        const pasteData = data.split('');
        const newOtp = [...otp];
        pasteData.forEach((char, i) => {
            if (i < 4) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled or next empty
        const lastIndex = Math.min(pasteData.length, 3);
        inputRefs.current[lastIndex].focus();
    };

    const handleAddressChange = (field, value) => {
        setAddressForm((prev) => ({
            ...prev,
            [field]: field === 'phone'
                ? String(value || '').replace(/\D/g, '').slice(0, 10)
                : field === 'pincode'
                    ? String(value || '').replace(/\D/g, '').slice(0, 6)
                    : value
        }));
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!API_KEY) {
            toast.error('Google Maps API Key missing. Please add it to your environment.');
            return;
        }

        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
                    );
                    const data = await response.json();

                    if (data.status === 'OK') {
                        const result = data.results[0];
                        const components = result.address_components;
                        const getComponent = (type) =>
                            components.find((c) => c.types.includes(type))?.long_name || '';

                        const city = getComponent('locality') || getComponent('administrative_area_level_2');
                        const state = getComponent('administrative_area_level_1');
                        const pincode = getComponent('postal_code');
                        const address = result.formatted_address;

                        setAddressForm((prev) => ({
                            ...prev,
                            address: address || prev.address,
                            city: city || prev.city,
                            state: state || prev.state,
                            pincode: pincode || prev.pincode,
                        }));
                        toast.success('Location detected and address filled!');
                    } else {
                        toast.error('Failed to get address details');
                    }
                } catch (error) {
                    console.error('Location detection error:', error);
                    toast.error('Error fetching location details');
                } finally {
                    setDetectingLocation(false);
                }
            },
            () => {
                toast.error('Location permission denied');
                setDetectingLocation(false);
            }
        );
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (!isNewUser && fullOtp.length < 4) {
            toast.error('Please enter complete 4-digit OTP');
            return;
        }

        setIsLoading(true);

        const redirectPath = location.state?.redirect || '/';

        if (isNewUser) {
            const trimmedName = name.trim();
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedAddress = {
                fullName: String(addressForm.fullName || trimmedName).trim(),
                phone: String(addressForm.phone || phone || '').replace(/\D/g, '').slice(0, 10),
                address: String(addressForm.address || '').trim(),
                city: String(addressForm.city || '').trim(),
                state: String(addressForm.state || '').trim(),
                pincode: String(addressForm.pincode || '').replace(/\D/g, '').slice(0, 6),
            };

            if (!trimmedName || !trimmedEmail) {
                toast.error('Please fill in all fields');
                setIsLoading(false);
                return;
            }
            if (!namePattern.test(trimmedName)) {
                toast.error('Name should contain only alphabets');
                setIsLoading(false);
                return;
            }
            if (!emailPattern.test(trimmedEmail)) {
                toast.error('Please enter a valid .com email address');
                setIsLoading(false);
                return;
            }
            if (
                !trimmedAddress.fullName
                || !trimmedAddress.address
                || !trimmedAddress.city
                || !trimmedAddress.state
                || !/^\d{10}$/.test(trimmedAddress.phone)
                || !/^\d{6}$/.test(trimmedAddress.pincode)
            ) {
                toast.error('Please fill all address fields correctly.');
                setIsLoading(false);
                return;
            }

            const nextAddress = {
                id: Date.now(),
                type: 'Home',
                fullName: trimmedAddress.fullName,
                phone: trimmedAddress.phone,
                address: trimmedAddress.address,
                city: trimmedAddress.city,
                state: trimmedAddress.state,
                pincode: trimmedAddress.pincode,
                isDefault: true
            };

            const storedSession = signupStorageKey && typeof window !== 'undefined'
                ? sessionStorage.getItem(signupStorageKey)
                : null;
            let persistedSignupToken = signupToken;
            let persistedOtp = fullOtp;

            if (storedSession) {
                try {
                    const parsedSession = JSON.parse(storedSession);
                    persistedSignupToken = persistedSignupToken || parsedSession?.signupToken || '';
                    persistedOtp = /^\d{4}$/.test(persistedOtp) ? persistedOtp : (parsedSession?.otp || '');
                } catch (error) {
                    console.error('Failed to parse stored OTP signup session:', error);
                }
            }

            let result;
            if (persistedSignupToken) {
                result = await completeOtpRegistration({
                    signupToken: persistedSignupToken,
                    name: trimmedName,
                    email: trimmedEmail,
                    accountType: 'Individual',
                    gstNumber: '',
                    addresses: [nextAddress]
                });
            } else if (/^\d{4}$/.test(persistedOtp)) {
                result = await verifyOtp(
                    phone,
                    persistedOtp,
                    trimmedName,
                    trimmedEmail,
                    'Individual',
                    '',
                    { addresses: [nextAddress] }
                );
            } else {
                toast.error('Signup session expired. Please verify OTP again.');
                setIsLoading(false);
                navigate('/login', { state: { from: '/otp-verification' } });
                return;
            }

            setIsLoading(false);
            if (result.success) {
                setSignupToken('');
                clearSignupSession();
                navigate(redirectPath);
            }
        } else {
            const result = await verifyOtp(phone, fullOtp);
            setIsLoading(false);
            if (result.success) {
                if (result.isNewUser) {
                    if (!result.signupToken) {
                        toast.error('Backend restart required. Please restart the API server, request a new OTP, and try again.');
                        return;
                    }
                    setIsNewUser(true);
                    const nextSignupToken = result.signupToken || '';
                    setSignupToken(nextSignupToken);
                    persistSignupSession({
                        isNewUser: true,
                        signupToken: nextSignupToken,
                        otp: fullOtp
                    });
                    setName('');
                    setEmail('');
                    setAddressForm({
                        fullName: '',
                        phone: phone || '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: ''
                    });
                    toast.success('OTP verified! Please complete your registration.');
                } else {
                    setSignupToken('');
                    clearSignupSession();
                    navigate(redirectPath);
                }
            }
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        const res = await sendOtp(phone);
        if (res.success) {
            setTimer(30);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 font-['Inter']">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop')",
                    filter: "blur(12px) brightness(0.5)",
                    transform: "scale(1.1)"
                }}
            />
            <div className="absolute inset-0 bg-black/30 z-0" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all font-medium backdrop-blur-md bg-black/20 px-4 py-2 rounded-full hover:bg-black/30"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 p-6 text-center"
            >
                <div className="w-16 h-16 bg-[#2c5336]/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#2c5336]/20">
                    {isNewUser ? (
                        <User size={32} className="text-[#2c5336]" />
                    ) : (
                        <ShieldCheck size={32} className="text-[#2c5336]" />
                    )}
                </div>

                <h1 className="text-xl font-black text-gray-900 font-['Poppins'] mb-2 uppercase tracking-tight">
                    {isNewUser ? 'Complete Profile' : 'Two-Step Verification'}
                </h1>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">
                    {isNewUser
                        ? "Please provide your details and delivery address to finish signing up."
                        : (
                            <>
                                We've sent a 4-digit verification code to <br />
                                <span className="font-bold text-[#2c5336]">+91 {phone}</span>
                            </>
                        )}
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                    {!isNewUser && (
                        <div className="flex justify-center gap-3 mb-2" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-lg font-black bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#2c5336] focus:bg-white outline-none transition-all text-[#2c5336]"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    )}

                    {isNewUser && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => {
                                            const nextValue = e.target.value.replace(/[^A-Za-z ]/g, '');
                                            setName(nextValue);
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                fullName: prev.fullName ? prev.fullName : nextValue
                                            }));
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                        placeholder="John Doe"
                                        pattern="[A-Za-z ]+"
                                        title="Name should contain only alphabets"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                        placeholder="john@example.com"
                                        pattern="^[^\s@]+@[^\s@]+\.com$"
                                        title="Please enter a valid .com email address"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 text-left">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Delivery Address</label>
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={detectingLocation}
                                        className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-[#2c5336] disabled:opacity-60"
                                    >
                                        <LocateFixed size={12} />
                                        {detectingLocation ? 'Detecting...' : 'Use My Location'}
                                    </button>
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={14} />
                                    <textarea
                                        required
                                        value={addressForm.address}
                                        onChange={(e) => handleAddressChange('address', e.target.value)}
                                        className="w-full min-h-[78px] resize-none bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                        placeholder="House no, street, area"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">State</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                        placeholder="State"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            required
                                            inputMode="numeric"
                                            value={addressForm.phone}
                                            onChange={(e) => handleAddressChange('phone', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Pincode</label>
                                    <input
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        value={addressForm.pincode}
                                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-medium text-gray-900 outline-none focus:border-primary transition-all"
                                        placeholder="400001"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#2c5336] text-white font-black text-xs py-3.5 rounded-xl hover:bg-[#1f3b26] transition-all shadow-lg shadow-[#2c5336]/20 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin" size={16} />
                        ) : (
                            isNewUser ? 'Complete Registration' : 'Verify & Proceed'
                        )}
                    </button>
                </form>

                {!isNewUser && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        {timer > 0 ? (
                            <div className="mb-4">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#2c5336]/5 rounded-2xl border border-[#2c5336]/10 animate-pulse transition-all">
                                    <RefreshCw size={16} className="text-[#2c5336] animate-spin" style={{ animationDuration: '3s' }} />
                                    <span className="text-[#2c5336] text-sm font-black tracking-widest uppercase">
                                        Resend available in {timer}s
                                    </span>
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="flex items-center gap-2 mx-auto font-black text-sm text-[#2c5336] hover:underline uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                <RefreshCw size={18} />
                                Resend New Code
                            </button>
                        )}
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-3 italic">Didn't receive the code?</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OTPPage;
