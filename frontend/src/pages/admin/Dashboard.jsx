import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assuming token is in localStorage or handled by interceptor
                const token = JSON.parse(localStorage.getItem('user'))?.token; // Temp hack, better to use AuthContext
                // BUT better to use axios interceptor in real app. For now we assume header or use context.
                // Let's rely on standard axios call for now but we need to pass token.

                // For simplicity in this edit, I will manually get token from storage if AuthContext interceptor isn't set up globally for axios yet.
                // Note: AuthContext usually sets localStorage. Let's grab it.
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        // fetchStats();
    }, []);

    // Mocking or fetching real data
    // In a real implementation we would fetch from /api/admin/stats
    // Let's implement the real fetch:
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error(err);
                // Fallback for demo if not logged in as admin
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`$${Number(stats.totalRevenue).toLocaleString()}`}
                    icon={<DollarSign className="text-green-600" size={24} />}
                    bg="bg-green-100"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingCart className="text-blue-600" size={24} />}
                    bg="bg-blue-100"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={<Package className="text-orange-600" size={24} />}
                    bg="bg-orange-100"
                />
                <StatCard
                    title="Products"
                    value={stats.totalProducts}
                    icon={<Package className="text-purple-600" size={24} />}
                    bg="bg-purple-100"
                />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <p className="text-gray-500">No recent activity log implemented yet.</p>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bg }) => (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
        <div className={`p-4 rounded-full ${bg} mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default AdminDashboard;
