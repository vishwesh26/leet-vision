"use client";
import React, { useEffect } from 'react';

declare global {
  interface Window {
    ezstandalone?: any;
  }
}

interface EzoicAdProps {
  placeholderId?: number | string;
  style?: React.CSSProperties;
}

export default function EzoicAd({ placeholderId, style = {} }: EzoicAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.ezstandalone) {
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
      className="ezoic-ad-container w-full text-center my-6" 
      style={style} 
    />
  );
}
