import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, ShoppingBag, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/admin/customers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCustomers(response.data);
            } catch (error) {
                console.error("Failed to fetch customers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filtered = customers.filter(c =>
        (c.first_name + ' ' + c.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading customers...</div>;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-coffee-dark">Customer Base</h1>
                <p className="text-gray-500">View and manage your registered users.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Registration</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(cust => (
                                <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs">
                                                {cust.first_name?.[0]}{cust.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-coffee-dark">{cust.first_name || 'Guest'} {cust.last_name || ''}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Mail size={10} /> {cust.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(cust.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <ShoppingBag size={14} className="text-gray-400" />
                                            {cust.orderCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm text-coffee-dark">
                                        ${cust.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                        {cust.addresses?.[0]?.city || 'N/A'}, {cust.addresses?.[0]?.country || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;
