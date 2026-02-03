import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Package, User, MapPin, LogOut, Settings as SettingsIcon, CreditCard, Heart, ShoppingBag, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSearchParams, Link } from 'react-router-dom';

const Profile = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: '', street_address: '', city: '', postal_code: '', country: 'France', phone: '' });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        if (user && user.id) {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const fetchOrders = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/orders`, { headers });
                    if (response.ok) {
                        const data = await response.json();
                        const mappedOrders = data.map(order => ({
                            id: order.order_number,
                            date: new Date(order.created_at).toLocaleDateString(),
                            total: Number(order.total_amount),
                            status: order.status,
                            items: order.order_items.map(i => i.product_id)
                        }));
                        setOrders(mappedOrders);
                    }
                } catch (error) { console.error(error); }
            };
            const fetchAddresses = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/customer/address`, { headers });
                    if (response.ok) setAddresses(await response.json());
                } catch (error) { console.error(error); }
            };
            const fetchInvoices = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/customer/invoices`, { headers });
                    if (response.ok) setInvoices(await response.json());
                } catch (error) { console.error(error); }
            };

            fetchOrders();
            fetchAddresses();
            fetchInvoices();
        }
    }, [user, showAddressForm]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/customer/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAddress)
            });
            if (res.ok) {
                setShowAddressForm(false);
                setNewAddress({ label: '', street_address: '', city: '', postal_code: '', country: 'France', phone: '' });
            } else {
                alert(t('failed_save_address'));
            }
        } catch (error) {
            console.error(error);
            alert(t('error_save_address'));
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F9F7F5]">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen p-20 text-center">
                    <User size={64} className="text-gold/20 mb-6" />
                    <h2 className="font-serif text-3xl font-bold text-coffee-dark mb-4">{t('auth_required')}</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">{t('please_login_to_access_profile')}</p>
                    <Link to="/login"><Button className="bg-coffee-dark text-gold hover:bg-gold hover:text-coffee-dark px-12 h-12">{t('login_now')}</Button></Link>
                </div>
            </div>
        );
    }

    const downloadInvoice = async (invoice) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/invoices/${invoice.id}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoice.invoice_number}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Failed to download invoice");
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F5]">
            <Navbar />
            <div className="bg-[#1A1A1A] pt-32 pb-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center text-gold text-4xl font-serif border-2 border-gold/30 backdrop-blur-sm">
                            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-white mb-2">{t('welcome_name', { name: user.full_name || t('user_guest') })}</h1>
                            <p className="text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Nav */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden sticky top-32">
                            <nav className="flex flex-col p-3 space-y-1">
                                <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-gold/10 text-coffee-dark font-bold border-l-4 border-gold' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <Package size={20} /> <span className="text-sm tracking-wide uppercase font-semibold">{t('my_orders')}</span>
                                </button>
                                <button onClick={() => setActiveTab('wishlist')} className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${activeTab === 'wishlist' ? 'bg-gold/10 text-coffee-dark font-bold border-l-4 border-gold' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <Heart size={20} /> <span className="text-sm tracking-wide uppercase font-semibold">{t('wishlist')}</span>
                                </button>
                                <button onClick={() => setActiveTab('invoices')} className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${activeTab === 'invoices' ? 'bg-gold/10 text-coffee-dark font-bold border-l-4 border-gold' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <CreditCard size={20} /> <span className="text-sm tracking-wide uppercase font-semibold">{t('invoices')}</span>
                                </button>
                                <button onClick={() => setActiveTab('addresses')} className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${activeTab === 'addresses' ? 'bg-gold/10 text-coffee-dark font-bold border-l-4 border-gold' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <MapPin size={20} /> <span className="text-sm tracking-wide uppercase font-semibold">{t('addresses')}</span>
                                </button>
                                <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-gold/10 text-coffee-dark font-bold border-l-4 border-gold' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <User size={20} /> <span className="text-sm tracking-wide uppercase font-semibold">{t('account_details')}</span>
                                </button>
                                <div className="h-px bg-gray-100 my-4 mx-4"></div>
                                <button onClick={logout} className="flex items-center gap-3 px-5 py-4 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                                    <LogOut size={20} /> <span className="text-sm tracking-wide uppercase font-semibold">{t('logout')}</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-xl shadow-soft border border-gray-100 p-8 min-h-[600px]">
                        {activeTab === 'orders' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <h2 className="text-3xl font-serif font-bold text-coffee-dark border-b border-gray-100 pb-6">{t('order_history')}</h2>
                                {orders.length === 0 ? (
                                    <div className="text-center py-20 space-y-4">
                                        <Package size={48} className="mx-auto text-gray-200" />
                                        <p className="text-gray-400">{t('no_orders_yet')}</p>
                                        <Link to="/products"><Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">{t('browse_shop')}</Button></Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map(order => (
                                            <div key={order.id} className="p-6 rounded-xl border border-gray-100 hover:border-gold/30 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center"><Package size={20} className="text-gold" /></div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-coffee-dark">{order.id}</h3>
                                                        <p className="text-xs text-gray-400">{order.date}</p>
                                                    </div>
                                                </div>
                                                <Badge className={order.status === 'Delivered' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gold/10 text-gold hover:bg-gold/20'}>{order.status}</Badge>
                                                <p className="font-serif font-bold text-xl text-coffee-dark tracking-wide">${order.total.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <h2 className="text-3xl font-serif font-bold text-coffee-dark border-b border-gray-100 pb-6">{t('wishlist')}</h2>
                                {wishlist.length === 0 ? (
                                    <div className="text-center py-20 space-y-4">
                                        <Heart size={48} className="mx-auto text-gray-200" />
                                        <p className="text-gray-400">{t('wishlist_empty')}</p>
                                        <Link to="/products"><Button className="bg-coffee-dark text-gold hover:bg-coffee">{t('start_shopping')}</Button></Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {wishlist.map(product => (
                                            <div key={product.id} className="group flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold/20 transition-all relative">
                                                <button
                                                    onClick={() => toggleWishlist(product)}
                                                    className="absolute top-2 right-2 p-1.5 text-red-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#F9F7F5]">
                                                    <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="font-serif font-bold text-coffee-dark group-hover:text-gold transition-colors text-sm line-clamp-1">{product[`name_${i18n.language}`] || product.name}</h3>
                                                        <p className="text-lg font-medium text-gold">${product.price}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addToCart(product)}
                                                        className="w-full h-8 text-[10px] uppercase tracking-widest bg-coffee-dark text-white hover:bg-gold hover:text-coffee-dark transition-all"
                                                    >
                                                        <ShoppingBag size={12} className="mr-2" /> {t('add_to_cart')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'invoices' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <h2 className="text-3xl font-serif font-bold text-coffee-dark border-b border-gray-100 pb-6">{t('my_invoices')}</h2>
                                <div className="space-y-4">
                                    {invoices.length === 0 ? <p className="text-gray-500">{t('no_invoices')}</p> : invoices.map(inv => (
                                        <div key={inv.id} className="p-6 rounded-xl border border-gray-100 flex justify-between items-center hover:border-gold/30 transition-all">
                                            <div>
                                                <p className="font-bold text-coffee-dark">{inv.invoice_number}</p>
                                                <p className="text-sm text-gray-400">{new Date(inv.issued_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-serif font-bold text-xl text-coffee-dark mb-2">${Number(inv.amount).toFixed(2)}</p>
                                                <Button size="sm" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white" onClick={() => downloadInvoice(inv)}>
                                                    {t('download_pdf')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                                    <h2 className="text-3xl font-serif font-bold text-coffee-dark">{t('addresses')}</h2>
                                    <Button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-gold text-white">{showAddressForm ? t('cancel') : t('add_new')}</Button>
                                </div>

                                {showAddressForm && (
                                    <div className="bg-[#F9F7F5] p-8 rounded-xl border border-gray-100 mb-8">
                                        <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('label')}</label><Input value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} placeholder="Home / Office" /></div>
                                            <div className="col-span-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('phone')}</label><Input value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="+33..." /></div>
                                            <div className="col-span-2"><label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('street_address')}</label><Input value={newAddress.street_address} onChange={e => setNewAddress({ ...newAddress, street_address: e.target.value })} required /></div>
                                            <div className="col-span-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('city')}</label><Input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required /></div>
                                            <div className="col-span-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('postal_code')}</label><Input value={newAddress.postal_code} onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} /></div>
                                            <div className="col-span-2"><Button type="submit" className="w-full bg-coffee-dark text-gold h-12 uppercase tracking-widest text-xs">{t('save_address')}</Button></div>
                                        </form>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map((addr) => (
                                        <div key={addr.id} className="bg-white p-6 rounded-xl border-l-4 border-gold shadow-sm relative hover:shadow-md transition-shadow">
                                            {addr.is_default && <Badge className="absolute top-4 right-4 bg-gold/10 text-gold">{t('default')}</Badge>}
                                            <h3 className="font-bold text-coffee-dark mb-3 uppercase tracking-wide text-sm">{addr.label || t('address')}</h3>
                                            <p className="text-gray-500 leading-relaxed text-sm">
                                                {addr.street_address}<br />
                                                {addr.postal_code} {addr.city}<br />
                                                {addr.country}<br />
                                                {addr.phone && <span className="block mt-2 font-medium text-coffee-dark">{addr.phone}</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <h2 className="text-3xl font-serif font-bold text-coffee-dark border-b border-gray-100 pb-6">{t('account_details')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('full_name')}</label>
                                        <Input defaultValue={user.full_name} className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('email_address')}</label>
                                        <Input defaultValue={user.email} disabled className="h-12 bg-gray-50 text-gray-400" />
                                    </div>
                                </div>
                                <div className="pt-6"><Button className="bg-coffee-dark text-gold hover:bg-coffee px-12 h-12 uppercase tracking-widest text-xs">{t('update_profile')}</Button></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
