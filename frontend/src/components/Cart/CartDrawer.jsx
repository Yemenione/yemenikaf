import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';

const CartDrawer = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, isCartOpen, setIsCartOpen } = useCart();

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    // Upsell Mock Product (In real app, logic based on cart contents)
    const upsellProduct = {
        id: 99,
        name: "Yemeni Spices Mix",
        price: 12,
        image: "https://placehold.co/100x100/E85D04/FFFFFF?text=Spices"
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col bg-white p-0">
                <SheetHeader className="px-6 py-6 border-b border-gray-100">
                    <SheetTitle className="text-2xl font-serif text-coffee-dark flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-gold" />
                        {t('your_cart')}
                        <span className="text-sm font-sans font-normal text-gray-400">({cartItems.length})</span>
                    </SheetTitle>
                </SheetHeader>

                {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t('cart_empty')}</h3>
                        <p className="text-gray-500 mb-8 max-w-xs">{t('cart_empty_desc')}</p>
                        <Button
                            onClick={() => setIsCartOpen(false)}
                            className="bg-coffee-dark text-white uppercase tracking-widest px-8"
                        >
                            {t('start_shopping')}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.variant?.id}`} className="flex gap-4">
                                        <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-coffee-dark text-sm pr-4 line-clamp-2">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.variant?.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                {item.variant && (
                                                    <p className="text-xs text-gray-500 mt-1">{item.variant.name}</p>
                                                )}
                                                <p className="text-gold font-medium text-sm mt-1">{item.variant ? item.variant.price : item.price} {t('currency')}</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-200 rounded-md h-8">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.variant?.id, Math.max(1, item.quantity - 1))}
                                                        className="px-2 text-gray-500 hover:text-coffee-dark"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-bold px-2 w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.variant?.id, item.quantity + 1)}
                                                        className="px-2 text-gray-500 hover:text-coffee-dark"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Upsell Section */}
                            <div className="mt-8 border-t border-dashed border-gray-200 pt-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{t('you_might_like')}</h4>
                                <div className="flex items-center gap-4 bg-[#F9F7F5] p-3 rounded-lg border border-gold/10">
                                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex-shrink-0">
                                        <img src={upsellProduct.image} alt="upsell" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-coffee-dark">{upsellProduct.name}</p>
                                        <p className="text-xs text-gold font-medium">{upsellProduct.price} {t('currency')}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto border-gold text-gold hover:bg-gold hover:text-white h-7 text-[10px] uppercase font-bold tracking-wider">
                                        {t('adds')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6 bg-white space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{t('subtotal')}</span>
                                <span className="font-bold text-coffee-dark text-lg">{getCartTotal().toFixed(2)} {t('currency')}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center">{t('shipping_calculated_checkout')}</p>
                            <Button
                                onClick={handleCheckout}
                                className="w-full bg-coffee-dark hover:bg-gold text-white uppercase tracking-[0.2em] font-bold h-12 rounded-lg shadow-lg"
                            >
                                {t('checkout')} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
