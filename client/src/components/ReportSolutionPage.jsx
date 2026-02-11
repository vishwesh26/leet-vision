import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SEO from './SEO';
import { FaExclamationTriangle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const ReportSolutionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState({
        questionId: '',
        title: '',
        platform: 'LeetCode',
        reason: 'Incorrect Solution',
        details: '',
        correctSolution: ''
    });

    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    // Initialize from navigation state
    useEffect(() => {
        if (location.state) {
            setFormData(prev => ({
                ...prev,
                questionId: location.state.questionId || '',
                title: location.state.title || '',
                platform: location.state.platform || 'LeetCode'
            }));
        } else {
            // Redirect if accessed directly without context
            // navigate('/');
        }
    }, [location.state, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            await axios.post(`${API_BASE}/api/report`, formData);
            setStatus('success');
            setTimeout(() => {
                navigate(-1); // Go back after success
            }, 3000);
        } catch (err) {
            console.error("Report failed:", err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="report-container success-view">
                <FaCheckCircle size={60} color="#4caf50" />
                <h2>Report Submitted!</h2>
                <p>Thank you for helping us improve LeetVision.</p>
                <p>Redirecting back...</p>
            </div>
        );
    }

    return (
        <div className="report-page">
            <style>{`
                .report-page {
                    min-height: 100vh;
                    background: #000;
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    padding: 40px 20px;
                    font-family: 'DM Sans', sans-serif;
                }
                .report-container {
                    width: 100%;
                    max-width: 600px;
                    background: #111;
                    padding: 40px;
                    border-radius: 20px;
                    border: 1px solid #222;
                }
                .success-view {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    margin-top: 100px;
                }
                .report-header {
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .back-btn {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    margin-bottom: 20px;
                    transition: 0.2s;
                }
                .back-btn:hover { color: #fff; }

                .form-group { margin-bottom: 25px; }
                label { display: block; margin-bottom: 10px; color: #aaa; font-size: 0.9rem; font-weight: 600; }
                input, select, textarea {
                    width: 100%;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    color: #fff;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 1rem;
                    outline: none;
                    transition: 0.2s;
                }
                input:focus, select:focus, textarea:focus {
                    border-color: #f57c00;
                    background: #222;
                }
                textarea { min-height: 120px; resize: vertical; }
                
                .read-only-field {
                    background: #080808;
                    color: #666;
                    cursor: not-allowed;
                }
                
                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    background: #f57c00;
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .submit-btn:hover {
                    background: #ff9800;
                    transform: translateY(-2px);
                }
                .submit-btn:disabled {
                    background: #444;
                    cursor: wait;
                    color: #888;
                }
                .error-msg {
                    color: #ff5252;
                    margin-top: 15px;
                    text-align: center;
                }
            `}</style>

            <SEO title="Report Solution | LeetVision" description="Report incorrect solutions" />

            <div className="report-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back to Solution
                </button>

                <div className="report-header">
                    <div style={{ padding: '12px', background: 'rgba(255, 82, 82, 0.1)', borderRadius: '12px' }}>
                        <FaExclamationTriangle size={24} color="#ff5252" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Report Issue</h1>
                        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Help us maintain high quality standards</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Problem Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            disabled
                            className="read-only-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>Reason for Report</label>
                        <select
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        >
                            <option value="Incorrect Solution">Incorrect Solution</option>
                            <option value="Suboptimal Approach">Suboptimal Approach</option>
                            <option value="Formatting Issue">Formatting Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Details (Optional)</label>
                        <textarea
                            placeholder="Describe what is wrong..."
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Correct Solution (Optional)</label>
                        <textarea
                            placeholder="Paste correct code or logic here..."
                            value={formData.correctSolution}
                            onChange={(e) => setFormData({ ...formData, correctSolution: e.target.value })}
                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                        {status === 'submitting' ? 'Submitting...' : 'Submit Report'}
                    </button>

                    {status === 'error' && (
                        <p className="error-msg">Failed to submit report. Please try again.</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ReportSolutionPage;
