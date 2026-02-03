import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const CookieConsent = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieDetails');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieDetails', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    <p className="font-semibold text-coffee-dark mb-1">{t('cookie_privacy_title')}</p>
                    <p>
                        {t('cookie_privacy_desc')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsVisible(false)} className="text-xs">
                        {t('decline')}
                    </Button>
                    <Button onClick={handleAccept} className="bg-coffee hover:bg-gold text-white text-xs">
                        {t('accept_all')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
