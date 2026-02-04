import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const getName = () => product[`name_${i18n.language}`] || product.name;
    const categoryName = product.category || "Collection";

    const isFavorite = isInWishlist(product.id);

    return (
        <div className="group relative w-full">
            {/* Image Container with Elegant Hover */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F7F5]">
                {/* Badges ... (rest same) */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {product.is_new && (
                        <span className="bg-coffee-dark text-white text-[10px] uppercase tracking-widest px-3 py-1 font-medium">{t('new')}</span>
                    )}
                    {product.discount && (
                        <span className="bg-red-800 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-medium">-{product.discount}%</span>
                    )}
                </div>

                {/* Wishlist Button (Top Right) */}
                <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 p-2 rounded-full shadow-sm ${isFavorite ? 'bg-gold text-white' : 'bg-white/90 text-gray-600 hover:bg-gold hover:text-coffee-dark'}`}
                >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>

                {/* Main Image */}
                <Link to={`/products/${product.id}`}>
                    <img
                        src={product.imageUrl || "https://placehold.co/600x800/f5f5f5/333333?text=Yemeni+Product"}
                        alt={getName()}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ease-out"
                    />
                </Link>

                {/* Quick Add Overlay */}
                <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out border-t border-gold/20 flex flex-col items-center gap-3">
                    <Button
                        onClick={() => addToCart(product)}
                        variant="ghost"
                        className="w-3/4 bg-coffee text-white hover:bg-gold hover:text-coffee-dark uppercase tracking-widest text-xs h-10 font-medium transition-colors"
                    >
                        {t('add_to_cart')}
                    </Button>
                    <Link to={`/products/${product.id}`} className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-gold border-b border-transparent hover:border-gold transition-all">
                        {t('view_details')}
                    </Link>
                </div>
            </div>

            {/* Product Details */}
            <div className="pt-5 text-center px-2">
                <p className="text-[10px] uppercase tracking-widest text-gold mb-1">{categoryName}</p>
                <Link to={`/products/${product.id}`}>
                    <h3 className="font-serif text-lg text-coffee-dark hover:text-gold transition-colors duration-300 mb-2 truncate px-2">
                        {getName()}
                    </h3>
                </Link>
                <div className="flex items-center justify-center gap-3">
                    {product.old_price && (
                        <span className="text-sm text-gray-400 line-through decoration-gold/50 decoration-1 font-light">{t('price_with_currency', { amount: product.old_price })}</span>
                    )}
                    <span className="text-base font-medium text-coffee-dark tracking-wide">{t('price_with_currency', { amount: product.price })}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
