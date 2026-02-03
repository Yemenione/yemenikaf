import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this product?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (error) {
            alert("Failed to delete product");
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading products...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-coffee-dark">Product Management</h1>
                    <p className="text-gray-500">Manage your catalog, stock, and pricing.</p>
                </div>
                <Button
                    onClick={() => navigate('/admin/products/new')}
                    className="bg-gold hover:bg-gold/90 text-coffee-dark font-bold"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={product.image_url || `https://placehold.co/100x100/D4AF37/FFFFFF?text=${encodeURIComponent(product.name[0])}`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-coffee-dark text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-400">ID: {product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs bg-coffee-light/20 text-coffee-dark px-2 py-1 rounded">
                                            {product.categories?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-sm">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={product.stock_quantity < 10 ? 'text-red-500 font-bold' : 'text-gray-600'}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => window.open(`/products/${product.id}`, '_blank')}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="View Public"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                className="p-2 text-gray-400 hover:text-gold transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Deactivate"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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

export default AdminProductList;
