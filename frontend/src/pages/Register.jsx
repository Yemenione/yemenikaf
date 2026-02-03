import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Navbar from '../components/Navbar';

const Register = () => {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password) {
            setError(t('fill_all_fields'));
            return;
        }

        const result = await register(fullName, email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-serif text-primary">{t('create_account')}</CardTitle>
                        <CardDescription>{t('join_community_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder={t('full_name')}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="h-11 bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder={t('email_address')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder={t('password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 bg-white"
                                />
                            </div>

                            {error && <p className="text-destructive text-sm text-center">{error}</p>}

                            <Button type="submit" variant="gold" className="w-full h-11 text-white">
                                {t('create_account_btn')}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground mt-4">
                                {t('already_have_account')} <Link to="/login" className="text-gold font-bold hover:underline">{t('login')}</Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;
