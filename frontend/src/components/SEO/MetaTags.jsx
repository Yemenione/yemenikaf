import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const MetaTags = ({
    title = 'Yemeni Market - Authentic Products',
    description = 'Discover the finest authentic Yemeni products. Honey, coffee, and more directly from the source.',
    image = '/logo.png',
    type = 'website'
}) => {
    const location = useLocation();
    const currentUrl = window.location.origin + location.pathname;
    const fullTitle = `${title} | Yemeni Market`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description} />
            <link rel='canonical' href={currentUrl} />

            {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
            <meta property='og:type' content={type} />
            <meta property='og:title' content={fullTitle} />
            <meta property='og:description' content={description} />
            <meta property='og:image' content={image} />
            <meta property='og:url' content={currentUrl} />
            <meta property='og:site_name' content='Yemeni Market' />

            {/* Twitter tags */}
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={fullTitle} />
            <meta name='twitter:description' content={description} />
            <meta name='twitter:image' content={image} />
        </Helmet>
    );
};

export default MetaTags;
