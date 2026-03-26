import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';

// Helper to check if user is authenticated
const isAuthenticated = () => {
    try {
        const user = localStorage.getItem('farmlyf_current_user');
        const token = localStorage.getItem('farmlyf_token');
        return !!(user && token);
    } catch {
        return false;
    }
};

const API_URL = API_BASE_URL;

export const useUsers = ({ page, limit, search, status } = {}) => {
    const { getAuthHeaders } = useAuth();
    return useQuery({
        queryKey: ['users', page, limit, search, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (page !== undefined) params.set('page', String(page));
            if (limit !== undefined) params.set('limit', String(limit));
            if (search) params.set('search', String(search));
            if (status) params.set('status', String(status));

            const query = params.toString();
            const url = query ? `${API_URL}/users?${query}` : `${API_URL}/users`;
            const res = await fetch(url, { 
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        enabled: isAuthenticated() // Only fetch if authenticated
    });
};
