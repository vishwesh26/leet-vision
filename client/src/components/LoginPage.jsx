import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import { FaEnvelope, FaLock, FaUser, FaTimes } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/'); // Or dashboard
        } else {
            setLocalError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <SEO
                title="Login | LeetVision"
                description="Sign in to your LeetVision account to track progress and unlock premium templates."
            />

            {/* Background Decor */}
            <div className="auth-bg-decor">
                <div className="premium-grid-bg"></div>
                <div className="glow-spotlight"></div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-brand" onClick={() => navigate('/')}>
                        Leet<span>Vision</span>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Continue your journey to tech excellence</p>
                </div>

                {localError && (
                    <div className="auth-error">
                        <FaTimes style={{ marginRight: '8px' }} /> {localError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label><FaEnvelope /> Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label><FaLock /> Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (
                            <div className="btn-loader"></div>
                        ) : (
                            <>Sign In <FaUser style={{ marginLeft: '10px', fontSize: '0.8rem' }} /></>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New to LeetVision? <Link to="/signup">Create an Account</Link></p>
                </div>
            </div>

            <style>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: #050505;
                    position: relative;
                    overflow: hidden;
                }

                .auth-bg-decor {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                }

                .premium-grid-bg {
                    position: absolute;
                    inset: 0;
                    background-size: 40px 40px;
                    background-image: linear-gradient(to right, rgba(255, 161, 22, 0.05) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255, 161, 22, 0.05) 1px, transparent 1px);
                    mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
                }
                
                .glow-spotlight {
                    position: absolute;
                    top: -20%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(255, 161, 22, 0.15) 0%, transparent 70%);
                    filter: blur(80px);
                }

                .auth-card {
                    background: rgba(20, 20, 20, 0.6);
                    backdrop-filter: blur(20px);
                    padding: 3.5rem 3rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 460px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    position: relative;
                    z-index: 10;
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .auth-brand {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin-bottom: 2rem;
                    cursor: pointer;
                    letter-spacing: -1px;
                }
                .auth-brand span { color: var(--accent-orange); }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                
                .auth-header h2 {
                    font-size: 2.2rem;
                    margin-bottom: 0.8rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                    color: white;
                }
                
                .auth-header p {
                    color: #888;
                    font-size: 1rem;
                }

                .auth-error {
                    background: rgba(255, 68, 68, 0.1);
                    border: 1px solid rgba(255, 68, 68, 0.2);
                    color: #ff4444;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.8rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                }

                .form-group label {
                    font-size: 0.85rem;
                    color: #888;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .form-group input {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 1.1rem 1.2rem;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--accent-orange);
                    background: rgba(255, 161, 22, 0.05);
                    box-shadow: 0 0 0 4px rgba(255, 161, 22, 0.1);
                }

                .auth-btn {
                    background: var(--accent-orange);
                    color: white;
                    border: none;
                    padding: 1.1rem;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px -5px rgba(255, 161, 22, 0.3);
                }

                .auth-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    background: #ff9800;
                    box-shadow: 0 15px 30px -5px rgba(255, 161, 22, 0.5);
                }

                .auth-btn:active {
                    transform: translateY(0);
                }

                .auth-btn:disabled {
                    opacity: 0.6;
                    cursor: wait;
                }

                .btn-loader {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .auth-footer {
                    margin-top: 2.5rem;
                    text-align: center;
                    color: #666;
                    font-size: 0.95rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .auth-footer a {
                    color: var(--accent-orange);
                    text-decoration: none;
                    font-weight: 700;
                    margin-left: 5px;
                }

                .auth-footer a:hover {
                    color: #ff9800;
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 2.5rem 1.5rem;
                        background: transparent;
                        backdrop-filter: none;
                        border: none;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
