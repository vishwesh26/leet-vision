import React from 'react';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const About = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="About LeetVision" description="Learn more about LeetVision and its mission." path="/about" />
            <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>About LeetVision</h1>

            <p style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '2rem' }}>Mastering coding interviews shouldn't be a struggle. We help you visualize the solutions.</p>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>What is LeetVision?</h2>
                <p>LeetVision is a specialized tool designed for software engineers preparing for coding interviews. We bridge the gap between hard-to-read text editorials and high-quality video explanations. By indexing thousands of LeetCode problems and their best YouTube video solutions, we provide a streamlined, distraction-free learning experience.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>Who is it for?</h2>
                <p>Whether you're a college student aiming for your first internship or a senior engineer preparing for a career move at a MAANG company, LeetVision is built for you. If you've ever found yourself stuck on a "Hard" problem and wished there was a clear video to explain it, you're in the right place.</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#fff' }}>How it helps</h2>
                <ul>
                    <li><strong>Accuracy:</strong> We curate videos that are most accurate and easy to follow.</li>
                    <li><strong>Pattern Recognition:</strong> Our topic-wise organization helps you master problem-solving patterns rather than memorizing individual solutions.</li>
                    <li><strong>Progress Tracking:</strong> Connect your LeetCode account to see exactly what you've solved and what's next in your roadmap.</li>
                    <li><strong>Efficiency:</strong> Skip the YouTube search results and get the best video directly from our extension or web platform.</li>
                </ul>
            </section>

            <div style={{ background: 'rgba(245, 124, 0, 0.1)', borderLeft: '4px solid #f57c00', padding: '1.5rem', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}><strong>Mission:</strong> Our mission is to make the world's best coding interview resources accessible and organized for everyone, everywhere.</p>
            </div>

            <AdSenseContainer slot="8240394871" />
        </div>
    );
};

export default About;
