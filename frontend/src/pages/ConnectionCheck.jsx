import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Zap, Database, CreditCard, Server } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const ConnectionCheck = () => {
    const [status, setStatus] = useState({
        backend: 'loading',
        database: 'loading',
        stripe: 'loading',
        details: null
    });
    const [isChecking, setIsChecking] = useState(false);

    const checkConnectivity = async () => {
        setIsChecking(true);
        setStatus({ backend: 'loading', database: 'loading', stripe: 'loading', details: null });

        let API_URL = import.meta.env.VITE_API_URL || 'https://api.yemenimarket.fr/';
        // Sanitize: remove trailing slash if exists
        if (API_URL.endsWith('/')) {
            API_URL = API_URL.slice(0, -1);
        }

        try {
            const start = Date.now();
            const response = await axios.get(`${API_URL}/api/test`);
            const end = Date.now();
            const latency = end - start;

            const data = response.data;
            const isLegacy = !data.database; // Old backend doesn't have 'database' field

            setStatus({
                backend: 'connected',
                database: data.database === 'connected' || isLegacy ? 'connected' : 'error',
                stripe: (data.env_check?.stripe_status === 'connected' || data.env_check?.stripe_enabled)
                    ? 'connected'
                    : (data.env_check?.stripe_status === 'error' ? 'error' : 'warning'),
                details: {
                    latency: `${latency}ms`,
                    stripe: data.env_check?.stripe_details || (data.env_check?.stripe_enabled ? { status: 'Enabled (Legacy)' } : null),
                    version: data.version || '1.0.0 (Legacy Backend)'
                }
            });
        } catch (error) {
            console.error("Check failed:", error);
            setStatus({
                backend: 'error',
                database: 'error',
                stripe: 'error',
                details: { error: error.message }
            });
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkConnectivity();
    }, []);

    const StatusCard = ({ title, state, icon: Icon, description }) => {
        const colors = {
            connected: 'text-green-500 bg-green-500/10 border-green-500/20',
            loading: 'text-gold bg-gold/10 border-gold/20 animate-pulse',
            error: 'text-red-500 bg-red-500/10 border-red-500/20',
            warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        };

        const icons = {
            connected: <CheckCircle2 className="w-6 h-6" />,
            loading: <RefreshCw className="w-6 h-6 animate-spin" />,
            error: <XCircle className="w-6 h-6" />,
            warning: <AlertCircle className="w-6 h-6" />
        };

        return (
            <motion.div
                layout
                className={`p-6 rounded-2xl border ${colors[state]} transition-all duration-500 flex items-center justify-between gap-4`}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/50 shadow-sm">
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-coffee-dark capitalize">{title}</h3>
                        <p className="text-sm opacity-70">{description || (state === 'connected' ? 'Everything looks perfect' : 'Checking status...')}</p>
                    </div>
                </div>
                <div>
                    {icons[state]}
                </div>
            </motion.div>
        );
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#F9F7F5] pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <header className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-full text-xs font-bold tracking-widest uppercase mb-4"
                        >
                            <Zap size={14} /> System Diagnostics
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-coffee-dark mb-4">Connection Center</h1>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            Verifying local environment connectivity with the Yemeni Market Ecosystem.
                        </p>
                    </header>

                    <div className="grid gap-6 mb-12">
                        <StatusCard
                            title="Backend API"
                            state={status.backend}
                            icon={Server}
                            description={status.backend === 'connected' ? `Connected to ${import.meta.env.VITE_API_URL || 'production'}` : null}
                        />
                        <StatusCard
                            title="Database"
                            state={status.database}
                            icon={Database}
                        />
                        <StatusCard
                            title="Stripe Integration"
                            state={status.stripe}
                            icon={CreditCard}
                            description={status.stripe === 'warning' ? 'Missing configuration' : null}
                        />
                    </div>

                    <AnimatePresence>
                        {status.details && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-coffee/5 mb-12"
                            >
                                <h3 className="text-xl font-bold text-coffee-dark mb-6 flex items-center gap-2">
                                    <Zap className="text-gold" size={20} /> Diagnostic Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                            <span className="text-gray-400">Response Time</span>
                                            <span className="font-mono font-bold text-coffee-dark">{status.details.latency}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                            <span className="text-gray-400">API Version</span>
                                            <span className="font-mono font-bold text-coffee-dark">{status.details.version || '1.0.0'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {status.details.stripe && (
                                            <>
                                                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                                    <span className="text-gray-400">Stripe Account</span>
                                                    <span className="font-mono font-bold text-coffee-dark text-xs">{status.details.stripe.id}</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                                    <span className="text-gray-400">Business</span>
                                                    <span className="font-mono font-bold text-coffee-dark">{status.details.stripe.business_name || 'Individual'}</span>
                                                </div>
                                            </>
                                        )}
                                        {status.details.error && (
                                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                                <p className="text-xs text-red-600 font-mono overflow-auto max-h-24">{status.details.error}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="text-center">
                        <button
                            onClick={checkConnectivity}
                            disabled={isChecking}
                            className="bg-coffee-dark text-gold px-12 py-4 rounded-full font-bold tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-coffee/20 disabled:opacity-50 flex items-center gap-3 mx-auto uppercase"
                        >
                            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                            {isChecking ? 'Testing...' : 'Rerunning Diagnostics'}
                        </button>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ConnectionCheck;
