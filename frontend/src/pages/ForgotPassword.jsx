import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStatus('success');
            setMessage(t('forgot_password_success'));
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(t('forgot_password_error'));
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <div className="flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-coffee-dark">{t('reset_password')}</h2>
                        <p className="mt-2 text-gray-600">
                            {t('reset_desc')}
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-50 p-4 rounded text-green-800 text-center">
                            {message}
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="sr-only">{t('email_address')}</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-coffee focus:border-coffee sm:text-sm"
                                    placeholder={t('email_address')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-coffee hover:bg-coffee-dark focus:outline-none transition-colors"
                                >
                                    {status === 'loading' ? t('processing') : t('send_reset_link')}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/login" className="font-medium text-gold hover:text-coffee-dark transition-colors">
                            {t('back_to_login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
