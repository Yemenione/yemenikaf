import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import { ArrowRight, Star, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import HeroCarousel from '../components/HeroCarousel'; // Import Carousel
import Newsletter from '../components/Newsletter';
import ScrollReveal from '../components/UI/ScrollReveal';

const Home = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />

            {/* Cinematic Hero Section */}
            <HeroCarousel />

            {/* 2. CATEGORY MOSAIC */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <span className="text-gold text-xs font-bold uppercase tracking-widest mb-3 block">{t('from_source')}</span>
                            <h2 className="text-4xl font-serif text-coffee-dark">{t('curated_collections')}</h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 h-auto lg:h-[600px]">
                        {/* Big Item 1 (Honey) */}
                        <div className="lg:col-span-6 relative group overflow-hidden cursor-pointer h-[400px] lg:h-full">
                            <ScrollReveal delay={0.1} width="100%" height="100%">
                                <div className="w-full h-full relative">
                                    <img src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Sidr Honey" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <h3 className="text-3xl font-serif font-bold mb-2">{t('sidr_honey')}</h3>
                                        <Link to="/products?category=honey" className="text-sm font-bold uppercase tracking-widest border-b border-white pb-1 hover:text-gold hover:border-gold transition-all">{t('explore_collection')}</Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Top Right (Coffee) */}
                        <div className="lg:col-span-6 lg:row-span-1 grid grid-cols-2 gap-4 h-full">
                            <div className="col-span-2 relative group overflow-hidden cursor-pointer h-[300px] lg:h-full">
                                <ScrollReveal delay={0.2} width="100%" height="100%">
                                    <div className="w-full h-full relative">
                                        <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Coffee" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                                        <div className="absolute bottom-6 left-6 text-white">
                                            <h3 className="text-2xl font-serif font-bold mb-1">{t('mountain_coffee')}</h3>
                                            <Link to="/products?category=coffee" className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">{t('shop_now')}</Link>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>

                        {/* Bottom Right Split (Spices / Gifts) */}
                        <div className="lg:col-span-3 relative group overflow-hidden cursor-pointer h-[300px] lg:h-[292px] lg:-mt-[296px] lg:mr-[calc(100%+1rem)] hidden">
                            {/* Layout trickery with grid is tricky in react without explicit structure, simplifying */}
                        </div>
                    </div>

                    {/* Secondary Grid Row for Spices/Gifts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 h-[300px]">
                        <div className="relative group overflow-hidden cursor-pointer">
                            <ScrollReveal delay={0.3} width="100%" height="100%">
                                <div className="w-full h-full relative">
                                    <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gifts" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h3 className="text-2xl font-serif font-bold mb-1">{t('gift_sets')}</h3>
                                        <Link to="/products?category=gifts" className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">{t('view_gifts')}</Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                        <div className="relative group overflow-hidden cursor-pointer">
                            <ScrollReveal delay={0.4} width="100%" height="100%">
                                <div className="w-full h-full relative">
                                    <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Spices" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h3 className="text-2xl font-serif font-bold mb-1">{t('rare_spices')}</h3>
                                        <Link to="/products?category=spices" className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">{t('shop_spices')}</Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </section>


            {/* 3. SIGNATURE COLLECTIONS */}
            <section className="py-20 bg-[#fafafa]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">{t('liquid_gold')}</span>
                        <h2 className="text-3xl font-serif text-coffee-dark">{t('royal_sidr_honey')}</h2>
                        <Link to="/products?category=honey" className="text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-gold hover:text-gold transition-all mt-4 inline-block">{t('view_collection')}</Link>
                    </div>
                    <ProductGrid limit={4} category="honey" isPage={false} />
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">{t('mountain_haraz')}</span>
                        <h2 className="text-3xl font-serif text-coffee-dark">{t('premium_coffee')}</h2>
                        <Link to="/products?category=coffee" className="text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-gold hover:text-gold transition-all mt-4 inline-block">{t('view_collection')}</Link>
                    </div>
                    <ProductGrid limit={4} category="coffee" isPage={false} />
                </div>
            </section>

            {/* 4. BEST SELLERS */}
            <section className="py-24 bg-[#fafafa]">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">{t('weekly_favorites')}</span>
                            <h2 className="text-3xl font-serif text-coffee-dark">{t('all_best_sellers')}</h2>
                        </div>
                        <Link to="/products">
                            <Button variant="outline" className="hidden md:flex border-gray-300 hover:border-gold hover:text-gold uppercase text-xs tracking-widest font-bold">
                                {t('view_all_products')}
                            </Button>
                        </Link>
                    </div>

                    <ProductGrid limit={4} isPage={false} />

                    <div className="mt-12 text-center md:hidden">
                        <Link to="/products">
                            <Button variant="outline" className="w-full">{t('view_all')}</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. VALUE PROPOSITION */}
            <section className="py-20 bg-coffee-dark text-white">
                <div className="container mx-auto px-4">
                    <ScrollReveal>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                            <div className="space-y-4">
                                <ShieldCheck className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                                <h4 className="font-serif text-xl">{t('authentic_title')}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{t('authentic_desc')}</p>
                            </div>
                            <div className="space-y-4">
                                <Truck className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                                <h4 className="font-serif text-xl">{t('global_delivery')}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{t('global_shipping_desc')}</p>
                            </div>
                            <div className="space-y-4">
                                <Star className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                                <h4 className="font-serif text-xl">{t('premium_quality_title')}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{t('premium_quality_desc')}</p>
                            </div>
                            <div className="space-y-4">
                                <ShoppingBag className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                                <h4 className="font-serif text-xl">{t('secure_checkout_title')}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{t('secure_checkout_desc')}</p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* 5. FOOTER (Simplified for now, Navbar has Footer component usually, but including here for completeness) */}
            <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div>
                        <h4 className="text-2xl font-serif font-bold mb-6 text-coffee-dark">YEMENI<span className="text-gold">.MARKET</span></h4>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            {t('footer_tagline')}
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-900">{t('shop')}</h5>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link to="/products?category=honey" className="hover:text-gold transition">{t('honey')}</Link></li>
                            <li><Link to="/products?category=coffee" className="hover:text-gold transition">{t('coffee')}</Link></li>
                            <li><Link to="/products?category=spices" className="hover:text-gold transition">{t('spices')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-900">{t('support')}</h5>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link to="/contact" className="hover:text-gold transition">{t('contact_us')}</Link></li>
                            <li><Link to="/privacy" className="hover:text-gold transition">{t('privacy_policy')}</Link></li>
                            <li><Link to="/terms" className="hover:text-gold transition">{t('terms')}</Link></li>
                            <li><Link to="/returns" className="hover:text-gold transition">{t('returns_refunds')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-900">{t('newsletter')}</h5>
                        {/* Integrated Component elsewhere, keeping this for layout balance or removing */}
                        <p className="text-sm text-gray-500">{t('newsletter_join')}</p>
                    </div>
                </div>

                {/* Full Width Newsletter Component */}
                <div className="mb-20">
                    <Newsletter />
                </div>

                <div className="container mx-auto px-4 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>&copy; 2026 Yemeni Market. {t('all_rights_reserved')}</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
