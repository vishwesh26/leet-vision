import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import { FaCoffee, FaArrowLeft, FaHeart, FaBolt, FaCode, FaHeart as FaHeartSolid } from 'react-icons/fa';

const BuyMeACoffeePage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [selectedPreset, setSelectedPreset] = useState(100); // Default to Latte
    const [amount, setAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Redirect to login if user is not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }
    }, [user, authLoading, navigate]);

    const presets = [
        { id: 50, name: 'Espresso', price: 50, emoji: '☕' },
        { id: 100, name: 'Latte', price: 100, emoji: '🥛', badge: 'Most brewed' },
        { id: 200, name: 'Cappuccino', price: 200, emoji: '☕' },
        { id: 500, name: 'Full Pot', price: 500, emoji: '🍯', badge: 'Go big' }
    ];

    const handlePresetSelect = (preset) => {
        setSelectedPreset(preset.id);
        setAmount(preset.price);
        setCustomAmount('');
        setError('');
    };

    const handleCustomClick = () => {
        setSelectedPreset('custom');
        setAmount(customAmount ? parseInt(customAmount) : 0);
    };

    const handleCustomAmountChange = (e) => {
        const val = e.target.value;
        setCustomAmount(val);
        const parsed = parseInt(val);
        if (!isNaN(parsed) && parsed > 0) {
            setAmount(parsed);
            setError('');
        } else {
            setAmount(0);
        }
    };

    const handlePayment = async () => {
        if (amount < 10) {
            setError('Please donate a minimum of ₹10 to cover payment gateway fees.');
            return;
        }

        setIsPaying(true);
        setError('');

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const orderRes = await axios.post(`${API_BASE}/api/payment/create-order`, {
                type: 'coffee',
                amount: amount
            }, { withCredentials: true });

            const { orderId, amount: rzAmount, keyId, currency } = orderRes.data.data;

            const options = {
                key: keyId,
                amount: rzAmount,
                currency: currency,
                name: "Leet-Vision Support",
                description: message ? `Coffee Support: ${message.substring(0, 40)}` : `Buy Me a Coffee - ₹${amount}`,
                order_id: orderId,
                notes: {
                    message: message,
                    supporter_name: user?.name || "Supporter"
                },
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(`${API_BASE}/api/payment/verify`, {
                            ...response,
                            type: 'coffee',
                            amount: amount
                        }, { withCredentials: true });

                        if (verifyRes.data.status === 'success') {
                            setSuccess(true);
                            setIsPaying(false);
                        }
                    } catch (err) {
                        setError("Verification failed. Please contact support.");
                        setIsPaying(false);
                    }
                },
                prefill: {
                    name: user?.name || "Supporter",
                    email: user?.email || ""
                },
                theme: { color: "#ffa116" },
                modal: {
                    ondismiss: function () {
                        setIsPaying(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to initialize payment");
            setIsPaying(false);
        }
    };

    if (authLoading) {
        return <div className="loading-screen" style={{ color: '#fff', textAlign: 'center', padding: '10rem', background: '#080808', minHeight: '100vh' }}>Loading Supporter Space...</div>;
    }

    if (success) {
        return (
            <div className="coffee-page-wrapper">
                <SEO title="Thank You! | Leet-Vision" />
                <div className="coffee-success-card">
                    <div className="success-icon-wrapper">
                        <FaHeartSolid className="heart-icon animate-beat" />
                    </div>
                    <h1>Thank You So Much!</h1>
                    <p className="success-text">
                        Your support of <strong>₹{amount}</strong> has been successfully received. 
                        It took many sleepless nights to build Leet-Vision, and knowing that it has been helpful to you is incredibly rewarding.
                    </p>
                    <button className="back-btn-theme" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Go Back to Solutions
                    </button>
                </div>

                <style>{`
                    .coffee-page-wrapper {
                        display: flex;
                        justify-content: space-around;
                        align-items: center;
                        min-height: 100vh;
                        background: #080808;
                        padding: 2rem;
                        font-family: 'Outfit', sans-serif;
                    }
                    .coffee-success-card {
                        background: #111;
                        border: 1px solid #222;
                        border-radius: 24px;
                        padding: 4rem 3rem;
                        max-width: 550px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                    }
                    .success-icon-wrapper {
                        margin-bottom: 2rem;
                    }
                    .heart-icon {
                        font-size: 5rem;
                        color: #ffa116;
                    }
                    .animate-beat {
                        animation: beat 1.2s infinite alternate;
                    }
                    @keyframes beat {
                        to { transform: scale(1.15); }
                    }
                    h1 {
                        color: #fff;
                        font-size: 2.5rem;
                        font-weight: 800;
                        margin-bottom: 0.5rem;
                    }
                    .success-text {
                        color: #aaa;
                        font-size: 1.15rem;
                        line-height: 1.8;
                        margin-bottom: 2.5rem;
                    }
                    .back-btn-theme {
                        background: #ffa116;
                        color: #000;
                        border: none;
                        padding: 1.1rem 2.2rem;
                        font-size: 1.1rem;
                        font-weight: 700;
                        border-radius: 50px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.8rem;
                        transition: 0.25s;
                    }
                    .back-btn-theme:hover {
                        transform: translateY(-2px);
                        background: #ffbe4d;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="coffee-page-wrapper">
            <SEO title="Buy Me a Coffee | Leet-Vision" />
            
            <div className="coffee-layout-container">
                {/* Left side: branding/story */}
                <div className="coffee-info-pane">
                    <button className="back-nav-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back to solutions
                    </button>
                    
                    <div className="latte-image-container">
                        <img src="/latte-art.png" alt="Latte Art" className="latte-art-img" />
                    </div>

                    <div className="creator-tag">
                        <span className="heart-span">♥</span> SUPPORT THE CREATOR
                    </div>

                    <h1 className="pane-title">
                        Buy me a <br />
                        <span className="coffee-handwrite-wrapper">
                            <span className="coffee-handwrite">coffee</span>
                            {/* Sparks SVG */}
                            <svg className="coffee-sparks-svg" viewBox="0 0 24 24" width="36" height="36">
                                <path d="M 2 16 C 6 11 12 7 19 4" stroke="#ffa116" strokeWidth="3" strokeLinecap="round" fill="none" />
                                <path d="M 2 17 C 8 16 15 17 21 18" stroke="#ffa116" strokeWidth="3" strokeLinecap="round" fill="none" />
                                <path d="M 2 18 C 6 20 11 22 17 23" stroke="#ffa116" strokeWidth="3" strokeLinecap="round" fill="none" />
                            </svg>
                            {/* Underline SVG */}
                            <svg className="coffee-underline-svg" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M 3 5 Q 50 2 97 5 Q 50 9 3 5" fill="#ffa116" />
                            </svg>
                        </span>
                    </h1>

                    <div className="footer-copyright">
                        © 2026 Leet Vision · Built with ❤️ by Vishwesh
                    </div>
                </div>

                {/* Right side: Receipt bill */}
                <div className="coffee-bill-pane">
                    <div className="cafe-bill-card">
                        {/* Circle stamp */}
                        <div className="lights-stamp">
                            <span className="stamp-inner">
                                KEEP THE<br />LIGHTS<br />ON
                            </span>
                        </div>

                        {/* Bill Header */}
                        <div className="bill-header">
                            <div className="bill-logo">LEET VISION</div>
                            <div className="divider-dots"></div>
                        </div>

                        {/* Coffee cup graphic */}
                        <div className="coffee-illustration">
                            <div className="radial-waves"></div>
                            <img src="/coffee-cup.png" alt="Coffee Cup" className="cup-3d-img" />
                        </div>

                        {/* Receipt message */}
                        <div className="receipt-story">
                            "this took a lot of late nights and way too much coffee — if LeetVision helped you land your prep, buying me a coffee helps me keep building. thank you ❤️"
                        </div>

                        <div className="divider-dots"></div>

                        {/* Selector Header */}
                        <div className="selector-meta">
                            <h2>Buy me a coffee</h2>
                           
                        </div>

                        {/* Presets Grid */}
                        <div className="support-presets-grid">
                            {presets.map((preset) => (
                                <div
                                    key={preset.id}
                                    className={`preset-card ${selectedPreset === preset.id ? 'active' : ''}`}
                                    onClick={() => handlePresetSelect(preset)}
                                >
                                    {preset.badge && <span className="card-badge">{preset.badge}</span>}
                                    <div className="preset-price">₹{preset.price}</div>
                                    <div className="preset-meta-label">
                                        <span className="meta-emoji">{preset.emoji}</span> {preset.name}
                                    </div>
                                </div>
                            ))}

                            <div
                                className={`preset-card ${selectedPreset === 'custom' ? 'active' : ''}`}
                                onClick={handleCustomClick}
                            >
                                <div className="preset-price">Other</div>
                                <div className="preset-meta-label">Custom</div>
                            </div>
                        </div>

                        {/* Custom amount drawer */}
                        {selectedPreset === 'custom' && (
                            <div className="amount-input-box animated-slide-down">
                                <label>Write your own amount</label>
                                <div className="input-group-currency">
                                    <span className="prefix-currency">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Message box */}
                        <div className="message-box-section">
                            <div className="message-header">
                                <label>Add a message (optional)</label>
                                <span className="char-count">{message.length}/120</span>
                            </div>
                            <textarea
                                placeholder="Your words mean a lot! 💛"
                                maxLength={120}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        {error && <div className="bill-error">{error}</div>}

                        {/* Checkout CTA */}
                        <button
                            className="bill-pay-btn"
                            disabled={isPaying || amount <= 0}
                            onClick={handlePayment}
                        >
                            {isPaying ? (
                                <span className="spinner"></span>
                            ) : (
                                <>☕ Brew my support — ₹{amount}</>
                            )}
                        </button>

                        <div className="security-tag">
                            🔒 Secure checkout · Razorpay · No account needed
                        </div>

                        <div className="divider-dots" style={{ margin: '1.5rem 0 1rem' }}></div>

                        {/* Barcode */}
                        <div className="bill-barcode-wrapper">
                            <svg viewBox="0 0 100 20" width="80%" height="45" className="barcode-svg">
                                <rect x="0" y="0" width="1" height="20" fill="#222" />
                                <rect x="2" y="0" width="2" height="20" fill="#222" />
                                <rect x="5" y="0" width="1" height="20" fill="#222" />
                                <rect x="7" y="0" width="3" height="20" fill="#222" />
                                <rect x="11" y="0" width="1" height="20" fill="#222" />
                                <rect x="13" y="0" width="2" height="20" fill="#222" />
                                <rect x="16" y="0" width="1" height="20" fill="#222" />
                                <rect x="18" y="0" width="4" height="20" fill="#222" />
                                <rect x="23" y="0" width="1" height="20" fill="#222" />
                                <rect x="25" y="0" width="2" height="20" fill="#222" />
                                <rect x="28" y="0" width="1" height="20" fill="#222" />
                                <rect x="30" y="0" width="3" height="20" fill="#222" />
                                <rect x="34" y="0" width="1" height="20" fill="#222" />
                                <rect x="36" y="0" width="1" height="20" fill="#222" />
                                <rect x="38" y="0" width="2" height="20" fill="#222" />
                                <rect x="41" y="0" width="3" height="20" fill="#222" />
                                <rect x="45" y="0" width="1" height="20" fill="#222" />
                                <rect x="47" y="0" width="2" height="20" fill="#222" />
                                <rect x="50" y="0" width="1" height="20" fill="#222" />
                                <rect x="52" y="0" width="4" height="20" fill="#222" />
                                <rect x="57" y="0" width="1" height="20" fill="#222" />
                                <rect x="59" y="0" width="2" height="20" fill="#222" />
                                <rect x="62" y="0" width="1" height="20" fill="#222" />
                                <rect x="64" y="0" width="3" height="20" fill="#222" />
                                <rect x="68" y="0" width="1" height="20" fill="#222" />
                                <rect x="70" y="0" width="2" height="20" fill="#222" />
                                <rect x="73" y="0" width="1" height="20" fill="#222" />
                                <rect x="75" y="0" width="4" height="20" fill="#222" />
                                <rect x="80" y="0" width="1" height="20" fill="#222" />
                                <rect x="82" y="0" width="2" height="20" fill="#222" />
                                <rect x="85" y="0" width="1" height="20" fill="#222" />
                                <rect x="87" y="0" width="3" height="20" fill="#222" />
                                <rect x="91" y="0" width="1" height="20" fill="#222" />
                                <rect x="93" y="0" width="2" height="20" fill="#222" />
                                <rect x="96" y="0" width="1" height="20" fill="#222" />
                                <rect x="98" y="0" width="2" height="20" fill="#222" />
                            </svg>
                            <span className="barcode-caption">THANK YOU FOR SUPPORTING LEETVISION</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

                .coffee-page-wrapper {
                    background: #110d0a;
                    background-image: radial-gradient(circle at 10% 20%, rgba(30, 21, 15, 0.6) 0%, rgba(10, 8, 7, 0.95) 90%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 1.5rem 2rem; /* Reduced top/bottom padding to make top margin less */
                    box-sizing: border-box;
                    font-family: 'Outfit', sans-serif;
                    overflow-x: hidden;
                }
                .coffee-layout-container {
                    display: flex;
                    width: 80%; /* Takes around 80% of screen width */
                    max-width: 1350px;
                    gap: 3rem;
                    align-items: stretch; /* Stretch columns to match heights */
                    justify-content: space-between;
                }

                /* Left Pane - Branding & Story */
                .coffee-info-pane {
                    flex: 1;
                    max-width: 420px; /* Aligns left pane to the left-most side of the 80% span */
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    background: rgba(20, 16, 13, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 20px;
                    padding: 1.5rem 1.8rem; /* Reduced padding to decrease height */
                    box-sizing: border-box;
                    justify-content: space-evenly;
                    margin-top: 0;
                }
                .back-nav-btn {
                    align-self: flex-start;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #aaa;
                    padding: 0.5rem 1rem; /* Compact padding */
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: 0.2s;
                    margin-bottom: 1rem;
                }
                .back-nav-btn:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.15);
                }
                .latte-image-container {
                    width: 100px; /* Decreased size to reduce height */
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid #1c1510;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8);
                    margin-bottom: 1.2rem;
                    background: #000;
                }
                .latte-art-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .creator-tag {
                    color: #ffa116;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-bottom: 0.4rem;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .heart-span {
                    color: #ff4b2b;
                }
                .pane-title {
                    font-size: 2.6rem; /* Decreased size */
                    font-weight: 800;
                    line-height: 1.15;
                    letter-spacing: -0.03em;
                }
                .coffee-handwrite-wrapper {
                    position: relative;
                    display: inline-block;
                }
                .coffee-handwrite {
                    font-family: 'Kalam', cursive;
                    color: #ffa116;
                    font-weight: 700;
                    font-size: 3.2rem; /* Decreased size */
                    display: inline-block;
                    transform: rotate(-3deg) translateY(2px);
                }
                .coffee-sparks-svg {
                    position: absolute;
                    right: -32px; /* Adjusted sparks positioning */
                    top: -4px;
                    width: 28px;
                    height: 28px;
                }
                .coffee-underline-svg {
                    position: absolute;
                    left: 0;
                    bottom: -8px;
                    width: 100%;
                    height: 6px;
                }
                .pane-desc {
                    color: #aaa;
                    font-size: 1rem;
                    line-height: 1.6;
                    margin: 0 0 1.5rem 0;
                }
                .benefits-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem; /* Decreased gap to reduce height */
                }
                .benefits-list li {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }
                .list-icon {
                    background: rgba(255, 161, 22, 0.08);
                    border: 1px solid rgba(255, 161, 22, 0.15);
                    color: #ffa116;
                    width: 32px; /* Decreased icon box size */
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }
                .benefits-list h4 {
                    margin: 0 0 0.15rem 0;
                    color: #fff;
                    font-size: 0.95rem; /* Sized down h4 */
                    font-weight: 600;
                }
                .benefits-list p {
                    margin: 0;
                    color: #777;
                    font-size: 0.88rem;
                }
                .footer-copyright {
                    margin-top: 1.5rem; /* Decreased spacing */
                    color: #555;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                /* Right Pane - Receipt Card */
                .coffee-bill-pane {
                    flex-shrink: 0;
                    width: 62%; /* Increased width of bill card */
                    max-width: 760px;
                    display: flex;
                    flex-direction: column;
                }
                .cafe-bill-card {
                    background: #fdfbf7;
                    color: #222;
                    border-radius: 20px;
                    padding: 1.5rem 2rem; /* Reduced card padding to decrease height */
                    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
                    position: relative;
                    border: 1px solid rgba(255,255,255,0.05);
                    height: 100%;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                
                /* Circular stamp */
                .lights-stamp {
                    position: absolute;
                    top: 1.2rem; /* Adjusted positioning */
                    right: 1.5rem;
                    width: 50px; /* Reduced size to save space */
                    height: 50px;
                    border: 2px dashed rgba(255, 75, 43, 0.4);
                    border-radius: 50%;
                    color: #ff4b2b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: monospace;
                    font-size: 0.5rem; /* Sized down font */
                    font-weight: 900;
                    text-align: center;
                    transform: rotate(12deg);
                    opacity: 0.8;
                }
                .stamp-inner {
                    transform: rotate(-5deg);
                    line-height: 1.2;
                }

                .bill-header {
                    text-align: center;
                    margin-bottom: 0.8rem; /* Reduced space */
                }
                .bill-logo {
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 4px;
                    color: #777;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .divider-dots {
                    border-bottom: 2px dashed #ddd;
                    height: 1px;
                    width: 100%;
                    margin: 0.6rem 0; /* Reduced margins to save height */
                }

                /* Coffee cup box */
                .coffee-illustration {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 90px; /* Decreased height */
                    margin-bottom: 0.6rem;
                }
                .radial-waves {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: radial-gradient(circle, rgba(255, 161, 22, 0.08) 0%, rgba(255, 161, 22, 0) 70%);
                    border-radius: 50%;
                }
                .cup-3d-img {
                    height: 80px; /* Decreased height */
                    width: auto;
                    object-fit: contain;
                    z-index: 2;
                    filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
                }

                .receipt-story {
                    font-family: 'Kalam', cursive;
                    font-size: 0.95rem; /* Sized down font */
                    line-height: 1.5;
                    color: #5d4a3e;
                    text-align: center;
                    margin: 0.3rem 0;
                    padding: 0 0.5rem;
                }

                .selector-meta h2 {
                    font-size: 1.2rem; /* Sized down header */
                    font-weight: 800;
                    margin: 0 0 0.2rem 0;
                    color: #111;
                }
                .selector-meta p {
                    font-size: 0.85rem;
                    color: #777;
                    margin: 0 0 0.8rem 0; /* Reduced margin */
                }

                /* Preset Cards Grid */
                .support-presets-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr); /* Placed all options in a row */
                    gap: 0.6rem;
                    margin-bottom: 1.5rem;
                }
                .preset-card {
                    background: #f7f4eb;
                    border: 2px solid #e8e3d5;
                    border-radius: 12px;
                    padding: 0.8rem 0.2rem; /* Reduced padding for compact look */
                    cursor: pointer;
                    position: relative;
                    text-align: center;
                    transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .preset-card:hover {
                    border-color: #c7bea7;
                    transform: translateY(-1px);
                }
                .preset-card.active {
                    background: #fff;
                    border-color: #8c6239;
                    box-shadow: 0 4px 15px rgba(140, 98, 57, 0.15);
                }
                .card-badge {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%); /* Centered the tiny badge */
                    background: #8c6239;
                    color: #fff;
                    font-size: 0.5rem; /* Shrunk badge size */
                    font-weight: 700;
                    padding: 1px 5px;
                    border-radius: 50px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                }
                .preset-price {
                    font-size: 1.05rem; /* Slightly smaller font size */
                    font-weight: 800;
                    color: #111;
                    margin-bottom: 0.2rem;
                }
                .preset-meta-label {
                    font-size: 0.72rem; /* Sized down labels */
                    color: #666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.2rem;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .meta-emoji {
                    font-size: 0.9rem;
                }

                /* Inputs drawer */
                .amount-input-box {
                    background: #f4efe2;
                    border-radius: 12px;
                    padding: 1rem 1.2rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid #e3dbca;
                }
                .amount-input-box label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #555;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .input-group-currency {
                    position: relative;
                }
                .prefix-currency {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #333;
                }
                .input-group-currency input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid #8c6239;
                    padding: 0.4rem 0.4rem 0.4rem 1.2rem;
                    color: #111;
                    font-size: 1.3rem;
                    font-weight: 800;
                    outline: none;
                    box-sizing: border-box;
                    font-family: inherit;
                }

                /* Textarea for message */
                .message-box-section {
                    margin-bottom: 0.8rem; /* Reduced space */
                }
                .message-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #666;
                    margin-bottom: 0.4rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .message-box-section textarea {
                    width: 100%;
                    height: 48px; /* Reduced textarea height to save spacing */
                    background: #f6f2e8;
                    border: 1px solid #e1dac9;
                    border-radius: 10px;
                    padding: 0.6rem;
                    color: #222;
                    font-size: 0.9rem;
                    outline: none;
                    resize: none;
                    font-family: inherit;
                    box-sizing: border-box;
                    transition: 0.2s;
                }
                .message-box-section textarea:focus {
                    background: #fff;
                    border-color: #8c6239;
                }

                .bill-error {
                    background: #ffebee;
                    border: 1px solid #ffcdd2;
                    color: #c62828;
                    padding: 0.6rem;
                    border-radius: 8px;
                    margin-bottom: 0.8rem;
                    font-size: 0.85rem;
                    text-align: center;
                    font-weight: 500;
                }

                /* Checkout CTA */
                .bill-pay-btn {
                    width: 100%;
                    background: #8c6239;
                    color: #fff;
                    border: none;
                    padding: 0.85rem; /* Reduced button vertical padding */
                    border-radius: 12px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bill-pay-btn:hover {
                    background: #6f4c2a;
                    box-shadow: 0 5px 15px rgba(111, 76, 42, 0.3);
                }
                .bill-pay-btn:disabled {
                    background: #ccc;
                    color: #888;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .security-tag {
                    font-size: 0.72rem;
                    color: #888;
                    text-align: center;
                    margin-top: 0.6rem;
                    font-weight: 500;
                }

                /* Barcode */
                .bill-barcode-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 0.4rem;
                }
                .barcode-svg {
                    opacity: 0.85;
                }
                .barcode-caption {
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: #777;
                    letter-spacing: 2.2px;
                    margin-top: 0.3rem;
                }

                /* Animation definitions */
                .animated-slide-down {
                    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Spinner */
                .spinner {
                    width: 22px;
                    height: 22px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Responsive design */
                @media (max-width: 768px) { /* Changed query threshold from 1024px to 768px for laptop-like layouts on wider views */
                    .coffee-layout-container {
                        flex-direction: column;
                        gap: 3rem;
                        align-items: center;
                    }
                    .coffee-info-pane {
                        max-width: 600px;
                        text-align: center;
                        align-items: center;
                        height: auto;
                    }
                    .back-nav-btn {
                        align-self: center;
                    }
                    .benefits-list {
                        align-items: flex-start;
                        text-align: left;
                        max-width: 450px;
                    }
                    .coffee-bill-pane {
                        width: 100%;
                        max-width: 560px;
                    }
                }
                
                @media (max-width: 480px) {
                    .coffee-page-wrapper {
                        padding: 2rem 1rem;
                    }
                    .cafe-bill-card {
                        padding: 1.5rem;
                    }
                    .support-presets-grid {
                        grid-template-columns: 1fr;
                    }
                    .pane-title {
                        font-size: 2.5rem;
                    }
                    .coffee-handwrite {
                        font-size: 3rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BuyMeACoffeePage;
