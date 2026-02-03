import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useStoreConfig } from '../context/StoreConfigContext'; // Import Config
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { ShieldCheck, Lock, CreditCard, MapPin } from 'lucide-react';

const CheckoutForm = ({ clientSecret, onSuccess }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage(t('payment_success'));
            onSuccess(paymentIntent.id);
        } else {
            setMessage(t('unexpected_error'));
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <PaymentElement />
            </div>
            {message && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{message}</div>}
            <Button disabled={isLoading || !stripe || !elements} className="w-full bg-coffee-dark hover:bg-gold text-white py-6 text-lg uppercase tracking-widest font-bold">
                {isLoading ? t('processing') : t('secure_pay_now')}
            </Button>
            <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                <Lock size={12} /> {t('secured_by')}
            </div>
        </form>
    );
};

const Checkout = () => {
    const { t } = useTranslation();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const config = useStoreConfig(); // Get config
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Address, 2: Payment
    const [contact, setContact] = useState({ email: user?.email || '', phone: '' });
    const [address, setAddress] = useState({ street: '', city: '', country: 'France', postal_code: '' });
    const [clientSecret, setClientSecret] = useState('');
    const [stripePromise, setStripePromise] = useState(null);
    const [costs, setCosts] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0, discount: 0 });
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    // Initialize Stripe when config loads
    useEffect(() => {
        if (config?.stripe_public_key) {
            loadStripe(config.stripe_public_key).then(setStripePromise);
        }
    }, [config]);

    // Calculate Costs (French Standards)
    useEffect(() => {
        const subtotal = getCartTotal();
        const taxRate = 0.20; // 20% TVA
        const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping over $100, else $15

        let discountAmount = 0;
        if (coupon) {
            if (coupon.discount_type === 'percentage') {
                discountAmount = (subtotal * coupon.value) / 100;
            } else {
                discountAmount = coupon.value;
            }
        }

        const taxableBase = Math.max(0, subtotal - discountAmount);
        const tax = taxableBase * taxRate;
        const total = Math.max(0, taxableBase + tax + shippingCost);

        setCosts({
            subtotal,
            tax,
            shipping: shippingCost,
            discount: discountAmount,
            total
        });
    }, [cartItems, getCartTotal, coupon]);

    const handleApplyCoupon = async () => {
        setCouponError('');
        try {
            const res = await axios.post('http://localhost:5000/api/coupons/validate', {
                code: couponCode,
                cartTotal: costs.subtotal
            });
            setCoupon(res.data);
            alert(t('coupon_applied'));
        } catch (err) {
            setCouponError(err.response?.data?.error || t('invalid_coupon'));
            setCoupon(null);
        }
    };

    useEffect(() => {
        if (cartItems.length === 0) navigate('/products');
    }, [cartItems, navigate]);

    useEffect(() => {
        // Create PaymentIntent when moving to Payment step
        if (step === 2 && !clientSecret) {
            axios.post('http://localhost:5000/api/create-payment-intent', {
                items: cartItems,
                // Backend will re-calculate, but we pass context if needed. 
                // Ideally backend ignores frontend prices and uses DB, but for tax/shipping logic we assume backend implementation matches.
                shipping: costs.shipping
            })
                .then(res => {
                    setClientSecret(res.data.clientSecret);
                    // If backend returned updated costs, we could sync here, but for now we rely on local calc match
                })
                .catch(err => console.error("Error creating payment intent", err));
        }
    }, [step, cartItems, clientSecret, costs.shipping]);

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        // Create Order in DB
        try {
            const shippingAddressCombined = {
                ...address,
                email: contact.email,
                phone: contact.phone
            };

            await axios.post('http://localhost:5000/api/orders', {
                user_id: user?.id || null,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    variant_id: item.variant?.id,
                    quantity: item.quantity,
                    price: item.variant ? item.variant.price : item.price,
                    name: item.name // Add name for better error logging
                })),
                total_price: costs.total, // Send the final total including tax/shipping
                tax_total: costs.tax,
                shipping_cost: costs.shipping,
                shipping_address: JSON.stringify(shippingAddressCombined),
                payment_intent_id: paymentIntentId,
                email: contact.email, // Explicitly pass for easy access if needed
                phone: contact.phone
            });

            // Success
            clearCart();
            alert(t('order_success_msg', { email: contact.email }));
            navigate('/');
        } catch (error) {
            console.error("Failed to save order", error);
            alert(t('payment_success_order_fail'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-center items-center mb-12 space-y-4 md:space-y-0 text-sm tracking-widest uppercase">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-coffee-dark font-bold' : 'text-gray-400'}`}>
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">1</span> {t('step_details')}
                    </div>
                    <div className="w-12 h-px bg-gray-300 mx-4"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-coffee-dark font-bold' : 'text-gray-400'}`}>
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">2</span> {t('step_payment')}
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-serif font-bold text-coffee-dark flex items-center gap-3">
                                        <MapPin className="text-gold" /> {t('contact_shipping')}
                                    </h2>
                                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                                        {/* Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('email_address')}</label>
                                                <Input type="email" className="bg-gray-50 border-gray-200 h-12" placeholder="you@example.com" required value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('phone_number')}</label>
                                                <Input type="tel" className="bg-gray-50 border-gray-200 h-12" placeholder="+33 6 12 34 56 78" required value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 my-4" />

                                        {/* Address Info */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('street_address')}</label>
                                            <Input className="bg-gray-50 border-gray-200 h-12" placeholder="123 Luxury Ave" required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('city')}</label>
                                                <Input className="bg-gray-50 border-gray-200 h-12" placeholder="Paris" required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('postal_code')}</label>
                                                <Input className="bg-gray-50 border-gray-200 h-12" placeholder="75001" required value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('country')}</label>
                                            <Input className="bg-gray-50 border-gray-200 h-12" placeholder="France" required value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                                        </div>

                                        <Button type="submit" className="w-full mt-6 bg-coffee text-white hover:bg-gold uppercase tracking-widest h-12 font-bold transition-all">
                                            {t('continue_payment')}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {step === 2 && clientSecret && stripePromise && (
                                <div className="w-full">
                                    <h2 className="text-2xl font-serif font-bold text-coffee-dark flex items-center gap-3 mb-6">
                                        <CreditCard className="text-gold" /> {t('secure_payment')}
                                    </h2>
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
                                    </Elements>
                                    <button onClick={() => setStep(1)} className="mt-4 text-xs text-gray-400 underline hover:text-gold">{t('edit_contact_shipping')}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-[#F9F7F5] p-8 rounded-sm sticky top-24 border border-gray-100">
                            <h3 className="font-serif font-bold text-lg text-coffee-dark mb-6 pb-4 border-b border-gray-200">{t('order_summary')}</h3>
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-16 w-16 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                            <img src={item.imageUrl} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-coffee-dark">{item.name}</h4>
                                            <p className="text-xs text-gray-500">{t('qty_label')}{item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-medium text-coffee-dark">
                                            {t('price_with_currency', { amount: ((item.variant ? item.variant.price : item.price) * item.quantity).toFixed(2) })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('subtotal')}</span>
                                    <span>{t('price_with_currency', { amount: costs.subtotal.toFixed(2) })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('shipping')}</span>
                                    {costs.shipping === 0 ? (
                                        <span className="text-green-700 font-medium">{t('free')}</span>
                                    ) : (
                                        <span>{t('price_with_currency', { amount: costs.shipping.toFixed(2) })}</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('tax')} (20%)</span>
                                    <span>{t('price_with_currency', { amount: costs.tax.toFixed(2) })}</span>
                                </div>

                                {coupon && (
                                    <div className="flex justify-between text-sm text-green-700 font-bold bg-green-50 p-2 rounded">
                                        <span>{t('discount_label', { code: coupon.code })}</span>
                                        <span>-{t('price_with_currency', { amount: costs.discount.toFixed(2) })}</span>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Input */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t('coupon_placeholder')}
                                        className="bg-white h-10 text-sm"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!coupon}
                                    />
                                    <Button
                                        variant="outline"
                                        className="h-10 px-4 border-gray-200 text-gray-600 hover:text-gold hover:border-gold"
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || !!coupon}
                                    >
                                        {t('apply_coupon')}
                                    </Button>
                                </div>
                                {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                                {coupon && (
                                    <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-xs text-gray-400 underline mt-2 hover:text-red-500">
                                        {t('remove_coupon')}
                                    </button>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                                <span className="font-serif font-bold text-xl text-coffee-dark">{t('total')}</span>
                                <span className="font-bold text-xl text-gold">{t('price_with_currency', { amount: costs.total.toFixed(2) })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
