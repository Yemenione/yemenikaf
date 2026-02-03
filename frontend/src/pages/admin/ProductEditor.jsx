import React, { useState } from 'react';
import axios from 'axios';
import { Save, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProductEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_name: 'Honey',
        images: '',
        is_active: true
    });

    useEffect(() => {
        if (isEdit) {
            const fetchProduct = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                    const p = response.data;
                    setFormData({
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        stock: p.stock_quantity,
                        category_name: p.categories?.name || 'Honey',
                        images: p.image_url || '',
                        is_active: p.is_active
                    });
                } catch (error) {
                    console.error("Error fetching product", error);
                    alert("Failed to load product data");
                } finally {
                    setFetching(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = isEdit
                ? `http://localhost:5000/api/admin/products/${id}`
                : 'http://localhost:5000/api/admin/products';
            const method = isEdit ? 'put' : 'post';

            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(isEdit ? 'Product Updated Successfully!' : 'Product Created Successfully!');
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert(`Failed to ${isEdit ? 'update' : 'create'} product`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate('/admin/products')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-serif font-bold text-coffee-dark">
                    {isEdit ? `Edit Product: ${formData.name}` : 'Add New Product'}
                </h1>
            </div>

            {fetching ? (
                <div className="p-12 text-center text-gray-500 italic">Loading product details...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Product Name</label>
                                <Input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Royal Sidr Honey" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="Honey">Honey</option>
                                    <option value="Coffee">Coffee</option>
                                    <option value="Spices">Spices</option>
                                    <option value="Gifts">Gifts</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Detailed product description..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Price ($)</label>
                                <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                                <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required placeholder="0" />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded text-gold focus:ring-gold"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Product is Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="border-t pt-6 flex justify-end">
                            <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold/90 text-coffee-dark font-bold px-8">
                                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> {isEdit ? 'Update Product' : 'Create Product'}</>}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProductEditor;
