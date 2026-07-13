import React from 'react';
import '../index.css';

const SkeletonLoader = ({ variant = 'text', count = 1, style = {}, itemStyle = {}, className = '' }) => {
  const renderSkeleton = (idx) => {
    switch (variant) {
      case 'card':
        return <div key={idx} className={`skeleton skeleton-card ${className}`} style={itemStyle}></div>;
      
      case 'video-card':
        return (
          <div key={idx} className={`video-card skeleton-wrapper ${className}`} style={{ padding: '1rem', ...itemStyle }}>
            <div className="skeleton skeleton-card" style={{ marginBottom: '1rem', height: '140px' }}></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        );

      case 'problem-card':
        return (
          <div key={idx} className={`problem-card skeleton-wrapper ${className}`} style={{ padding: '1rem', border: '1px solid #1e293b', borderRadius: '12px', background: '#0a0c10', ...itemStyle }}>
            <div className="skeleton skeleton-title" style={{ width: '60%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
            <div className="skeleton skeleton-text short" style={{ width: '40%' }}></div>
          </div>
        );

      case 'row':
        return <div key={idx} className={`skeleton skeleton-row ${className}`} style={itemStyle}></div>;
      
      case 'title':
        return <div key={idx} className={`skeleton skeleton-title ${className}`} style={itemStyle}></div>;
      
      default:
        return <div key={idx} className={`skeleton skeleton-text ${className}`} style={itemStyle}></div>;
    }
  };

  return (
    <div style={style} className={count > 1 && (variant === 'video-card' || variant === 'problem-card') ? 'skeleton-grid' : ''}>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </div>
  );
};

export default SkeletonLoader;
