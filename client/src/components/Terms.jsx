import React from 'react';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const Terms = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="Terms of Service" description="Terms of Service for LeetVision" path="/terms" />
            <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>Terms of Service</h1>
            <p>Last updated: July 2026</p>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                <p>Welcome to LeetVision. By accessing our website, browser extension, or mobile applications, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>2. Accounts and Subscriptions</h2>
                <p>To access certain features, you may be required to register for an account using OTP (One-Time Password) verification. You are responsible for maintaining the confidentiality of your account access. Payments are handled via secure third-party processors. All sales are final unless otherwise required by law.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>3. Intellectual Property</h2>
                <p>The content, organization, graphics, design, and other matters related to LeetVision are protected under applicable copyrights and other proprietary laws. The copying, redistribution, or use of any such matters or any part of the site is strictly prohibited without our express written permission.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Disclaimer</h2>
                <p>The materials on LeetVision are provided on an 'as is' basis. We make no warranties, expressed or implied, regarding the accuracy or reliability of the coding solutions or educational materials provided. LeetVision is intended as an educational supplement and does not guarantee specific career or interview outcomes.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>5. Limitations</h2>
                <p>In no event shall LeetVision or its developers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use our services, even if we have been notified of the possibility of such damage.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>6. External Links & Services</h2>
                <p>Our service integrates with third-party platforms like YouTube and LeetCode. We are not responsible for the content or availability of these external services. Use of such services is governed by their respective terms and policies.</p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>7. Governing Law</h2>
                <p>These terms and conditions are governed by and construed in accordance with the laws of India. You irrevocably submit to the exclusive jurisdiction of the courts located in India for any dispute resolution.</p>
            </section>

            <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                    Questions? Contact us at <strong>vishweshshinde26@gmail.com</strong>
                </p>
            </div>

            <AdSenseContainer slot="8240394871" />
        </div>
    );
};

export default Terms;
