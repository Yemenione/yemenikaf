import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import { ArrowRight, Star, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Hero3D from '../components/Three/Hero3D'; // Import 3D Hero

const Home = () => {

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />

            {/* Cinematic Hero Section */}
            <Hero3D />

            {/* 2. CATEGORY MOSAIC */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-gold text-xs font-bold uppercase tracking-widest mb-3 block">From the Source</span>
                        <h2 className="text-4xl font-serif text-coffee-dark">Curated Collections</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 h-auto lg:h-[600px]">
                        {/* Big Item 1 (Honey) */}
                        <div className="lg:col-span-6 relative group overflow-hidden cursor-pointer h-[400px] lg:h-full">
                            <img src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Sidr Honey" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                            <div className="absolute bottom-8 left-8 text-white">
                                <h3 className="text-3xl font-serif font-bold mb-2">Sidr Honey</h3>
                                <Link to="/products?category=honey" className="text-sm font-bold uppercase tracking-widest border-b border-white pb-1 hover:text-gold hover:border-gold transition-all">Explore Collection</Link>
                            </div>
                        </div>

                        {/* Top Right (Coffee) */}
                        <div className="lg:col-span-6 lg:row-span-1 grid grid-cols-2 gap-4 h-full">
                            <div className="col-span-2 relative group overflow-hidden cursor-pointer h-[300px] lg:h-full">
                                <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Coffee" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-serif font-bold mb-1">Mountain Coffee</h3>
                                    <Link to="/products?category=coffee" className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">Shop Now</Link>
                                </div>
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
                            <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gifts" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="text-2xl font-serif font-bold mb-1">Gift Sets</h3>
                                <Link to="/products?category=gifts" className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">View Gifts</Link>
                            </div>
                        </div>
                        <div className="relative group overflow-hidden cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Spices" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="text-2xl font-serif font-bold mb-1">Rare Spices</h3>
                                <Link to="/products?category=spices" className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">Shop Spices</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. BEST SELLERS */}
            <section className="py-24 bg-[#fafafa]">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">Weekly Favorites</span>
                            <h2 className="text-3xl font-serif text-coffee-dark">Best Sellers</h2>
                        </div>
                        <Link to="/products">
                            <Button variant="outline" className="hidden md:flex border-gray-300 hover:border-gold hover:text-gold uppercase text-xs tracking-widest font-bold">
                                View All Products
                            </Button>
                        </Link>
                    </div>

                    <ProductGrid limit={4} isPage={false} />

                    <div className="mt-12 text-center md:hidden">
                        <Link to="/products">
                            <Button variant="outline" className="w-full">View All</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. VALUE PROPOSITION */}
            <section className="py-20 bg-coffee-dark text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                        <div className="space-y-4">
                            <ShieldCheck className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                            <h4 className="font-serif text-xl">100% Authentic</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">Verified origin from the most prestigious farms in Yemen.</p>
                        </div>
                        <div className="space-y-4">
                            <Truck className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                            <h4 className="font-serif text-xl">Global Shipping</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">Fast, insured delivery to your doorstep, anywhere in the world.</p>
                        </div>
                        <div className="space-y-4">
                            <Star className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                            <h4 className="font-serif text-xl">Premium Quality</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">Only the highest grade (A+) products make it to our collection.</p>
                        </div>
                        <div className="space-y-4">
                            <ShoppingBag className="w-10 h-10 text-gold mx-auto md:mx-0" strokeWidth={1} />
                            <h4 className="font-serif text-xl">Secure Checkout</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">Protected payments via Stripe with full buyer protection.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FOOTER (Simplified for now, Navbar has Footer component usually, but including here for completeness) */}
            <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div>
                        <h4 className="text-2xl font-serif font-bold mb-6 text-coffee-dark">YEMENI<span className="text-gold">.MARKET</span></h4>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Bridging the gap between ancient Yemeni tradition and the modern world.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-900">Shop</h5>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link to="/products?category=honey" className="hover:text-gold transition">Honey</Link></li>
                            <li><Link to="/products?category=coffee" className="hover:text-gold transition">Coffee</Link></li>
                            <li><Link to="/products?category=spices" className="hover:text-gold transition">Spices</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-900">Support</h5>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link to="/contact" className="hover:text-gold transition">Contact Us</Link></li>
                            <li><Link to="/shipping" className="hover:text-gold transition">Shipping</Link></li>
                            <li><Link to="/returns" className="hover:text-gold transition">Returns</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-900">Newsletter</h5>
                        <div className="flex flex-col gap-3">
                            <input type="email" placeholder="Email address" className="bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                            <Button className="bg-coffee-dark text-white hover:bg-gold hover:text-white uppercase text-xs font-bold tracking-widest">Subscribe</Button>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>&copy; 2026 Yemeni Market. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
