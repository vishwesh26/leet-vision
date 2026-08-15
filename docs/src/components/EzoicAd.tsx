"use client";
import React, { useEffect } from 'react';

declare global {
  interface Window {
    ezstandalone?: any;
  }
}

export default function EzoicAd({ style = {} }: { style?: React.CSSProperties }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.ezstandalone) {
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
    <div className="ezoic-ad-container w-full text-center my-4" style={style}>
      {/* Ezoic Standalone Ad Display */}
    </div>
  );
}
