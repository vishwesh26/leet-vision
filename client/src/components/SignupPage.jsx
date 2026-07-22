import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaTimes, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Info, 2: OTP
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [localSuccess, setLocalSuccess] = useState('');

    const { signup, sendOtp, loading } = useAuth();
    const navigate = useNavigate();
    const widgetRef = useRef(null);
    const widgetIdRef = useRef(null);

    useEffect(() => {
        let intervalId;
        const renderWidget = () => {
            // Only render if step === 1 and widget is not yet rendered
            if (step === 1 && window.turnstile && widgetRef.current && widgetIdRef.current === null) {
                widgetIdRef.current = window.turnstile.render(widgetRef.current, {
                    sitekey: '0x4AAAAAAD7OXc6mSorQJz5c',
                    action: 'turnstile-spin-v2'
                });
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            intervalId = setInterval(() => {
                if (window.turnstile) {
                    renderWidget();
                    clearInterval(intervalId);
                }
            }, 100);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [step]); // Re-run if step changes so we can render when step 1 mounts

    // Cleanup widget on unmount
    useEffect(() => {
        return () => {
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, []);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLocalError('');
        setLocalSuccess('');

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        const formData = new FormData(e.target);
        const turnstileToken = formData.get('cf-turnstile-response');

        const result = await sendOtp(email, turnstileToken);
        if (result.success) {
            setLocalSuccess('Verification code sent to your email!');
            setStep(2);
        } else {
            setLocalError(result.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        const result = await signup(name, email, password, otp);
        if (result.success) {
            navigate('/');
        } else {
            setLocalError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <SEO
                title="Sign Up | LeetVision"
                description="Join LeetVision to track your LeetCode progress and access premium coding templates."
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
                    <h2>{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
                    <p>{step === 1 ? 'Start your journey to tech excellence' : `Enter the 6-digit code sent to ${email}`}</p>
                </div>

                {localError && (
                    <div className="auth-error">
                        <FaTimes style={{ marginRight: '8px' }} /> {localError}
                    </div>
                )}

                {localSuccess && (
                    <div className="auth-success">
                        {localSuccess}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label><FaUser /> Full Name</label>
                            <input
                                type="text"
                                placeholder="Vishwesh Shinde"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaEnvelope /> Email Address</label>
                            <input
                                type="email"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaLock /> Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div ref={widgetRef} style={{ margin: '0.5rem 0' }}></div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? (
                                <div className="btn-loader"></div>
                            ) : (
                                <>Get Verification Code <FaArrowRight style={{ marginLeft: '10px', fontSize: '0.8rem' }} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label><FaLock /> Verification Code</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength="6"
                                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? (
                                <div className="btn-loader"></div>
                            ) : (
                                <>Verify & Sign Up <FaArrowRight style={{ marginLeft: '10px', fontSize: '0.8rem' }} /></>
                            )}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Edit registration details
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-separator">
                    <span>OR</span>
                </div>

                <button
                    className="google-btn"
                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
                >
                    <FaGoogle style={{ marginRight: '10px' }} /> Sign up with Google
                </button>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
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
                    pointer-events: none;
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
                    pointer-events: none;
                }

                .auth-card {
                    background: rgba(20, 20, 20, 0.6);
                    backdrop-filter: blur(20px);
                    padding: 3.5rem 3rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 480px;
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

                .auth-error, .auth-success {
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-error {
                    background: rgba(255, 100, 100, 0.1);
                    border: 1px solid rgba(255, 100, 100, 0.2);
                    color: #ff6464;
                }

                .auth-success {
                    background: rgba(100, 255, 100, 0.1);
                    border: 1px solid rgba(100, 255, 100, 0.2);
                    color: #64ff64;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.6rem;
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
                    width: 100%;
                }

                .password-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .toggle-password {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    transition: 0.2s;
                    border-radius: 50%;
                }
                
                .toggle-password:hover {
                    color: var(--accent-orange);
                    background: rgba(255, 161, 22, 0.1);
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
                    margin-top: 1.5rem;
                    text-align: center;
                    color: #666;
                    font-size: 0.95rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .auth-separator {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 1.5rem 0;
                    color: #444;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .auth-separator::before,
                .auth-separator::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .auth-separator span {
                    padding: 0 1rem;
                }

                .google-btn {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1rem;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .google-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
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
        </div >
    );
};

export default SignupPage;
