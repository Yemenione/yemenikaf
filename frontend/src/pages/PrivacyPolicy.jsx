import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-3xl font-serif font-bold mb-8 text-coffee-dark">{t('privacy_title')}</h1>

                <section className="space-y-6 text-gray-700 leading-relaxed">
                    <p className="text-sm text-gray-400">{t('legal_last_updated')}</p>

                    <h2 className="text-xl font-bold text-coffee-dark mt-8">{t('privacy_sec1_title')}</h2>
                    <p>
                        {t('privacy_sec1_text')}
                    </p>

                    <h2 className="text-xl font-bold text-coffee-dark mt-8">{t('privacy_sec2_title')}</h2>
                    <p>
                        {t('privacy_sec2_text')}
                    </p>

                    <h2 className="text-xl font-bold text-coffee-dark mt-8">{t('privacy_sec3_title')}</h2>
                    <p>
                        {t('privacy_sec3_text')}
                    </p>

                    <h2 className="text-xl font-bold text-coffee-dark mt-8">{t('privacy_sec4_title')}</h2>
                    <p>
                        {t('privacy_sec4_text')}
                    </p>

                    <h2 className="text-xl font-bold text-coffee-dark mt-8">{t('privacy_sec5_title')}</h2>
                    <p>
                        {t('privacy_sec5_text')}
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
