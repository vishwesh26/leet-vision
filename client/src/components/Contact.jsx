import React from 'react';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const Contact = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title="Contact Us" description="Contact LeetVision" path="/contact" />
            <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '2rem' }}>Contact Us</h1>
            <p>We'd love to hear from you! Whether you have questions about the platform, feedback on how we can improve, or just want to say hi, feel free to reach out.</p>

            <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333', marginTop: '2rem' }}>
                <h2 style={{ color: '#fff', marginTop: 0 }}>Get in Touch</h2>
                <p><strong>Email:</strong> vishweshshinde26@gmail.com</p>
                <p><strong>Socials:</strong></p>
                <ul>
                    <li><a href="https://linkedin.com/in/vishweshshinde" target="_blank" rel="noreferrer" style={{ color: '#f57c00' }}>LinkedIn</a></li>
                    <li><a href="https://instagram.com/vishwesh_shinde" target="_blank" rel="noreferrer" style={{ color: '#f57c00' }}>Instagram</a></li>
                    <li><a href="https://github.com/vishwesh26" target="_blank" rel="noreferrer" style={{ color: '#f57c00' }}>GitHub</a></li>
                </ul>
            </div>

            <p style={{ marginTop: '2rem' }}>For any technical issues or bug reports, please feel free to open an issue on our GitHub repository.</p>

            <div style={{ marginTop: '4rem' }}>
                <AdSenseContainer slot="8240394871" />
            </div>
        </div>
    );
};

export default Contact;
