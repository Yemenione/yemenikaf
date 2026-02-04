import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import ProductCard from './ProductCard';
import Navbar from './Navbar';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import ProductCardSkeleton from './ui/ProductCardSkeleton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet"
import ScrollReveal from './ui/ScrollReveal';

const ProductGrid = ({ isPage = true, limit = null, category = null }) => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams(); // Read URL params
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Initialize category from URL if available
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            // Capitalize first letter to match our category names logic (simple version)
            const formattedCat = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
            if (categories.includes(formattedCat)) {
                setSelectedCategory(formattedCat);
            } else if (categoryParam.toLowerCase() === 'honey') setSelectedCategory('Honey');
            else if (categoryParam.toLowerCase() === 'coffee') setSelectedCategory('Coffee');
            else if (categoryParam.toLowerCase() === 'spices') setSelectedCategory('Spices');
            else if (categoryParam.toLowerCase() === 'gifts') setSelectedCategory('Gifts');
        }
    }, [searchParams]);

    // Mock data for initial display if API fails
    const mockProducts = [
        {
            id: 1,
            name: "Sidr Honey (Royal)",
            name_ar: "عسل سدر ملكي",
            name_fr: "Miel Sidr Royal",
            description: "Premium Royal Sidr Honey from Do'an Valley.",
            price: 150,
            category: "Honey",
            imageUrl: "https://placehold.co/500x700/D4AF37/FFFFFF?text=Royal+Sidr"
        },
        {
            id: 2,
            name: "Yemeni Coffee (Mocha)",
            name_ar: "بن يمني (موكا)",
            name_fr: "Café Yéménite (Moka)",
            description: "Authentic Yemeni Mocha beans, medium roast.",
            price: 45,
            category: "Coffee",
            imageUrl: "https://placehold.co/500x700/4B3621/FFFFFF?text=Mocha+Beans",
            is_new: true
        },
        {
            id: 3,
            name: "Sidr Leaves Powder",
            name_ar: "مسحوق أوراق السدر",
            name_fr: "Poudre de feuilles de Sidr",
            description: "Organic Sidr leaves powder for health and beauty.",
            price: 25,
            category: "Spices",
            imageUrl: "https://placehold.co/500x700/3A5A40/FFFFFF?text=Sidr+Leaves"
        },
        {
            id: 4,
            name: "White Honey",
            name_ar: "العسل الأبيض",
            name_fr: "Miel Blanc",
            description: "Rare white honey from the mountains of Yemen.",
            price: 200,
            category: "Honey",
            imageUrl: "https://placehold.co/500x700/F0E68C/333333?text=White+Honey",
            discount: 10,
            old_price: 220
        },
        {
            id: 5,
            name: "Saffron Spices",
            name_ar: "بهارات الزعفران",
            name_fr: "Épices de Safran",
            description: "Premium grade saffron threads.",
            price: 85,
            category: "Spices",
            imageUrl: "https://placehold.co/500x700/E63946/FFFFFF?text=Saffron"
        },
        {
            id: 6,
            name: "Silver Jewelry Box",
            name_ar: "صندوق مجوهرات فضي",
            name_fr: "Boîte à bijoux en argent",
            description: "Handcrafted silver box from Sana'a.",
            price: 350,
            category: "Gifts",
            imageUrl: "https://placehold.co/500x700/C0C0C0/333333?text=Silver+Box"
        }
    ];

    // State for filters
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'name_asc');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    // Initialize state from URL 
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat.charAt(0).toUpperCase() + cat.slice(1));

        setMinPrice(searchParams.get('min_price') || '');
        setMaxPrice(searchParams.get('max_price') || '');
        setSort(searchParams.get('sort') || 'name_asc');
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                API_URL += '/api/products';
                const queryParts = [];

                if (selectedCategory && selectedCategory !== 'All') {
                    queryParts.push(`category=${encodeURIComponent(selectedCategory)}`);
                }

                if (minPrice) queryParts.push(`min_price=${minPrice}`);
                if (maxPrice) queryParts.push(`max_price=${maxPrice}`);
                if (sort) queryParts.push(`sort=${sort}`);
                if (searchQuery) queryParts.push(`search=${encodeURIComponent(searchQuery)}`);

                if (queryParts.length > 0) API_URL += `?${queryParts.join('&')}`;

                const response = await axios.get(API_URL);
                let data = response.data;

                // Client-side limit only (if strictly needed by prop)
                if (limit && Array.isArray(data)) data = data.slice(0, limit);

                if (Array.isArray(data)) setProducts(data);
                else setProducts([]);

            } catch (error) {
                console.log("API Error", error);
                setProducts(mockProducts); // Fallback
            } finally {
                setLoading(false);
            }
        };

        // Debounce fetching slightly or just run on dependency change
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [searchParams, selectedCategory, minPrice, maxPrice, sort, limit, searchQuery]);

    // Update URL helper
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'All') newParams.set(key, value);
        else newParams.delete(key);
        // We navigate to the new URL, which triggers the useEffect above
        // Note: Using window.history.pushState or similar binding usually better, 
        // but let's assume parent passes setUrl or we rely on internal state triggering re-fetch for now?
        // Actually, best to use navigate from react-router-dom if we want URL sync.
        // For this component, let's keep it simple: we update internal state, 
        // AND ideally we should replace URL. But `useSearchParams` set method is needed.
    };

    const categories = ['All', 'Honey', 'Coffee', 'Spices', 'Gifts'];

    let filteredProducts = products.filter(p =>
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (limit) {
        filteredProducts = filteredProducts.slice(0, limit);
    }

    if (loading) {
        return (
            <div className={`grid grid-cols-2 ${isPage ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-x-6 gap-y-12`}>
                {[...Array(limit || 8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    const Content = () => (
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filters (Desktop) - Only show if isPage is true */}
            {isPage && (
                <div className="hidden lg:block w-64 flex-shrink-0 space-y-10">
                    {/* Categories */}
                    <div>
                        <h3 className="font-serif text-lg font-bold text-coffee-dark mb-6 pb-2 border-b border-gray-100">{t('categories')}</h3>
                        <ul className="space-y-4">
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`text-sm tracking-wide transition-colors duration-200 ${selectedCategory === cat ? 'text-gold font-bold pl-2 border-l-2 border-gold' : 'text-gray-500 hover:text-gold'}`}
                                    >
                                        {cat === 'All' ? t('view_all') : t(cat.toLowerCase())}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Price Filter */}
                    <div>
                        <h3 className="font-serif text-lg font-bold text-coffee-dark mb-6 pb-2 border-b border-gray-100">{t('price_range')}</h3>
                        <div className="space-y-4 px-1">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={t('min_price_placeholder')}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50 focus:ring-gold focus:border-gold"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder={t('max_price_placeholder')}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50 focus:ring-gold focus:border-gold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort Filter (Sidebar version if needed, or stick to top) */}
                    <div>
                        <h3 className="font-serif text-lg font-bold text-coffee-dark mb-6 pb-2 border-b border-gray-100">{t('sort_by')}</h3>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-2 text-sm bg-gray-50 text-gray-700"
                        >
                            <option value="newest">{t('newest_arrivals')}</option>
                            <option value="price_asc">{t('price_low_to_high')}</option>
                            <option value="price_desc">{t('price_high_to_low')}</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Product Grid Area */}
            <div className="flex-1">
                {/* Mobile Filters and Sort Bar - Only show if isPage is true */}
                {isPage && (
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="lg:hidden w-full md:w-auto">
                            <Sheet>
                                <SheetTrigger className="w-full md:w-auto flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-coffee-dark border border-gray-200 px-6 py-3 rounded-sm hover:border-gold transition">
                                    <SlidersHorizontal size={16} /> {t('filters')}
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle className="font-serif text-2xl text-coffee-dark">{t('filters')}</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-8 space-y-8">
                                        <div>
                                            <h4 className="font-medium mb-4 text-gold">{t('categories')}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`px-3 py-1 text-sm border rounded-full transition-colors ${selectedCategory === cat ? 'bg-coffee-dark text-white border-coffee-dark' : 'bg-white text-gray-500 border-gray-200'}`}
                                                    >
                                                        {cat === 'All' ? t('view_all') : t(cat.toLowerCase())}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-4 text-gold">{t('price_range')}</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-4 text-gold">{t('sort_by')}</h4>
                                            <select
                                                value={sort}
                                                onChange={(e) => setSort(e.target.value)}
                                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-white"
                                            >
                                                <option value="newest">{t('newest_arrivals')}</option>
                                                <option value="price_asc">{t('price_low_to_high')}</option>
                                                <option value="price_desc">{t('price_high_to_low')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="hidden lg:flex items-center gap-4 ml-auto">
                            <span className="text-sm text-gray-500">{t('showing_results', { count: filteredProducts.length })}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">{t('sort')}:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="border-none bg-transparent text-sm font-bold text-coffee-dark focus:ring-0 cursor-pointer hover:text-gold"
                                >
                                    <option value="newest">{t('featured')}</option>
                                    <option value="price_asc">{t('price_low_to_high')}</option>
                                    <option value="price_desc">{t('price_high_to_low')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-2 ${isPage ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-x-6 gap-y-12`}>
                    {filteredProducts.map((product, index) => (
                        <ScrollReveal key={product.id} delay={index * 0.05} width="100%">
                            <ProductCard product={product} />
                        </ScrollReveal>
                    ))}
                </div>

                {isPage && (
                    <div className="mt-20 text-center">
                        <button className="text-xs uppercase tracking-[0.2em] text-coffee-dark hover:text-gold border-b border-coffee-dark hover:border-gold pb-1 transition-all duration-300">
                            {t('load_more')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // If it's a full page, wrap in structural layout
    if (isPage) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                {/* Header / Banner */}
                <div className="bg-[#1A1A1A] pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4 tracking-tight">{t('our_collections')}</h1>
                        <p className="text-gray-400 font-light max-w-2xl mx-auto text-lg">
                            {t('collections_desc')}
                        </p>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-12">
                    <Content />
                </div>
            </div>
        );
    }

    // If embedded (e.g. Home page), just return the content wrapper (without container constraints if parent handles it)
    return <Content />;
};

export default ProductGrid;
