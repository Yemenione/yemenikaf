import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPinOff, ArrowLeft, Wind } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const NotFound = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="min-h-[80vh] flex items-center justify-center px-4 overflow-hidden relative">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            x: [0, -40, 0],
                            y: [0, 60, 0],
                            opacity: [0.05, 0.15, 0.05]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-coffee/5 rounded-full blur-3xl"
                    />
                </div>

                <div className="max-w-xl w-full text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative inline-block mb-8">
                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    y: [0, -10, 0]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 bg-coffee-dark rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-gold/20"
                            >
                                <MapPinOff className="w-12 h-12 text-gold" strokeWidth={1.5} />
                            </motion.div>

                            <motion.div
                                animate={{ opacity: [0, 1, 0], x: [0, 20, 40], y: [0, -5, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-4 -right-4 text-gold/30"
                            >
                                <Wind size={32} />
                            </motion.div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-serif text-coffee-dark mb-6 tracking-tight">
                            {t('not_found_title')}
                        </h1>

                        <div className="w-20 h-px bg-gold/50 mx-auto mb-8" />

                        <p className="text-lg text-gray-600 font-light leading-relaxed mb-12 px-4 italic">
                            "{t('not_found_text')}"
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="group relative inline-flex items-center gap-3 bg-coffee-dark text-gold px-10 py-4 rounded-full font-medium tracking-widest text-sm transition-all shadow-xl hover:shadow-gold/10 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="relative uppercase">{t('return_home')}</span>
                        </motion.button>
                    </motion.div>

                    {/* Subtle 404 Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none">
                        <span className="text-[15rem] md:text-[20rem] font-serif font-bold text-gray-100/50 leading-none opacity-20">404</span>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default NotFound;
