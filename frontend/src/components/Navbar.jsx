import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, Heart, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useAuth } from '../context/AuthContext';

// UI Components
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import CartDrawer from './Cart/CartDrawer';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { cartItems, setIsCartOpen } = useCart();
    const { wishlist } = useWishlist();
    const config = useStoreConfig(); // Get dynamic config
    const { user } = useAuth();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    // Scroll Effect Listener
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
    };

    const navLinks = [
        { name: t('honey'), href: '/products?category=honey', image: 'https://placehold.co/400x300/D4AF37/FFFFFF?text=Honey' },
        { name: t('coffee'), href: '/products?category=coffee', image: 'https://placehold.co/400x300/4B3621/FFFFFF?text=Coffee' },
        { name: t('spices'), href: '/products?category=spices', image: 'https://placehold.co/400x300/E85D04/FFFFFF?text=Spices' },
        { name: t('gifts'), href: '/products?category=gifts', image: 'https://placehold.co/400x300/800000/FFFFFF?text=Gifts' }
    ];

    return (
        <div className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass' : 'bg-transparent'}`}>
            {/* 1. Utility Bar (Hidden on scroll for cleaner look, or adapt colors) */}
            <div className={`py-1 px-6 text-[10px] tracking-wider transition-colors duration-300 ${scrolled ? 'bg-coffee-dark text-white' : 'bg-black/80 text-white backdrop-blur-sm'}`}>
                <div className="container mx-auto flex justify-between items-center">
                    <p className="hidden md:flex items-center gap-2 font-medium text-gold/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                        {t('free_shipping_notice')}
                    </p>
                    <div className="flex items-center gap-6 ml-auto">
                        <div className="flex items-center gap-3 border-r border-white/10 pr-6 text-gray-400">
                            <button onClick={() => changeLanguage('fr')} className={`hover:text-white transition-all duration-300 ${i18n.language === 'fr' ? 'text-white font-bold underline decoration-gold underline-offset-4' : ''}`}>FR</button>
                            <span className="text-white/20">|</span>
                            <button onClick={() => changeLanguage('en')} className={`hover:text-white transition-all duration-300 ${i18n.language === 'en' ? 'text-white font-bold underline decoration-gold underline-offset-4' : ''}`}>EN</button>
                            <span className="text-white/20">|</span>
                            <button onClick={() => changeLanguage('ar')} className={`hover:text-white transition-all duration-300 font-serif ${i18n.language === 'ar' ? 'text-white font-bold underline decoration-gold underline-offset-4' : ''}`}>عربي</button>
                        </div>
                        <Link to="/help" className="hover:text-gold transition-colors duration-300">{t('help_support')}</Link>
                    </div>
                </div>
            </div>

            {/* 2. Main Header (Logo & Icons) */}
            <header className={`border-b border-white/10 relative z-40 transition-all ${scrolled ? 'py-0.5' : 'py-1'}`}>
                <div className="container mx-auto px-4 h-12 flex items-center justify-between">

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={scrolled ? 'text-black' : 'text-white'}><Menu className="w-5 h-5" /></Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px]">
                                <div className="flex flex-col gap-6 mt-8">
                                    <h2 className="font-serif text-2xl font-bold text-coffee-dark px-2">{t('menu')}</h2>
                                    <nav className="flex flex-col space-y-4 px-2">
                                        <Link to="/" className="text-lg font-medium border-b border-gray-100 pb-2">{t('home')}</Link>
                                        <Link to="/products" className="text-lg font-medium border-b border-gray-100 pb-2">{t('shop_all')}</Link>
                                        {navLinks.map(link => (
                                            <Link key={link.name} to={link.href} className="text-lg text-gray-600 hover:text-gold transition-colors pb-2">
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo (Centered on Desktop) */}
                    <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
                        <img src="/logo.png" alt="Yemeni Market" className="h-10 md:h-12 object-cover rounded-full aspect-square" />
                    </Link>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Search Toggle */}
                        <div className="hidden md:block relative">
                            {isSearchOpen ? (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 bg-white shadow-lg rounded-full flex items-center border border-gray-200">
                                    <input
                                        autoFocus
                                        className="w-full bg-transparent border-none focus:ring-0 px-4 py-2 text-sm"
                                        placeholder={t('search_placeholder')}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                navigate(`/products?search=${e.target.value}`);
                                                setIsSearchOpen(false);
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setIsSearchOpen(false), 200);
                                        }}
                                    />
                                    <X size={16} className="mr-3 cursor-pointer text-gray-400" onClick={() => setIsSearchOpen(false)} />
                                </div>
                            ) : (
                                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className={`hover:text-gold transition ${scrolled ? 'text-black' : 'text-white'}`}>
                                    <Search className="w-5 h-5" />
                                </Button>
                            )}
                        </div>

                        {/* User Profile Link */}
                        <Link to={user ? "/profile" : "/login"}>
                            <Button variant="ghost" size="icon" className={`hidden md:flex hover:text-gold transition ${scrolled ? 'text-black' : 'text-white'}`}>
                                <User className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* Wishlist Link */}
                        <div className="relative">
                            <Link to="/profile?tab=wishlist">
                                <Button variant="ghost" size="icon" className={`hover:text-gold transition ${scrolled ? 'text-black' : 'text-white'}`}>
                                    <Heart className="w-5 h-5" />
                                    {wishlist && wishlist.length > 0 && (
                                        <Badge className="absolute -top-1 -right-1 bg-gold hover:bg-gold/90 text-coffee-dark h-4 w-4 flex items-center justify-center rounded-full text-[9px] p-0">
                                            {wishlist.length}
                                        </Badge>
                                    )}
                                </Button>
                            </Link>
                        </div>

                        {/* Cart Icon */}
                        <div className="relative">
                            <button onClick={() => setIsCartOpen(true)} className={`hover:text-gold transition flex items-center justify-center p-2 rounded-md ${scrolled ? 'text-black' : 'text-white'}`}>
                                <ShoppingBag className="w-5 h-5" />
                                {cartItems && cartItems.length > 0 && (
                                    <Badge className="absolute -top-1 -right-1 bg-gold hover:bg-gold/90 text-coffee-dark h-5 w-5 flex items-center justify-center rounded-full text-[10px]">
                                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </Badge>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header >

            {/* 3. Navigation Bar (Mega Menu) */}
            < nav className={`hidden md:block border-b border-white/10 relative z-30 transition-all ${scrolled ? 'bg-white' : 'bg-transparent'}`}>
                <div className="container mx-auto flex justify-center">
                    <ul className="flex items-center space-x-12 h-14">
                        <li>
                            <Link to="/" className={`text-xs font-bold uppercase tracking-[0.15em] hover:text-gold transition-colors py-4 ${scrolled ? 'text-gray-800' : 'text-white'}`}>{t('home')}</Link>
                        </li>

                        {/* Mega Menu Trigger: SHOP */}
                        <li
                            className="group static"
                            onMouseEnter={() => setActiveMenu('shop')}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <Link to="/products" className={`text-xs font-bold uppercase tracking-[0.15em] hover:text-gold transition-colors py-4 flex items-center gap-1 ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                                {t('shop')} <ChevronDown size={12} />
                            </Link>

                            {/* Using Group Hover Logic for CSS-only Mega Menu fallback, or conditional rendering for React */}
                            {activeMenu === 'shop' && (
                                <div className="absolute left-0 top-full w-full bg-white border-b border-gray-200 shadow-xl py-12 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="container mx-auto px-4 grid grid-cols-4 gap-12">

                                        {/* Col 1: Categories */}
                                        <div className="space-y-4">
                                            <h3 className="font-serif text-lg font-bold text-coffee-dark mb-4">{t('categories')}</h3>
                                            <ul className="space-y-3">
                                                {navLinks.map(link => (
                                                    <li key={link.name}>
                                                        <Link to={link.href} className="text-sm text-gray-500 hover:text-gold hover:pl-2 transition-all block">
                                                            {link.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                                <li><Link to="/products" className="text-sm text-gray-500 hover:text-gold hover:pl-2 transition-all block">{t('view_all')}</Link></li>
                                            </ul>
                                        </div>

                                        {/* Col 2: Featured Collections */}
                                        <div className="space-y-4">
                                            <h3 className="font-serif text-lg font-bold text-coffee-dark mb-4">{t('collections')}</h3>
                                            <ul className="space-y-3">
                                                <li><Link to="#" className="text-sm text-gray-500 hover:text-gold hover:pl-2 transition-all block">{t('new_arrivals')}</Link></li>
                                                <li><Link to="#" className="text-sm text-gray-500 hover:text-gold hover:pl-2 transition-all block">{t('best_sellers')}</Link></li>
                                                <li><Link to="#" className="text-sm text-gray-500 hover:text-gold hover:pl-2 transition-all block">{t('ramadan_specials')}</Link></li>
                                                <li><Link to="#" className="text-sm text-gray-500 hover:text-gold hover:pl-2 transition-all block">{t('gift_sets')}</Link></li>
                                            </ul>
                                        </div>

                                        {/* Col 3 & 4: Highlight Images */}
                                        <div className="col-span-2 grid grid-cols-2 gap-6">
                                            <div className="relative group cursor-pointer overflow-hidden rounded-md">
                                                <img src="https://placehold.co/400x300/D4AF37/FFFFFF?text=Royal+Sidr+Honey" alt="Featured 1" className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                    <span className="text-white font-serif font-bold text-lg tracking-wider">{t('royal_honey')}</span>
                                                </div>
                                            </div>
                                            <div className="relative group cursor-pointer overflow-hidden rounded-md">
                                                <img src="https://placehold.co/400x300/4B3621/FFFFFF?text=Premium+Coffee" alt="Featured 2" className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                    <span className="text-white font-serif font-bold text-lg tracking-wider">{t('haraz_coffee')}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </li>

                        <li><Link to="/products?category=honey" className={`text-xs font-bold uppercase tracking-[0.15em] hover:text-gold transition-colors py-4 ${scrolled ? 'text-gray-800' : 'text-white'}`}>{t('honey')}</Link></li>
                        <li><Link to="/products?category=coffee" className={`text-xs font-bold uppercase tracking-[0.15em] hover:text-gold transition-colors py-4 ${scrolled ? 'text-gray-800' : 'text-white'}`}>{t('coffee')}</Link></li>
                        <li><Link to="/products?category=gifts" className={`text-xs font-bold uppercase tracking-[0.15em] text-gold hover:text-gold/80 transition-colors py-4 ${scrolled ? 'text-gold' : 'text-white'}`}>{t('gifts')}</Link></li>
                    </ul>
                </div>
            </nav >
            <CartDrawer />
        </div >
    );
};

export default Navbar;
