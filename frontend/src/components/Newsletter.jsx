import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';

const Newsletter = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!consent) {
            alert(t('accept_privacy_alert'));
            return;
        }

        setStatus('loading');
        try {
            const response = await fetch('http://localhost:5000/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    gdpr_consent: consent,
                    lang: i18n.language
                })
            });

            if (response.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-coffee-dark text-white py-16">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-serif font-bold mb-4">{t('newsletter_title')}</h2>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                    {t('newsletter_desc')}
                </p>

                {status === 'success' ? (
                    <div className="bg-green-500/20 text-green-100 p-4 rounded-md inline-block">
                        {t('newsletter_success')}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder={t('enter_email')}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={status === 'loading'} className="bg-gold hover:bg-gold/90 text-coffee-dark h-12 px-6">
                                {status === 'loading' ? '...' : <Send size={18} />}
                            </Button>
                        </div>

                        <div className="flex items-start gap-2 text-left justify-center">
                            <input
                                type="checkbox"
                                id="newsletter-consent"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1"
                            />
                            <label htmlFor="newsletter-consent" className="text-xs text-white/60 cursor-pointer select-none">
                                {t('gdpr_consent_text')}
                            </label>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Newsletter;
