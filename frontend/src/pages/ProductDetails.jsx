import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Star, Check, ArrowLeft, Truck, ShieldCheck, RefreshCw, Minus, Plus, Shield, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Premium UI & SEO Components
import PageTransition from '../components/ui/PageTransition';
import ProductStory from '../components/Product/ProductStory';
import TrustBadges from '../components/Product/TrustBadges';
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import MetaTags from '../components/SEO/MetaTags';
import ProductSchema from '../components/SEO/ProductSchema';
import Skeleton from '../components/ui/skeleton';

// Tabs Component for Details/Reviews
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/products/${id}/reviews`);
                setReviews(response.data);
            } catch (err) {
                console.error("Error fetching reviews", err);
            }
        };
        fetchReviews();
    }, [id]);

    const handleReviewSubmit = async () => {
        if (!newReview.comment) return toast.error(t('please_add_comment'));
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/products/${id}/reviews`, newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewReview({ rating: 5, comment: '' });
            toast.success(t('review_submitted'));
            // Refresh reviews
            const response = await axios.get(`http://localhost:5000/api/products/${id}/reviews`);
            setReviews(response.data);
        } catch (err) {
            console.error("Error submitting review", err);
            toast.error(t('failed_submit'));
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.log("Using fallback mock data");
                // Expanded Mock Data
                setProduct({
                    id: id,
                    name: "Royal Sidr Honey",
                    name_ar: "عسل سدر ملكي",
                    description: "Harvested from the remote Do'an valley, this Royal Sidr Honey is known for its exquisite taste and potent health benefits. A rare delicacy reserved for the connoisseur, offering rich caramel notes and a smooth, golden texture.",
                    price: 150,
                    currency: "USD",
                    stock_quantity: 10,
                    imageUrl: "https://placehold.co/800x1000/D4AF37/FFFFFF?text=Royal+Sidr+Honey",
                    images: [
                        "https://placehold.co/800x1000/D4AF37/FFFFFF?text=Side+View",
                        "https://placehold.co/800x1000/4B3621/FFFFFF?text=Texture",
                        "https://placehold.co/800x1000/F5F5F5/333333?text=Packaging"
                    ],
                    variants: [
                        { id: 101, name: "250g Jar", price: 85 },
                        { id: 102, name: "500g Jar", price: 150 },
                        { id: 103, name: "1kg Premium Box", price: 280 }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariant);
        // Maybe show a toast notification here
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="container mx-auto px-4 pt-32 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                        <div className="space-y-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-8 w-1/4" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-14 w-1/4" />
                                <Skeleton className="h-14 flex-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!product) return <div className="h-screen flex items-center justify-center text-red-500">{t('product_not_found')}</div>;

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;

    // Mock Story Data (In a real app, this would come from the DB)
    const productStory = {
        origin: {
            title: `From the peaks of ${product.category === 'coffee' ? 'Haraz' : 'Doan'}`,
            image: product.category === 'coffee' ? 'https://placehold.co/1200x800/4B3621/FFFFFF?text=Haraz+Mountain+Coffee+Farm' : 'https://placehold.co/1200x800/D4AF37/FFFFFF?text=Doan+Valley+Honey',
            altitude: '2,500m'
        },
        artisan: {
            name: "Ahmed Al-Jaberi",
            quote: "We don't just grow coffee; we preserve a thousand years of history.",
            image: "https://placehold.co/400x400/2C1E14/FFFFFF?text=Farmer+Ahmed"
        }
    };

    return (
        <PageTransition>
            <MetaTags
                title={product.name}
                description={product.description?.substring(0, 160)}
                image={product.imageUrl}
                type="product"
            />
            <ProductSchema product={{
                ...product,
                images: [product.imageUrl],
                id: product.id,
                stock: product.stock_quantity || 10
            }} />

            <div className="min-h-screen bg-white font-sans">
                <Navbar />

                {/* Breadcrumb / Back */}
                <div className="container mx-auto px-4 py-6">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-gold transition-colors text-sm uppercase tracking-widest">
                        <ArrowLeft className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
                        {t('back_to_shop')}
                    </button>
                </div>

                <main className="container mx-auto px-4 pb-20">
                    <div className="flex flex-col lg:flex-row gap-16 mb-24">

                        {/* Left: Image Gallery */}
                        <div className="lg:w-3/5 space-y-4">
                            <div className="bg-[#F9F7F5] w-full aspect-[4/5] rounded-2xl overflow-hidden relative group shadow-soft">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                                />
                                <div className="absolute top-4 left-4">
                                    {product.stock_quantity < 5 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Low Stock</span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {(Array.isArray(product.images) ? product.images : []).map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-[#F9F7F5] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition hover:shadow-md">
                                        <img src={img} alt="detail" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Info COMPACTED for better visual balance */}
                        <div className="lg:w-2/5 flex flex-col pt-4">
                            <div className="border-b border-gray-100 pb-6 mb-8">
                                <h1 className="text-4xl lg:text-5xl font-serif font-bold text-coffee-dark mb-4 leading-tight">
                                    {i18n.language === 'ar' ? (product.name_ar || product.name) : (i18n.language === 'fr' ? (product.name_fr || product.name) : product.name)}
                                </h1>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-3xl font-light text-coffee-dark">{t('price_with_currency', { amount: currentPrice })}</span>
                                    <div className="flex items-center text-gold bg-gold/5 px-2 py-1 rounded-md">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "currentColor" : "none"}
                                            />
                                        ))}
                                        <span className="text-coffee-light text-xs ml-2 tracking-wide font-medium">
                                            {reviews.length} {t('reviews_count')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-light text-lg">
                                    {product.description}
                                </p>
                            </div>

                            {/* Variants */}
                            {product.variants && (
                                <div className="mb-8">
                                    <span className="block text-xs uppercase tracking-widest text-gray-900 font-bold mb-3">{t('select_size')}</span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map(variant => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`px-6 py-3 border text-sm transition-all duration-200 min-w-[100px] ${selectedVariant?.id === variant.id ? 'border-gold bg-gold text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-gold/50'}`}
                                            >
                                                <span className="block font-medium">{variant.name}</span>
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setSelectedVariant(null)}
                                            className={`px-6 py-3 border text-sm transition-all duration-200 min-w-[100px] ${!selectedVariant ? 'border-gold bg-gold text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-gold/50'}`}
                                        >
                                            <span className="block font-medium">{t('standard')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex items-center border border-gray-200 w-32 justify-between px-4 h-14 rounded-lg">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-black"><Minus size={16} /></button>
                                        <span className="font-medium text-lg text-coffee">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-black"><Plus size={16} /></button>
                                    </div>
                                    <Button
                                        onClick={handleAddToCart}
                                        className="flex-1 h-14 bg-coffee-dark hover:bg-gold text-white uppercase tracking-[0.15em] font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
                                    >
                                        {t('add_to_cart')} - {t('price_with_currency', { amount: (currentPrice * quantity).toFixed(2) })}
                                    </Button>
                                    <button className="h-14 w-14 border border-gray-200 rounded-lg flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                                        <Heart className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <TrustBadges variant="compact" />

                        </div>
                    </div>

                    {/* NEW SECTION: IMMERSIVE STORYTELLING */}
                    <ProductStory
                        story={product.description}
                        origin={productStory.origin}
                        artisan={productStory.artisan}
                    />

                    {/* Details Tabs */}
                    <div className="mt-24 max-w-4xl mx-auto">
                        <Tabs defaultValue="reviews" className="w-full">
                            <TabsList className="w-full justify-center border-b border-gray-200 rounded-none h-auto p-0 bg-transparent gap-12 mb-12">
                                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-coffee-dark px-0 py-3 uppercase tracking-widest text-xs font-bold text-gray-400 bg-transparent shadow-none hover:text-coffee transition-colors">{t('description')}</TabsTrigger>
                                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-coffee-dark px-0 py-3 uppercase tracking-widest text-xs font-bold text-gray-400 bg-transparent shadow-none hover:text-coffee transition-colors">{t('reviews')} ({reviews.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="description" className="text-center text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
                                <p className="mb-6">Our Royal Sidr Honey is not just food; it is a medicine, a luxury, and a piece of history. Harvested from the ancient Sidr trees in the protected Do'an valleys, this honey is monochromatic, meaning the bees only fed on the nectar of the Sidr flower.</p>
                                <p>Sourced directly from certified beekeepers in Hadramout, Yemen. We ensure that traditional methods are respected to bring you 100% raw, unfiltered honey.</p>
                            </TabsContent>
                            <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-12">
                                    {/* Review Submission Form */}
                                    {localStorage.getItem('token') ? (
                                        <div className="bg-[#F9F7F5] p-8 rounded-xl shadow-inner">
                                            <h3 className="font-serif font-bold text-xl text-coffee-dark mb-6 text-center">{t('write_review')}</h3>
                                            <div className="max-w-xl mx-auto space-y-6">
                                                <div className="text-center">
                                                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">{t('rating')}</label>
                                                    <div className="flex justify-center gap-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                                className={`${newReview.rating >= star ? 'text-gold' : 'text-gray-300'} transition-all hover:scale-110`}
                                                            >
                                                                <Star fill={newReview.rating >= star ? 'currentColor' : 'none'} size={32} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <textarea
                                                        className="w-full bg-white border-0 ring-1 ring-gray-200 p-4 min-h-[120px] text-sm focus:ring-gold rounded-lg shadow-sm"
                                                        placeholder={t('share_experience')}
                                                        value={newReview.comment}
                                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleReviewSubmit}
                                                    className="w-full bg-coffee-dark text-white uppercase tracking-widest font-bold text-xs h-12 rounded-lg hover:bg-gold transition-colors"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? t('submitting') : t('post_review')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 mb-4">{t('login_to_review')}</p>
                                            <Button onClick={() => navigate('/login')} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white uppercase tracking-widest text-xs font-bold px-8">
                                                {t('login')}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="max-w-2xl mx-auto space-y-10">
                                        {reviews.length > 0 ? (
                                            reviews.map((rev) => (
                                                <div key={rev.id} className="border-b border-gray-100 pb-8 last:border-0">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-coffee text-white flex items-center justify-center font-serif font-bold text-lg">
                                                                {rev.customers?.first_name?.[0]}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-coffee-dark capitalize">
                                                                    {rev.customers?.first_name} {rev.customers?.last_name}
                                                                </h4>
                                                                <div className="flex text-gold text-[10px] gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} size={10} fill={i < rev.rating ? 'currentColor' : 'none'} className={i < rev.rating ? 'text-gold' : 'text-gray-200'} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-mono">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed pl-14 italic">"{rev.comment}"</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic text-center py-8">{t('no_reviews')}</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default ProductDetails;
