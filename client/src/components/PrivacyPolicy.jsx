import React from 'react';
import SEO from './SEO';
import EzoicAd from './ads/EzoicAd';

const PrivacyPolicy = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="Privacy Policy" description="Privacy Policy for LeetVision" path="/privacy-policy" />
            <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>Privacy Policy</h1>
            <p>Last updated: July 2026</p>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
                <p>We collect information to provide a better experience for our users. This includes:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li><strong>Account Information:</strong> Email addresses and phone numbers used for OTP-based authentication.</li>
                    <li><strong>Usage Activity:</strong> Data on which problems you solve, video solutions watched, and your progress across different coding platforms.</li>
                    <li><strong>Technical Logs:</strong> IP addresses, browser types, and device identification for security and analytics.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>2. How We Use Information</h2>
                <p>Your data is used strictly to enhance your preparation experience:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>To verify your identity via OTP and secure your account.</li>
                    <li>To synchronize your professional coding progress with our dashboard.</li>
                    <li>To provide personalized problem recommendations based on your history.</li>
                    
                </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>3. Data Sharing & Third Parties</h2>
                <p>We do not sell your personal data. We use trusted third-party services for specific functions:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li><strong>Ezoic & Advertising Partners:</strong> We use Ezoic to manage website monetization, analytics, and advertising. For full disclosures on cookies and data used by Ezoic and its partners, see below.</li>
                    <li><strong>Google AdSense:</strong> Serves personalized advertisements based on user interests.</li>
                    <li><strong>YouTube:</strong> We use YouTube API Services to display educational content. Use is subject to the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-orange)' }}>YouTube Terms of Service</a>.</li>
                    <li><strong>Cloud Infrastructure:</strong> Your data is securely stored on Vercel and MongoDB clusters with industry-standard encryption.</li>
                </ul>
            </section>

            {/* Ezoic Privacy Policy Embed */}
            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Ezoic Privacy Policy & Cookie Disclosures</h2>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span id="ezoic-privacy-policy-embed"></span>
                </div>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Data Security</h2>
                <p>We implement robust security measures, including HTTPS encryption and secure session handling, to protect your data from unauthorized access or disclosure. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>5. Your Rights</h2>
                <p>You have the right to access, correct, or request the deletion of your account data. You can manage your profile settings through the dashboard or contact us for data portability requests.</p>
            </section>

            <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                    Privacy concerns? Reach out at <strong>vishweshshinde26@gmail.com</strong>
                </p>
            </div>

            <EzoicAd />
        </div>
    );
};

export default PrivacyPolicy;
