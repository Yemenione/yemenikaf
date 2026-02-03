import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Star, Check, ArrowLeft, Truck, ShieldCheck, RefreshCw, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
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

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/${id}/reviews`);
                setReviews(response.data);
            } catch (err) {
                console.error("Error fetching reviews", err);
            }
        };
        fetchReviews();
    }, [id]);

    const handleReviewSubmit = async () => {
        if (!newReview.comment) return alert(t('please_add_comment'));
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/products/${id}/reviews`, newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewReview({ rating: 5, comment: '' });
            alert(t('review_submitted'));
            // Refresh reviews
            const response = await axios.get(`http://localhost:5000/api/products/${id}/reviews`);
            setReviews(response.data);
        } catch (err) {
            console.error("Error submitting review", err);
            alert(t('failed_submit'));
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

    return (
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
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Left: Image Gallery */}
                    <div className="lg:w-3/5 space-y-4">
                        <div className="bg-[#F9F7F5] w-full aspect-[4/5] rounded-none overflow-hidden relative group">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {(Array.isArray(product.images) ? product.images : []).map((img, idx) => (
                                <div key={idx} className="aspect-square bg-[#F9F7F5] overflow-hidden cursor-pointer hover:opacity-80 transition">
                                    <img src={img} alt="detail" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:w-2/5 flex flex-col pt-4">
                        <div className="border-b border-gray-100 pb-6 mb-8">
                            <h2 className="text-sm text-gold uppercase tracking-[0.2em] mb-2 font-medium">{t('single_origin')}</h2>
                            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-coffee-dark mb-4 leading-tight">
                                {i18n.language === 'ar' ? (product.name_ar || product.name) : (i18n.language === 'fr' ? (product.name_fr || product.name) : product.name)}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-2xl font-light text-coffee-dark">{t('price_with_currency', { amount: currentPrice })}</span>
                                <div className="flex items-center text-gold">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "currentColor" : "none"}
                                        />
                                    ))}
                                    <span className="text-gray-400 text-xs ml-2 tracking-wide">
                                        ({reviews.length} {reviews.length === 1 ? t('review') : t('reviews_count')})
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
                                <div className="flex items-center border border-gray-200 w-32 justify-between px-4 h-14">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-black"><Minus size={16} /></button>
                                    <span className="font-medium text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-black"><Plus size={16} /></button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 h-14 bg-coffee-dark hover:bg-gold text-white uppercase tracking-[0.15em] font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    {t('add_to_cart')} - {t('price_with_currency', { amount: (currentPrice * quantity).toFixed(2) })}
                                </Button>
                            </div>

                            <p className="text-xs text-center text-gray-400">
                                {t('free_shipping_notice')}
                            </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 mt-12 py-8 border-t border-gray-100">
                            <div className="text-center group">
                                <div className="w-12 h-12 rounded-full bg-[#F9F7F5] flex items-center justify-center mx-auto mb-3 text-gold group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                                    <Truck size={20} />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{t('global_delivery')}</h4>
                                <p className="text-[10px] text-gray-500">{t('fast_insured')}</p>
                            </div>
                            <div className="text-center group">
                                <div className="w-12 h-12 rounded-full bg-[#F9F7F5] flex items-center justify-center mx-auto mb-3 text-gold group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                                    <ShieldCheck size={20} />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{t('authenticity')}</h4>
                                <p className="text-[10px] text-gray-500">{t('verified_100')}</p>
                            </div>
                            <div className="text-center group">
                                <div className="w-12 h-12 rounded-full bg-[#F9F7F5] flex items-center justify-center mx-auto mb-3 text-gold group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                                    <RefreshCw size={20} />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{t('easy_returns')}</h4>
                                <p className="text-[10px] text-gray-500">{t('policy_30d')}</p>
                            </div>
                        </div>

                        {/* Details Tabs */}
                        <div className="mt-12">
                            <Tabs defaultValue="description" className="w-full">
                                <TabsList className="w-full justify-start border-b border-gray-200 rounded-none h-auto p-0 bg-transparent gap-8">
                                    <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-coffee-dark px-0 py-3 uppercase tracking-widest text-xs font-bold text-gray-400 bg-transparent shadow-none">{t('description')}</TabsTrigger>
                                    <TabsTrigger value="origin" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-coffee-dark px-0 py-3 uppercase tracking-widest text-xs font-bold text-gray-400 bg-transparent shadow-none">{t('origin')}</TabsTrigger>
                                    <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-coffee-dark px-0 py-3 uppercase tracking-widest text-xs font-bold text-gray-400 bg-transparent shadow-none">{t('reviews')}</TabsTrigger>
                                </TabsList>
                                <TabsContent value="description" className="pt-6 text-gray-600 font-light leading-relaxed">
                                    Our Royal Sidr Honey is not just food; it is a medicine, a luxury, and a piece of history. Harvested from the ancient Sidr trees in the protected Do'an valleys, this honey is monochromatic, meaning the bees only fed on the nectar of the Sidr flower.
                                </TabsContent>
                                <TabsContent value="origin" className="pt-6 text-gray-600 font-light leading-relaxed">
                                    Sourced directly from certified beekeepers in Hadramout, Yemen. We ensure that traditional methods are respected to bring you 100% raw, unfiltered honey.
                                </TabsContent>
                                <TabsContent value="reviews" className="pt-6">
                                    <div className="space-y-12">
                                        {/* Review Submission Form */}
                                        {localStorage.getItem('token') ? (
                                            <div className="bg-[#F9F7F5] p-6 rounded-sm">
                                                <h3 className="font-serif font-bold text-lg text-coffee-dark mb-4">{t('write_review')}</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">{t('rating')}</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                                    className={`${newReview.rating >= star ? 'text-gold' : 'text-gray-300'} transition-colors`}
                                                                >
                                                                    <Star fill={newReview.rating >= star ? 'currentColor' : 'none'} size={24} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">{t('comment')}</label>
                                                        <textarea
                                                            className="w-full bg-white border border-gray-200 p-4 min-h-[100px] text-sm focus:outline-gold"
                                                            placeholder={t('share_experience')}
                                                            value={newReview.comment}
                                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleReviewSubmit}
                                                        className="bg-coffee-dark text-white uppercase tracking-widest font-bold text-xs px-8 h-10"
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? t('submitting') : t('post_review')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 bg-[#F9F7F5] p-4 text-center">
                                                {t('login_to_review')} <button onClick={() => navigate('/login')} className="text-gold font-bold underline">{t('login')}</button>.
                                            </div>
                                        )}

                                        {/* Reviews List */}
                                        <div className="space-y-8">
                                            {reviews.length > 0 ? (
                                                reviews.map((rev) => (
                                                    <div key={rev.id} className="border-b border-gray-100 pb-8">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-coffee-dark capitalize">
                                                                    {rev.customers?.first_name} {rev.customers?.last_name}
                                                                </h4>
                                                                <div className="flex text-gold mb-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} className={i < rev.rating ? 'text-gold' : 'text-gray-200'} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">{t('no_reviews')}</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;
