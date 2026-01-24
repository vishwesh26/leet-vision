import React from 'react';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const HowItWorks = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="How It Works" description="Learn how LeetVision organizes and selects the best coding solutions." path="/how-it-works" />
            <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How It Works</h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>1. Problem Indexing</h2>
                <p>We maintain a comprehensive database of over 3,000+ LeetCode questions, complete with their difficulty levels, topic tags, and company-specific data. This metadata is periodically synchronized to ensure accuracy with the latest platform updates.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>2. Video Selection Algorithm</h2>
                <p>When you search for a problem, our backend uses a combination of keyword matching and ranking to find the most relevant video solutions on YouTube. We prioritize creators known for high-quality technical explanations (like NeetCode, Tech Dose, and others) to ensure you get the best learning experience.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>3. The LeetVision Extension</h2>
                <p>Our browser extension integrates directly into the LeetCode interface. While you're solving a problem on leetcode.com, the extension identifies the problem ID and fetches the corresponding video solution from our API, displaying it right on the page. This saves you from switching tabs and losing focus.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>4. Personal Roadmaps</h2>
                <p>By connecting your LeetCode account, we can fetch your solved problem history. We then map this data against curated lists like the "Top 100 Liked" or "Blind 75" to highlight exactly which core patterns you still need to practice.</p>
            </section>

            <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>Ready to get started?</h3>
                <p>Jump into our curated problem lists and start mastering coding patterns today.</p>
                <a href="/top-100-leetcode" style={{ display: 'inline-block', background: '#f57c00', color: '#fff', padding: '0.8rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, marginTop: '1rem' }}>Browse Top Questions</a>
            </div>

            <AdSenseContainer slot="8240394871" />
        </div>
    );
};

export default HowItWorks;
