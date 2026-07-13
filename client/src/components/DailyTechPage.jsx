import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';
import SkeletonLoader from './SkeletonLoader';

const DailyTechPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const res = await axios.get(`${API_BASE}/api/articles${category ? `?category=${category}` : ''}`);
                setArticles(res.data);
            } catch (err) {
                console.error('Error fetching articles:', err);
            }
            setLoading(false);
        };
        fetchArticles();
    }, [category]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
            <SEO
                title="Daily Tech News & Industry Updates | LeetVision"
                description="Stay updated with the latest in software engineering, tech layoffs, hiring trends, and startup news."
                path="/daily-tech"
            />

            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Daily Tech Pulse
                </h1>
                <p style={{ color: '#888', fontSize: '1.2rem' }}>Automated, AI-curated industry updates for the modern developer.</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['', 'Industry', 'Jobs', 'Placements', 'Startups'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '50px',
                            border: '1px solid #333',
                            background: category === cat ? '#f57c00' : '#111',
                            color: category === cat ? '#fff' : '#aaa',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {cat || 'All News'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <SkeletonLoader 
                        variant="card" 
                        count={3} 
                        itemStyle={{ height: '220px', borderRadius: '16px', background: '#111', border: '1px solid #222' }} 
                    />
                </div>
            ) : articles.length > 0 ? (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {articles.map(article => (
                        <Link key={article._id} to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                            <article style={{
                                background: '#111',
                                border: '1px solid #222',
                                padding: '2rem',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#f57c00'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ background: 'rgba(245, 124, 0, 0.1)', color: '#f57c00', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {article.category}
                                    </span>
                                    <span style={{ color: '#555', fontSize: '0.85rem' }}>
                                        {new Date(article.publishedDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 1rem 0', lineHeight: 1.3 }}>{article.title}</h2>
                                <p style={{ color: '#aaa', lineHeight: 1.6, margin: 0, fontSize: '1rem' }}>{article.summary}</p>
                                <div style={{ marginTop: '1.5rem', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Read Analysis <span style={{ color: '#f57c00' }}>→</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                    <h2>No news articles found for this category.</h2>
                    <p>Check back later for fresh updates!</p>
                </div>
            )}

            <div style={{ marginTop: '4rem' }}>
                <AdSenseContainer slot="8240394871" />
            </div>
        </div>
    );
};

export default DailyTechPage;
