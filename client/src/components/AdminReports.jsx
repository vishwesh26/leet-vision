import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchReports();
    }, [user, authLoading, navigate]);

    const fetchReports = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const res = await axios.get(`${API_BASE}/api/reports`, {
                withCredentials: true
            });
            setReports(res.data);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading || authLoading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ background: '#050505', minHeight: '100vh', color: 'white', padding: '40px 20px', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <Link to="/" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
                    <FaArrowLeft /> Back to Site
                </Link>

                <h1 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>
                    Report <span style={{ color: '#ff5252' }}>Inbox</span>
                </h1>

                {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                        <FaCheckCircle size={50} style={{ marginBottom: '20px', color: '#333' }} />
                        <p>No reports found. Clean slate!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {reports.map(report => (
                            <div key={report._id} style={{
                                background: '#111',
                                border: '1px solid #222',
                                borderRadius: '16px',
                                padding: '25px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                            <span style={{
                                                background: 'rgba(255, 82, 82, 0.1)',
                                                color: '#ff5252',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {report.reason}
                                            </span>
                                            <span style={{ color: '#666', fontSize: '0.9rem' }}>{formatDate(report.createdAt)}</span>
                                        </div>
                                        <h3 style={{ margin: '5px 0', fontSize: '1.2rem' }}>
                                            {report.title} <span style={{ color: '#666', fontWeight: 'normal', fontSize: '0.9rem' }}>({report.platform})</span>
                                        </h3>
                                        <div style={{ color: '#888', fontSize: '0.9rem' }}>ID: {report.questionId}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Link
                                            to={report.platform === 'LeetCode' ? `/solution/${report.questionId}` : `/universe/solution/${report.platform}/${report.questionId}`}
                                            target="_blank"
                                            style={{
                                                background: '#222',
                                                color: '#fff',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            View Problem
                                        </Link>
                                    </div>
                                </div>

                                {report.details && (
                                    <div style={{ background: '#080808', padding: '15px', borderRadius: '8px', fontSize: '0.95rem', color: '#ccc' }}>
                                        <strong>User Note:</strong> {report.details}
                                    </div>
                                )}

                                {report.correctSolution && (
                                    <div style={{ background: '#080808', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '8px', color: '#4caf50' }}>Suggest Fix:</strong>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#aaa', fontFamily: 'monospace' }}>
                                            {report.correctSolution}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
