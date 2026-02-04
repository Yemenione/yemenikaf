import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Award, Lock, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustBadges = ({ variant = 'grid' }) => {
    const { t } = useTranslation();

    const badges = [
        {
            icon: Truck,
            title: t('global_delivery'),
            desc: t('global_delivery_desc', 'Fast shipping to 150+ countries')
        },
        {
            icon: ShieldCheck,
            title: t('authentic_guarantee'),
            desc: t('authentic_desc', '100% Verified Yemeni Origin')
        },
        {
            icon: RefreshCw,
            title: t('easy_returns'),
            desc: t('returns_desc', '30-day money back guarantee')
        },
        {
            icon: Award,
            title: t('premium_quality'),
            desc: t('premium_desc', 'Certified Grade A products')
        }
    ];

    if (variant === 'compact') {
        return (
            <div className="flex flex-wrap gap-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                {badges.slice(0, 3).map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <badge.icon className="w-4 h-4 text-gold" />
                        <span className="font-medium">{badge.title}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className="space-y-4">
                {badges.map((badge, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div className="p-2 bg-gold/10 rounded-full text-gold">
                            <badge.icon size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-coffee-dark text-sm">{badge.title}</h4>
                            <p className="text-xs text-gray-500">{badge.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default 'grid'
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-gray-100 my-8">
            {badges.map((badge, idx) => (
                <div key={idx} className="text-center group">
                    <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gold mb-3 group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                        <badge.icon size={24} strokeWidth={1.5} />
                    </div>
                    <h4 className="font-serif font-bold text-coffee-dark text-sm mb-1">{badge.title}</h4>
                    <p className="text-xs text-gray-400">{badge.desc}</p>
                </div>
            ))}
        </div>
    );
};

export default TrustBadges;
