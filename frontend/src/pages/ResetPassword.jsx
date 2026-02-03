import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage(t('passwords_not_match'));
            return;
        }

        setStatus('loading');
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                newPassword: password
            });
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(t('link_expired'));
        }
    };

    if (!token) {
        return <div className="p-20 text-center">{t('invalid_link')}</div>;
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <div className="flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-serif font-bold text-coffee-dark">{t('new_password')}</h2>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-50 p-4 rounded text-green-800 text-center">
                            {t('password_updated_redirect')}
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {status === 'error' && (
                                <div className="text-red-500 text-sm text-center">{message}</div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="sr-only">{t('new_password')}</label>
                                    <Input
                                        type="password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-coffee focus:border-coffee sm:text-sm"
                                        placeholder={t('new_password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="sr-only">{t('confirm_password')}</label>
                                    <Input
                                        type="password"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-coffee focus:border-coffee sm:text-sm"
                                        placeholder={t('confirm_password')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-coffee hover:bg-coffee-dark focus:outline-none transition-colors"
                                >
                                    {status === 'loading' ? t('changing') : t('change_password')}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
