import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path, children }) => {
    const fullTitle = `${title} | LeetVision`;
    const fullUrl = `https://leet-vision.com${path}`;

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "LeetVision",
        "url": "https://leet-vision.com/",
        "description": description || "The ultimate LeetCode helper and algorithm visualizer.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://leet-vision.com/search/{search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // Software Application Schema for "LeetCode Helper" ranking
    const appSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "LeetVision",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Any",
        "url": "https://leet-vision.com/",
        "description": "Interactive LeetCode helper and visualizer to master Data Structures and Algorithms.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    // Organization Schema for Brand Authority
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "LeetVision",
        "url": "https://leet-vision.com/",
        "logo": "https://leet-vision.com/logo.png", // Ensure you have a logo or text fallback
        "sameAs": [
            "https://www.instagram.com/vishwesh_shinde",
            "https://www.linkedin.com/in/vishweshshinde"
        ]
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description || "The ultimate LeetCode helper and algorithm visualizer."} />
            <meta name="keywords" content="leetcode, leetcode helper, visual leetcode, coding interview prep, dsa roadmap, leetcode visualizer, leetcode solutions, algorithm visualizer" />
            <link rel="canonical" href={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || "The ultimate LeetCode helper and algorithm visualizer."} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || "The ultimate LeetCode helper and algorithm visualizer."} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(appSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(orgSchema)}
            </script>
            {children}
        </Helmet>
    );
};

export default SEO;
