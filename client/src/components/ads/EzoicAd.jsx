import React, { useEffect } from 'react';

const EzoicAd = ({ placeholderId, style = {} }) => {
    useEffect(() => {
        try {
            if (window.ezstandalone) {
                window.ezstandalone.cmd = window.ezstandalone.cmd || [];
                window.ezstandalone.cmd.push(function () {
                    if (typeof window.ezstandalone.showAds === 'function') {
                        if (placeholderId) {
                            if (typeof window.ezstandalone.define === 'function') {
                                window.ezstandalone.define(placeholderId);
                            }
                            window.ezstandalone.showAds(placeholderId);
                        } else {
                            window.ezstandalone.showAds();
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('Ezoic ad placement error:', e);
        }
    }, [placeholderId]);

    const elementId = placeholderId ? `ezoic-pub-ad-placeholder-${placeholderId}` : undefined;

    return (
        <div 
            id={elementId}
            className="ezoic-ad-container" 
            style={{ 
                width: '100%',
                margin: '1.5rem 0',
                textAlign: 'center',
                ...style 
            }}
        />
    );
};

export default EzoicAd;
