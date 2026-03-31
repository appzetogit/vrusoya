import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminHeader = () => {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-footerBg border-b border-white/5 flex items-center justify-end sticky top-0 z-40 text-left">
            <div className="h-full bg-white/5 px-8 flex items-center gap-6 border-l border-white/5">
                <Link to="/admin/profile" className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right">
                        <p className="text-sm font-black text-white leading-none">{user?.name || 'Admin User'}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={20} />
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default AdminHeader;
