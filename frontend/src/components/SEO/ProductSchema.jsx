import React from 'react';
import { Helmet } from 'react-helmet-async';

const ProductSchema = ({ product }) => {
    if (!product) return null;

    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [],
        "description": product.description,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": "Yemeni Market"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "USD", // Adjust if dynamic
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default ProductSchema;
