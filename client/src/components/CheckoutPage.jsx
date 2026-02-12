import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import { FaBolt, FaCheckCircle, FaShieldAlt, FaRocket, FaBuilding, FaArrowLeft, FaCrown } from 'react-icons/fa';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshUser, loading: authLoading } = useAuth();

    const type = searchParams.get('type') || 'single';
    const company = searchParams.get('company') || '';

    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState('');

    const PRICES = {
        single: 50,
        bundle: 300,
        monthly_sub: 50,
        yearly_sub: 500
    };
    const price = PRICES[type] || 50;

    const isSubscription = type.includes('_sub');

    // ... (BUNDLE_COMPANIES remains same)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
        }
    }, [user, authLoading, navigate]);

    const handlePayment = async () => {
        setIsPaying(true);
        setError('');
        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const orderRes = await axios.post(`${API_BASE}/api/payment/create-order`, {
                type,
                company: type === 'single' ? company : undefined
            }, { withCredentials: true });

            const { orderId, amount, keyId, currency } = orderRes.data.data;

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "LeetVision Premium",
                description: isSubscription
                    ? (type === 'monthly_sub' ? "Monthly Pro Subscription" : "Yearly Pro Subscription")
                    : (type === 'bundle' ? "Unlock Top 100 Companies Bundle" : `Unlock ${company} Questions`),
                order_id: orderId,
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(`${API_BASE}/api/payment/verify`, {
                            ...response,
                            type,
                            company: type === 'single' ? company : undefined
                        }, { withCredentials: true });

                        if (verifyRes.data.status === 'success') {
                            await refreshUser();

                            // Redirect based on purchase type
                            if (isSubscription) {
                                navigate('/explore', {
                                    state: { message: 'Subscription activated! Enjoy full access.' }
                                });
                            } else {
                                navigate('/company-questions/' + encodeURIComponent(company || 'Amazon'), {
                                    state: { message: 'Unlocked successfully!' }
                                });
                            }
                        }
                    } catch (err) {
                        setError("Verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.name || "User",
                    email: user?.email || ""
                },
                theme: { color: "#f57c00" },
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

    if (authLoading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="checkout-container">
            <SEO title="Checkout | LeetVision Premium" />

            <div className="checkout-content">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                <div className="checkout-grid">
                    <div className="order-summary-section">
                        <h2>Order Summary</h2>
                        <div className="plan-card active">
                            <div className="plan-info">
                                <div className="plan-icon">
                                    {isSubscription ? <FaBolt /> : (type === 'bundle' ? <FaCrown /> : <FaBuilding />)}
                                </div>
                                <div className="plan-text">
                                    <h3>
                                        {type === 'monthly_sub' ? 'Monthly Pro Subscription' :
                                            type === 'yearly_sub' ? 'Yearly Pro Subscription' :
                                                type === 'bundle' ? 'Top 100 Companies Bundle' :
                                                    `${company} Questions Unlock`}
                                    </h3>
                                    <p>
                                        {isSubscription ? 'Full access to all platform and company-wise interview questions.' :
                                            type === 'bundle' ? 'Lifetime access to interview questions from 100 top tech companies' :
                                                `Get lifetime access to all ${company} specific interview questions.`}
                                    </p>
                                </div>
                                <div className="plan-price">₹{price}</div>
                            </div>

                            <ul className="plan-features">
                                <li><FaCheckCircle /> {isSubscription ? 'Full Library Access' : 'Lifetime Validity'}</li>
                                <li><FaCheckCircle /> 100% Questions Unlocked</li>
                                <li><FaCheckCircle /> Access to Verified Solutions</li>
                                <li><FaCheckCircle /> Priority Customer Support</li>
                            </ul>
                        </div>

                        {type === 'bundle' && (
                            <div className="bundle-details">
                                <h4>Included Top Companies ({BUNDLE_COMPANIES.length})</h4>
                                <div className="companies-chip-grid">
                                    {BUNDLE_COMPANIES.map(c => (
                                        <span key={c} className="company-chip">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="payment-section">
                        <div className="payment-card">
                            <h3>Complete Purchase</h3>
                            <div className="price-breakdown">
                                <div className="price-row">
                                    <span>Plan Amount</span>
                                    <span>₹{price}.00</span>
                                </div>
                                <div className="price-row">
                                    <span>GST (Included)</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="price-row total">
                                    <span>Total Payable</span>
                                    <span>₹{price}.00</span>
                                </div>
                            </div>

                            {error && <div className="error-box">{error}</div>}

                            <button
                                className="pay-now-btn"
                                onClick={handlePayment}
                                disabled={isPaying}
                            >
                                {isPaying ? 'Processing...' : `Pay ₹${price} via Razorpay`}
                            </button>

                            <div className="secure-badges">
                                <span><FaShieldAlt /> Secure SSL Encryption</span>
                                <span><FaShieldAlt /> Razorpay Trusted Gateway</span>
                            </div>
                        </div>

                        <div className="trust-points">
                            <div className="trust-item">
                                <FaRocket />
                                <div>
                                    <h5>Instant Activation</h5>
                                    <p>Your content will be unlocked immediately after payment.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-container {
                    padding: 8rem 5% 4rem;
                    min-height: 100vh;
                    background: #050505;
                    color: white;
                }

                .checkout-content {
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: #888;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 2rem;
                    transition: color 0.3s;
                }

                .back-btn:hover { color: white; }

                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 3rem;
                }

                .order-summary-section h2 {
                    font-size: 2rem;
                    margin-bottom: 2rem;
                }

                .plan-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 152, 0, 0.3);
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .plan-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 1.5rem;
                }

                .plan-icon {
                    font-size: 2.5rem;
                    color: var(--accent-orange);
                    background: rgba(245, 124, 0, 0.1);
                    padding: 1rem;
                    border-radius: 12px;
                }

                .plan-text h3 {
                    font-size: 1.5rem;
                    margin: 0 0 0.5rem 0;
                }

                .plan-text p {
                    color: #888;
                    margin: 0;
                    line-height: 1.5;
                }

                .plan-price {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-left: auto;
                    color: var(--accent-orange);
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .plan-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #bbb;
                }

                .plan-features svg {
                    color: #4caf50;
                }

                .bundle-details h4 {
                    margin-bottom: 1.5rem;
                    color: #fff;
                }

                .companies-chip-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.8rem;
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 1rem;
                }
                
                .companies-chip-grid::-webkit-scrollbar {
                    width: 4px;
                }
                .companies-chip-grid::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }

                .company-chip {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.4rem 1rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    color: #ccc;
                }

                .payment-card {
                    background: #111;
                    border: 1px solid #222;
                    border-radius: 24px;
                    padding: 2.5rem;
                    position: sticky;
                    top: 100px;
                }

                .payment-card h3 {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .price-breakdown {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .price-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    color: #888;
                }

                .price-row.total {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed #333;
                    color: white;
                    font-weight: 700;
                    font-size: 1.2rem;
                }

                .pay-now-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
                    color: white;
                    border: none;
                    padding: 1.2rem;
                    border-radius: 14px;
                    font-size: 1.1rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(245, 124, 0, 0.2);
                    margin-bottom: 2rem;
                }

                .pay-now-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(245, 124, 0, 0.4);
                }
                
                .pay-now-btn:disabled { opacity: 0.6; cursor: wait; }

                .secure-badges {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.8rem;
                    color: #555;
                    font-size: 0.85rem;
                }

                .secure-badges span {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .trust-points {
                    margin-top: 3rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .trust-item {
                    display: flex;
                    gap: 1.2rem;
                    align-items: center;
                }

                .trust-item svg {
                    font-size: 1.5rem;
                    color: var(--accent-orange);
                    opacity: 0.7;
                }

                .trust-item h5 { margin: 0 0 0.3rem 0; font-size: 1rem; color: #ddd; }
                .trust-item p { margin: 0; color: #777; font-size: 0.85rem; }

                .error-box {
                    background: rgba(255, 68, 68, 0.1);
                    color: #ff4444;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    text-align: center;
                }

                @media (max-width: 900px) {
                    .checkout-grid { grid-template-columns: 1fr; }
                    .checkout-container { padding-top: 6rem; }
                    .payment-card { position: static; }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;
