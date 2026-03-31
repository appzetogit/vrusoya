import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
    wishlist: JSON.parse(localStorage.getItem('vrushahi_wishlist')) || {}, // { userId: [packIds] }
    recentlyViewed: JSON.parse(localStorage.getItem('vrushahi_recently_viewed')) || {}, // { userId: [productIds] }
    saveForLater: JSON.parse(localStorage.getItem('vrushahi_save_for_later')) || {}, // { userId: [{ packId, qty }] }
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // --- Wishlist ---
        toggleWishlist: (state, action) => {
            const { userId, packId } = action.payload;
            if (!userId) {
                toast.error("Please login to manage wishlist");
                return;
            }
            if (!state.wishlist[userId]) state.wishlist[userId] = [];
            
            if (state.wishlist[userId].includes(packId)) {
                state.wishlist[userId] = state.wishlist[userId].filter(id => id !== packId);
                toast.success("Removed from wishlist");
            } else {
                state.wishlist[userId].push(packId);
                toast.success("Added to wishlist");
            }
            localStorage.setItem('vrushahi_wishlist', JSON.stringify(state.wishlist));
        },

        // --- Recently Viewed ---
        addToRecentlyViewed: (state, action) => {
            const { userId, productId } = action.payload;
            if (!userId) return;
            if (!state.recentlyViewed[userId]) state.recentlyViewed[userId] = [];

            // Remove if exists, add to top
            let userRecent = state.recentlyViewed[userId].filter(id => id !== productId);
            userRecent.unshift(productId);
            // Limit to 12
            userRecent = userRecent.slice(0, 12);

            state.recentlyViewed[userId] = userRecent;
            localStorage.setItem('vrushahi_recently_viewed', JSON.stringify(state.recentlyViewed));
        },

        // --- Save For Later ---
        addToSaved: (state, action) => {
            const { userId, packId, qty = 1 } = action.payload;
            if (!userId) {
                toast.error("Please login to save items");
                return;
            }
            if (!state.saveForLater[userId]) state.saveForLater[userId] = [];

            if (!state.saveForLater[userId].find(i => String(i.packId) === String(packId))) {
                state.saveForLater[userId].push({ packId, qty });
                localStorage.setItem('vrushahi_save_for_later', JSON.stringify(state.saveForLater));
                toast.success("Saved for later");
            }
        },
        removeFromSaved: (state, action) => {
             const { userId, packId } = action.payload;
             if (state.saveForLater[userId]) {
                 state.saveForLater[userId] = state.saveForLater[userId].filter(item => item.packId !== packId);
                 localStorage.setItem('vrushahi_save_for_later', JSON.stringify(state.saveForLater));
             }
        },
        moveToCartFromSaved: (state, action) => {
            // Note: This needs dispatching addToCart as well, usually handled in component or thunk.
            // But we can handle the removal part here.
            // Ideally, component dispatches `addToCart` AND `removeFromSaved`.
             const { userId, packId } = action.payload;
             // Logic handled by separate actions in component usually, but keeping simple reducer for removal
             if (state.saveForLater[userId]) {
                 state.saveForLater[userId] = state.saveForLater[userId].filter(item => item.packId !== packId);
                 localStorage.setItem('vrushahi_save_for_later', JSON.stringify(state.saveForLater));
             }
        }
    }
});

export const { toggleWishlist, addToRecentlyViewed, addToSaved, removeFromSaved } = userSlice.actions;

export const selectWishlist = (state, userId) => state.user.wishlist[userId] || [];
export const selectRecentlyViewed = (state, userId) => state.user.recentlyViewed[userId] || [];
export const selectSaveForLater = (state, userId) => state.user.saveForLater[userId] || [];

export default userSlice.reducer;

