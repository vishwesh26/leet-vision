import React from 'react';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const PrivacyPolicy = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="Privacy Policy" description="Privacy Policy for LeetVision" path="/privacy-policy" />
            <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>
            <p>Last updated: January 2026</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>1. Introduction</h2>
                <p>Welcome to LeetVision ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>2. The Data We Collect</h2>
                <p>We do not require you to create an account to use the basic features of LeetVision. However, we may collect certain information such as:</p>
                <ul>
                    <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
                    <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, and location.</li>
                    <li><strong>LeetCode Username:</strong> If you choose to connect your LeetCode account for progress tracking, we store your username locally in your browser.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>3. How We Use Your Data</h2>
                <p>We use your data only to provide and improve our services, specifically:</p>
                <ul>
                    <li>To personalize your experience.</li>
                    <li>To track your problem-solving progress (if connected).</li>
                    <li>To monitor and analyze usage trends.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>4. Third-Party Services</h2>
                <p>We use third-party services that may collect information used to identify you:</p>
                <ul>
                    <li><strong>Google AdSense:</strong> We show ads to support the platform. Google uses cookies to serve ads based on your prior visits.</li>
                    <li><strong>YouTube API:</strong> We display video solutions from YouTube. By using LeetVision, you agree to be bound by the YouTube Terms of Service.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>5. Cookies</h2>
                <p>We use cookies to enhance your experience. You can choose to disable cookies through your individual browser options.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>6. Contact Us</h2>
                <p>If you have any questions about this privacy policy, please contact us at vishweshshinde26@gmail.com.</p>
            </section>
            <AdSenseContainer slot="8240394871" />
        </div>
    );
};

export default PrivacyPolicy;
