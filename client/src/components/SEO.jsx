import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path, children }) => {
    const fullTitle = `${title} | LeetVision`;
    const fullUrl = `https://leet-vision.vercel.app${path}`;

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "LeetVision",
        "url": "https://leet-vision.vercel.app/",
        "description": "Visual LeetCode solutions and coding interview roadmap.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://leet-vision.vercel.app/search/{search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // Organization Schema for Brand Authority
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "LeetVision",
        "url": "https://leet-vision.vercel.app/",
        "logo": "https://leet-vision.vercel.app/logo.png", // Ensure you have a logo or text fallback
        "sameAs": [
            "https://www.instagram.com/vishwesh_shinde",
            "https://www.linkedin.com/in/vishweshshinde"
        ]
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullUrl} />
            <meta name="twitter:card" content="summary_large_image" />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(orgSchema)}
            </script>
            {children}
        </Helmet>
    );
};

export default SEO;
