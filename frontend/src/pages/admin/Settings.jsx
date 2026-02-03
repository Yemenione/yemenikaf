import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Save, Lock, Globe, RefreshCw } from 'lucide-react';

const Settings = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/config', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfigs(res.data);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, value, isPublic, description) => {
        setSaving(key);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/admin/config',
                { key, value, isPublic, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update local state
            setConfigs(prev => prev.map(c => c.key === key ? { ...c, value, isPublic } : c));
        } catch (error) {
            alert("Failed to save setting");
        } finally {
            setSaving(null);
        }
    };

    // Group configs by 'group' field
    const grouped = configs.reduce((acc, conf) => {
        const group = conf.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(conf);
        return acc;
    }, {});

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-coffee-dark">Store Settings</h1>
                    <p className="text-gray-500">Manage technical configuration and keys.</p>
                </div>
                <Button onClick={fetchConfigs} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
            </div>

            <div className="space-y-8">
                {Object.entries(grouped).map(([group, items]) => (
                    <div key={group} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold capitalize mb-4 text-gold flex items-center gap-2">
                            {group} Configuration
                        </h2>
                        <div className="space-y-4">
                            {items.map(conf => (
                                <div key={conf.key} className="grid grid-cols-12 gap-4 items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                    <div className="col-span-4">
                                        <label className="text-sm font-bold text-gray-700 block">{conf.key}</label>
                                        <span className="text-xs text-gray-400 block mt-1">{conf.description || 'No description'}</span>
                                    </div>
                                    <div className="col-span-6">
                                        <div className="relative">
                                            <Input
                                                type={conf.key.includes('pass') || conf.key.includes('secret') ? "password" : "text"}
                                                defaultValue={conf.value}
                                                className="pr-10"
                                                onBlur={(e) => {
                                                    if (e.target.value !== conf.value) {
                                                        handleUpdate(conf.key, e.target.value, conf.isPublic, conf.description);
                                                    }
                                                }}
                                            />
                                            {saving === conf.key && <span className="absolute right-3 top-2.5 text-xs text-gold animate-pulse">Saving...</span>}
                                        </div>
                                        {/* Image Preview if applicable */}
                                        {conf.type === 'image' && conf.value && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 inline-block">
                                                <img src={conf.value} alt="Preview" className="h-12 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end">
                                        <button
                                            onClick={() => handleUpdate(conf.key, conf.value, !conf.isPublic, conf.description)}
                                            className={`p-2 rounded-md transition-colors ${conf.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                            title={conf.isPublic ? "Public (Visible to Frontend)" : "Private (Backend Only)"}
                                        >
                                            {conf.isPublic ? <Globe size={18} /> : <Lock size={18} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
