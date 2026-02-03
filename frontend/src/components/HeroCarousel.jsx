import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const HeroCarousel = () => {
    const { t } = useTranslation();
    const slides = [
        {
            id: 1,
            title: t('slide_honey_title'),
            subtitle: t('slide_honey_sub'),
            image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            link: "/products?category=honey",
            color: "from-amber-900/80 to-black/60"
        },
        {
            id: 2,
            title: t('slide_coffee_title'),
            subtitle: t('slide_coffee_sub'),
            image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            link: "/products?category=coffee",
            color: "from-amber-950/80 to-black/60"
        },
        {
            id: 3,
            title: t('slide_spices_title'),
            subtitle: t('slide_spices_sub'),
            image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
            link: "/products?category=spices",
            color: "from-red-950/80 to-black/60"
        }
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000); // Auto-advance every 5 seconds
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative h-[85vh] w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image */}
                    <img
                        src={slides[current].image}
                        alt={slides[current].title}
                        className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].color} mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-black/30" />
                </motion.div>
            </AnimatePresence>

            {/* Content Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4">
                <div className="max-w-4xl space-y-6">
                    <motion.div
                        key={current + "text"}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <span className="text-gold text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-4 block">
                            {t('authentic_heritage')}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 tracking-tight">
                            {slides[current].title}
                        </h1>
                        <p className="text-gray-200 text-lg md:text-xl font-light italic max-w-2xl mx-auto mb-10 opacity-90">
                            {slides[current].subtitle}
                        </p>

                        <div className="flex justify-center gap-4">
                            <Link to={slides[current].link}>
                                <Button className="bg-gold hover:bg-gold/90 text-coffee-dark px-8 py-6 text-sm uppercase tracking-widest font-bold rounded-none">
                                    {t('shop_collection')}
                                </Button>
                            </Link>
                            <Link to="/products">
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-sm uppercase tracking-widest font-bold rounded-none bg-transparent">
                                    {t('view_all')}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Navigation Buttons (Optional, minimalist) */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2"
            >
                <ChevronLeft size={40} strokeWidth={1} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2"
            >
                <ChevronRight size={40} strokeWidth={1} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`h-1 transition-all duration-300 ${idx === current ? 'w-12 bg-gold' : 'w-6 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
