import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaUsers, FaUser, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CAMPAIGN_LIST = [
    { id: 'funny_ghosted', label: '😂 Funny — Ghost Email', subject: "👻 You've been ghosting us... just like those interviewers" },
    { id: 'motivational_grind', label: '💪 Motivational — Grind', subject: '💪 Your dream job is one problem away' },
    { id: 'marketing_new_questions', label: '🔥 Marketing — New Questions', subject: '🔥 Hot new company questions just dropped!' },
    { id: 'funny_read_receipt', label: '📱 Funny — Left on Read', subject: '📱 Attention: Your interview prep has been left on Read' },
    { id: 'motivational_one_day', label: '🧠 Motivational — One Problem a Day', subject: '🧠 One problem a day keeps the rejection away' },
    { id: 'marketing_premium', label: '👑 Marketing — Go Premium', subject: '👑 Unlock the full power of LeetVision' },
    { id: 'funny_horror', label: '😱 Funny — Interview Horror', subject: '😱 This is a dramatized recreation of your next interview...' },
];

const AdminEmailCampaign = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [campaignId, setCampaignId] = useState('');
    const [recipientMode, setRecipientMode] = useState('all'); // 'all' | 'specific'
    const [specificEmail, setSpecificEmail] = useState('');
    const [customNote, setCustomNote] = useState('');
    const [dryRun, setDryRun] = useState(false);

    const [sending, setSending] = useState(false);
    const [connChecking, setConnChecking] = useState(false);
    const [result, setResult] = useState(null); // { success, message, sent, skipped }
    const [previewHtml, setPreviewHtml] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const selectedCampaign = CAMPAIGN_LIST.find(c => c.id === campaignId);

    useEffect(() => {
        if (authLoading) return;
        if (!user || !user.isAdmin) navigate('/');
    }, [user, authLoading, navigate]);

    const handleSend = async () => {
        if (!campaignId) {
            setResult({ success: false, message: 'Please select a campaign template.' });
            return;
        }
        if (recipientMode === 'specific' && !specificEmail.trim()) {
            setResult({ success: false, message: 'Please enter a recipient email address.' });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const payload = {
                campaignId,
                dryRun,
                ...(recipientMode === 'specific' ? { specificEmail: specificEmail.trim() } : {}),
                ...(customNote.trim() ? { customNote: customNote.trim() } : {}),
            };

            const res = await axios.post(`${API_BASE}/api/admin/send-campaign`, payload, {
                withCredentials: true
            });

            setResult({
                success: true,
                message: res.data.message,
                sent: res.data.sent,
                skipped: res.data.skipped,
                errors: res.data.errors || []
            });
        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.message || err.response?.data?.error || 'Failed to send campaign. Check console.'
            });
        } finally {
            setSending(false);
        }
    };

    const handleCheckConn = async () => {
        setConnChecking(true);
        setResult(null);
        try {
            const res = await axios.get(`${API_BASE}/api/admin/test-auth`, { withCredentials: true });
            setResult({ success: true, message: `Connected! Logged in as: ${res.data.user.name} (${res.data.user.email})` });
        } catch (err) {
            setResult({
                success: false,
                message: `Connection Failed: ${err.response?.data?.message || err.response?.data?.error || err.message}`
            });
        } finally {
            setConnChecking(false);
        }
    };

    if (authLoading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ background: '#050505', minHeight: '100vh', color: 'white', padding: '40px 20px', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Back Link */}
                <Link to="/" style={{ color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
                    <FaArrowLeft /> Back to Site
                </Link>

                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px' }}>
                        Email <span style={{ color: '#f57c00' }}>Campaign</span>
                    </h1>
                    <p style={{ color: '#666', margin: 0 }}>Send re-engagement emails to your users.</p>
                </div>

                {/* Campaign Selector */}
                <Section title="1. Choose Campaign Template" icon={<FaEnvelope />}>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {CAMPAIGN_LIST.map(c => (
                            <label key={c.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px',
                                background: campaignId === c.id ? 'rgba(245,124,0,0.1)' : '#111',
                                border: `1px solid ${campaignId === c.id ? '#f57c00' : '#222'}`,
                                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <input
                                    type="radio" name="campaign" value={c.id}
                                    checked={campaignId === c.id}
                                    onChange={() => setCampaignId(c.id)}
                                    style={{ marginTop: '3px', accentColor: '#f57c00' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '3px' }}>{c.label}</div>
                                    <div style={{ color: '#666', fontSize: '0.85rem' }}>{c.subject}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </Section>

                {/* Recipient Selector */}
                <Section title="2. Select Recipients" icon={<FaUsers />}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <TabButton active={recipientMode === 'all'} onClick={() => setRecipientMode('all')} icon={<FaUsers />}>
                            All Subscribed Users
                        </TabButton>
                        <TabButton active={recipientMode === 'specific'} onClick={() => setRecipientMode('specific')} icon={<FaUser />}>
                            Specific User (Testing)
                        </TabButton>
                    </div>

                    {recipientMode === 'specific' && (
                        <input
                            type="email"
                            placeholder="Enter email address..."
                            value={specificEmail}
                            onChange={e => setSpecificEmail(e.target.value)}
                            style={inputStyle}
                        />
                    )}

                    {recipientMode === 'all' && (
                        <div style={{ color: '#888', fontSize: '0.9rem', padding: '10px', background: 'rgba(245,124,0,0.05)', borderRadius: '8px', border: '1px solid rgba(245,124,0,0.15)' }}>
                            ⚠️ This will email <strong style={{ color: '#f57c00' }}>all subscribed users</strong>. Users emailed within the last 5 days will be skipped.
                        </div>
                    )}
                </Section>

                {/* Custom Note (Optional) */}
                <Section title="3. Custom Note (Optional)" icon={<FaEnvelope />}>
                    <textarea
                        placeholder="Add a custom note that appears at the top of the email... (leave blank to use default template)"
                        value={customNote}
                        onChange={e => setCustomNote(e.target.value)}
                        rows={4}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <p style={{ color: '#555', fontSize: '0.8rem', margin: '8px 0 0' }}>
                        Custom notes will be shown as a highlighted box at the top of the selected template.
                    </p>
                </Section>

                {/* Options */}
                <Section title="4. Send Options" icon={<FaPaperPlane />}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#aaa', fontSize: '0.95rem' }}>
                        <input
                            type="checkbox"
                            checked={dryRun}
                            onChange={e => setDryRun(e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: '#f57c00' }}
                        />
                        <span>
                            <strong style={{ color: dryRun ? '#f57c00' : '#fff' }}>Dry Run Mode</strong>
                            <span style={{ color: '#555', marginLeft: '8px' }}>— Counts recipients but does NOT send emails</span>
                        </span>
                    </label>
                </Section>

                {/* Result Banner */}
                {result && (
                    <div style={{
                        padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
                        background: result.success ? 'rgba(76,175,80,0.1)' : 'rgba(255,82,82,0.1)',
                        border: `1px solid ${result.success ? '#4caf50' : '#ff5252'}`,
                        display: 'flex', alignItems: 'flex-start', gap: '12px'
                    }}>
                        {result.success
                            ? <FaCheckCircle size={20} color="#4caf50" style={{ marginTop: '2px', flexShrink: 0 }} />
                            : <FaTimesCircle size={20} color="#ff5252" style={{ marginTop: '2px', flexShrink: 0 }} />
                        }
                        <div>
                            <div style={{ fontWeight: '700', color: result.success ? '#4caf50' : '#ff5252', marginBottom: '4px' }}>
                                {result.success ? 'Success!' : 'Error'}
                            </div>
                            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{result.message}</div>
                            {result.success && (
                                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    <Stat label="Sent" value={result.sent} color="#4caf50" />
                                    <Stat label="Skipped" value={result.skipped} color="#ff9800" />
                                    <Stat label="Errors" value={result.errors?.length || 0} color="#ff5252" />
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,82,82,0.2)', paddingTop: '10px' }}>
                                    <div style={{ color: '#ff5252', fontSize: '0.8rem', fontWeight: '700', marginBottom: '5px' }}>Error Details:</div>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {result.errors.map((err, idx) => (
                                            <div key={idx} style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>
                                                • <span style={{ color: '#aaa' }}>{err.email}:</span> {err.error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleSend}
                        disabled={sending || !campaignId}
                        style={{
                            background: !campaignId ? '#222' : 'linear-gradient(135deg, #f57c00, #ff9800)',
                            color: !campaignId ? '#555' : '#fff',
                            border: 'none', borderRadius: '12px', padding: '14px 28px',
                            fontSize: '1rem', fontWeight: '700', cursor: !campaignId ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                        }}
                    >
                        {sending ? <><FaSpinner className="spin" /> Sending...</> :
                            dryRun ? <><FaEye /> Run Dry Test</> :
                                <><FaPaperPlane /> Send Campaign</>}
                    </button>

                    <button
                        onClick={handleCheckConn}
                        disabled={connChecking}
                        style={{
                            background: '#111', color: '#888',
                            border: '1px solid #222', borderRadius: '12px', padding: '14px 20px',
                            fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                    >
                        {connChecking ? <FaSpinner className="spin" /> : <FaCheckCircle />} Check Connection
                    </button>
                </div>

            </div>
        </div>
    );
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

const Section = ({ title, icon, children }) => (
    <div style={{ marginBottom: '28px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: '#f57c00' }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{title}</h3>
        </div>
        {children}
    </div>
);

const TabButton = ({ active, onClick, icon, children }) => (
    <button onClick={onClick} style={{
        background: active ? 'rgba(245,124,0,0.15)' : '#111',
        border: `1px solid ${active ? '#f57c00' : '#222'}`,
        color: active ? '#f57c00' : '#888', borderRadius: '10px',
        padding: '10px 18px', cursor: 'pointer', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontSize: '0.9rem'
    }}>
        {icon} {children}
    </button>
);

const Stat = ({ label, value, color }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color }}>{value}</div>
        <div style={{ color: '#666', fontSize: '0.8rem' }}>{label}</div>
    </div>
);

const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #222', borderRadius: '10px',
    padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s'
};

export default AdminEmailCampaign;
