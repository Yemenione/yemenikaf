import React from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const ProductStory = ({ story, origin, artisan }) => {
    if (!story && !origin) return null;

    return (
        <section className="py-24 bg-cream overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Origin Story Section */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                    <div className="w-full md:w-1/2 relative">
                        <ScrollReveal>
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated">
                                <img
                                    src={origin?.image || "/images/yemen-landscape.jpg"}
                                    alt={origin?.region || "Yemen landscape"}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold/10 rounded-full blur-2xl -z-10"></div>
                        </ScrollReveal>
                    </div>

                    <div className="w-full md:w-1/2">
                        <ScrollReveal delay={0.2}>
                            <span className="text-gold font-serif italic text-lg mb-2 block">The Origin</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-coffee mb-6 leading-tight">
                                {origin?.title || "From the High Mountains of Yemen"}
                            </h2>
                            <p className="text-coffee-light/80 text-lg leading-relaxed mb-6">
                                {story || "Our products are sourced directly from ancient terraces where tradition has been preserved for centuries. Every harvest tells a story of resilience, dedication, and the rich soil of Yemen."}
                            </p>

                            {origin?.altitude && (
                                <div className="flex items-center gap-4 text-coffee font-medium">
                                    <span className="w-12 h-[1px] bg-gold"></span>
                                    <span>Grown at {origin.altitude}</span>
                                </div>
                            )}
                        </ScrollReveal>
                    </div>
                </div>

                {/* Artisan Profile (Optional) */}
                {artisan && (
                    <ScrollReveal>
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-soft border border-gold/10 relative mt-12">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-cream shadow-md flex-shrink-0">
                                    <img
                                        src={artisan.image || "/images/artisan-placeholder.jpg"}
                                        alt={artisan.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif text-coffee mb-2">Meet the Artisan: {artisan.name}</h3>
                                    <p className="text-coffee-light italic">"{artisan.quote}"</p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                )}
            </div>
        </section>
    );
};

export default ProductStory;
