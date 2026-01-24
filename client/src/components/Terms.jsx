import React from 'react';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const Terms = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="Terms of Service" description="Terms of Service for LeetVision" path="/terms" />
            <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '2rem' }}>Terms of Service</h1>
            <p>Last updated: January 2026</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>1. Acceptance of Terms</h2>
                <p>By accessing and using LeetVision, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>2. Use of License</h2>
                <p>Permission is granted to temporarily use the materials (information or software) on LeetVision's website for personal, non-commercial transitory viewing only.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>3. Disclaimer</h2>
                <p>The materials on LeetVision's website are provided on an 'as is' basis. LeetVision makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>4. Limitations</h2>
                <p>In no event shall LeetVision or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LeetVision's website.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>5. Accuracy of Materials</h2>
                <p>The materials appearing on LeetVision's website could include technical, typographical, or photographic errors. LeetVision does not warrant that any of the materials on its website are accurate, complete or current.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>6. Links</h2>
                <p>LeetVision has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by LeetVision of the site.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff' }}>7. Governing Law</h2>
                <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
            </section>

            <AdSenseContainer slot="8240394871" />
        </div>
    );
};

export default Terms;
