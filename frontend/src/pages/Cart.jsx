import React from 'react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

const Cart = () => {
    const { t } = useTranslation();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

    const total = getCartTotal();
    const freeShippingThreshold = 150;
    const progress = Math.min((total / freeShippingThreshold) * 100, 100);
    const remainingForFreeShipping = freeShippingThreshold - total;

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-coffee-dark mb-2 text-center">{t('your_selection')}</h1>
                <p className="text-center text-gray-500 mb-12 uppercase tracking-widest text-xs">{t('review_selection')}</p>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-[#F9F7F5] rounded-sm">
                        <p className="text-xl font-serif text-coffee-dark mb-6">{t('cart_empty')}</p>
                        <Button variant="gold" onClick={() => navigate('/products')} className="text-white">
                            {t('discover_collections')}
                        </Button>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 lg:items-start">
                        <div className="lg:col-span-7">
                            {/* Free Shipping Progress */}
                            <div className="mb-8 bg-[#F9F7F5] p-6 rounded-sm border border-gray-100">
                                {remainingForFreeShipping > 0 ? (
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-3">{t('add_more_for_free_shipping', { amount: t('price_with_currency', { amount: remainingForFreeShipping.toFixed(2) }) })}</p>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-green-700 font-medium flex items-center justify-center gap-2">
                                        <ShieldCheck size={18} /> {t('free_shipping_unlocked')}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.variant?.id}`} className="flex py-6 border-b border-gray-100 hover:bg-gray-50 transition-colors px-2">
                                        <div className="h-32 w-28 flex-shrink-0 overflow-hidden bg-[#F9F7F5]">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>

                                        <div className="ml-6 flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between text-lg font-serif font-medium text-coffee-dark">
                                                    <h3>{item.name}</h3>
                                                    <p className="ml-4 tracking-wide">{t('price_with_currency', { amount: (item.variant ? item.variant.price : item.price) * item.quantity })}</p>
                                                </div>
                                                {item.variant && (
                                                    <p className="mt-1 text-sm text-gray-500 uppercase tracking-wider">{item.variant.name}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <div className="flex items-center border border-gray-200">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.variant?.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-gold hover:text-white transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-4 font-medium text-coffee-dark">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.variant?.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-gold hover:text-white transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id, item.variant?.id)}
                                                    className="font-medium text-red-500 hover:text-red-700 text-xs uppercase tracking-wider flex items-center transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    {t('remove')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-16 rounded-lg bg-[#F9F7F5] px-6 py-8 sm:p-8 lg:col-span-5 lg:mt-0 lg:sticky lg:top-32 shadow-sm">
                            <h2 className="text-xl font-serif font-bold text-coffee-dark mb-6">{t('order_summary')}</h2>

                            <div className="flow-root space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">{t('subtotal')}</p>
                                    <p className="text-sm font-medium text-gray-900">{t('price_with_currency', { amount: total.toFixed(2) })}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">{t('shipping')}</p>
                                    <p className="text-sm font-medium text-gray-900">{t('calculated_at_checkout')}</p>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-lg font-serif font-bold text-coffee-dark">{t('total')}</dt>
                                    <dd className="text-lg font-bold text-gold">{t('price_with_currency', { amount: total.toFixed(2) })}</dd>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-coffee-dark hover:bg-gold text-white uppercase tracking-widest py-6 font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {t('proceed_to_checkout')} <ArrowRight size={16} />
                                </Button>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <Lock size={12} />
                                <span>{t('secured_by')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
