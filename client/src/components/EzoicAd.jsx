import React, { useEffect } from 'react';

const EzoicAd = ({ style = {} }) => {
    useEffect(() => {
        try {
            if (window.ezstandalone) {
                window.ezstandalone.cmd = window.ezstandalone.cmd || [];
                window.ezstandalone.cmd.push(function () {
                    if (typeof window.ezstandalone.showAds === 'function') {
                        window.ezstandalone.showAds({});
                    }
                });
            }
        } catch (e) {
            console.warn('Ezoic ad error:', e);
        }
    }, []);

    return (
        <div 
            className="ezoic-ad-container" 
            style={{ 
                width: '100%',
                ...style 
            }}
        >
            {/* Ezoic Standalone Ad Display */}
        </div>
    );
};

export default EzoicAd;
