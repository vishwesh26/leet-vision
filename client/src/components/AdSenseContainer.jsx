import React, { useEffect, useState } from 'react';

const AdSenseContainer = ({ slot, format = 'auto', responsive = 'true', style = {} }) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Delay ad loading to ensure content is visible first (AdSense Compliance)
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, 2000); // 2 second delay

        return () => clearTimeout(timer);
    }, []); 

    useEffect(() => {
        if (shouldRender) {
            try {
                // Manually inject the script if it doesn't exist
                if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
                    const script = document.createElement('script');
                    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2403388488389670";
                    script.async = true;
                    script.crossOrigin = "anonymous";
                    document.head.appendChild(script);
                }

                // Push adsbygoogle to the window queue
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.warn('AdSense error:', e.message);
            }
        }
    }, [shouldRender]);

    if (!shouldRender) {
        return null;
    }

    return (
        <div className="adsense-container" style={{ margin: '2rem 0', minHeight: '100px', ...style }}>
            <ins className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client="ca-pub-2403388488389670"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}>
            </ins>
        </div>
    );
};

export default AdSenseContainer;
