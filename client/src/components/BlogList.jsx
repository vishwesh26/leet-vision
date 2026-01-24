import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const BLOG_POSTS = [
    {
        id: 'coding-interview-prep-guide',
        title: 'The Ultimate Guide to Coding Interview Preparation',
        excerpt: 'Mastering coding interviews requires more than just solving problems. Learn the structured approach to land your dream tech job.',
        date: 'Jan 24, 2026',
        readTime: '10 min read'
    },
    {
        id: 'leetcode-patterns-vs-memorization',
        title: 'LeetCode Patterns vs. Memorization: Why Patterns Win',
        excerpt: 'Stop trying to memorize 2000+ questions. Learn the 15 patterns that solve 90% of interview problems.',
        date: 'Jan 23, 2026',
        readTime: '8 min read'
    },
    {
        id: 'how-to-use-leetvision-effectively',
        title: 'How to Use LeetVision to Accelerate Your Learning',
        excerpt: 'Visualizing solutions is the fastest way to understand complex algorithms. Here is how to make the most of LeetVision.',
        date: 'Jan 22, 2026',
        readTime: '6 min read'
    }
];

const BlogList = () => {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
            <SEO title="Blog & Guides | LeetVision" description="Deep dives into coding interview strategies and algorithm patterns." path="/blog" />

            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Guides & Articles
                </h1>
                <p style={{ color: '#888', fontSize: '1.2rem' }}>Expert advice on cracking technical interviews and mastering data structures.</p>
            </header>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {BLOG_POSTS.map(post => (
                    <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
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
                            <div style={{ color: '#f57c00', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', gap: '1rem' }}>
                                <span>{post.date}</span>
                                <span style={{ color: '#555' }}>•</span>
                                <span>{post.readTime}</span>
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 1rem 0' }}>{post.title}</h2>
                            <p style={{ color: '#aaa', lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
                            <div style={{ marginTop: '1.5rem', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Read Full Article <span style={{ color: '#f57c00' }}>→</span>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            <div style={{ marginTop: '4rem' }}>
                <AdSenseContainer slot="8240394871" />
            </div>
        </div>
    );
};

export default BlogList;
