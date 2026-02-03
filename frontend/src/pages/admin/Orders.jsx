import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get('http://localhost:5000/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Order status updated to ${newStatus}`);
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
            // Revert on error (could fetch orders again)
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Orders Management</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order.order_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {order.first_name ? `${order.first_name} ${order.last_name}` : 'Guest'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-0 cursor-pointer ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${order.total_amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                                        <Eye size={16} className="mr-1" /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
