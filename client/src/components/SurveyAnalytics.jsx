import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SurveyAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const res = await axios.get(`${API_BASE}/api/survey/stats`);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Analytics...</div>;
    if (!stats) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>No data available.</div>;

    const findCount = (arr, id) => arr.find(item => item._id === id)?.count || 0;

    return (
        <div style={{ background: '#050505', minHeight: '100vh', color: 'white', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                <Link to="/" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <FaArrowLeft /> Back to Site
                </Link>

                <h1 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>
                    Survey <span style={{ color: 'var(--accent-orange)' }}>Insights</span>
                </h1>

                {/* Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ background: '#111', border: '1px solid #222', padding: '30px', borderRadius: '16px' }}>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>Total Responses</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.total}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                    {/* Response Distribution */}
                    <div style={{ background: '#111', border: '1px solid #222', padding: '30px', borderRadius: '24px' }}>
                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaChartBar color="var(--accent-orange)" /> Response Distribution
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {['Yes', 'Maybe', 'No'].map(label => {
                                const count = findCount(stats.distribution, label);
                                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>{label}</span>
                                            <span style={{ color: '#888' }}>{count} ({Math.round(percent)}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${percent}%`,
                                                height: '100%',
                                                background: label === 'Yes' ? '#4caf50' : label === 'Maybe' ? '#ffa116' : '#ff5252'
                                            }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pricing Preferences */}
                    <div style={{ background: '#111', border: '1px solid #222', padding: '30px', borderRadius: '24px' }}>
                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaUsers color="#6464ff" /> Price Point Popularity
                        </h3>
                        {stats.pricing.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #222' }}>
                                <span>{p._id}</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{p.count} users</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: '#111', border: '1px solid #222', padding: '30px', borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: '#555', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '12px' }}>Time</th>
                                    <th style={{ padding: '12px' }}>Response</th>
                                    <th style={{ padding: '12px' }}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent.map((r, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #222' }}>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#888' }}>
                                            {new Date(r.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                background: r.response === 'Yes' ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.05)',
                                                color: r.response === 'Yes' ? '#4caf50' : 'white'
                                            }}>
                                                {r.response}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>{r.pricePoint}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyAnalytics;
