import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!token) {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist(response.data);
        } catch (error) {
            console.error("Fetch Wishlist Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchWishlist();
        else setWishlist([]);
    }, [token]);

    const toggleWishlist = async (product) => {
        if (!token) {
            // Redirect to login or show alert (handled in component usually)
            return { error: 'login_required' };
        }

        try {
            const response = await axios.post('http://localhost:5000/api/wishlist/toggle',
                { productId: product.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.added) {
                setWishlist(prev => [...prev, product]);
            } else {
                setWishlist(prev => prev.filter(p => p.id !== product.id));
            }
            return { success: true, added: response.data.added };
        } catch (error) {
            console.error("Toggle Wishlist Error:", error);
            return { error: 'failed' };
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(p => p.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading, refreshWishlist: fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
