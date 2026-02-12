import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from './SEO';
import { FaCheckCircle, FaCrown, FaBolt, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const PricingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const plans = [
        {
            id: 'monthly_sub',
            name: 'Monthly Elite',
            price: '50',
            period: '/ month',
            description: 'Fast-track your interview prep with full power.',
            features: [
                'All Company Questions',
                'All Platform Access',
                'Verified AI Solutions',
                'Priority Support',
                'Ad-free Prep'
            ],
            icon: <FaBolt />,
            highlight: false
        },
        {
            id: 'yearly_sub',
            name: 'Yearly Legend',
            price: '500',
            period: '/ year',
            description: 'Ultimate value for the boldest developers.',
            features: [
                'Everything in Monthly',
                'Save ₹100 (2 Months free)',
                'Permanent History',
                'Early Beta Access',
                'Priority Processing'
            ],
            icon: <FaCrown />,
            highlight: true,
            saving: 'Best Value'
        }
    ];

    const handleSelectPlan = (planId) => {
        if (!user) {
            navigate(`/login?redirect=/pricing`);
            return;
        }
        navigate(`/checkout?type=${planId}`);
    };

    return (
        <div className="pricing-v2">
            <SEO
                title="Pricing | LeetVision Premium"
                description="Choose the elite plan for your coding interview preparation. Monthly and Yearly subscriptions available."
            />

            {/* Cinematic Backgrounds */}
            <div className="grid-bg" style={{ position: 'fixed', inset: 0, zIndex: 0 }}></div>
            <div className="hero-glow" style={{ top: '10%', left: '10%', opacity: 0.1 }}></div>
            <div className="hero-glow" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(100, 100, 255, 0.05) 0%, transparent 70%)', opacity: 0.1 }}></div>

            <section className="pricing-content" style={{ position: 'relative', zIndex: 1 }}>
                <div className="pricing-header-v2">
                    <h1 className="text-editorial">
                        ELEVATE YOUR <br />
                        <span className="shimmer" style={{ color: 'var(--accent-orange)' }}>VISION</span>
                    </h1>
                    <p className="subtitle">High-stakes preparation for top-tier companies.</p>
                </div>

                <div className="plans-grid-v2">
                    {plans.map((plan) => {
                        const isActive = user?.subscriptionType === plan.id.split('_')[0] && user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

                        return (
                            <div key={plan.id} className={`glass-card-3d pricing-card ${plan.highlight ? 'highlight' : ''} ${isActive ? 'active' : ''}`}>
                                {plan.highlight && !isActive && <div className="card-badge">{plan.saving}</div>}
                                {isActive && <div className="card-badge active">Current Plan</div>}

                                <div className="card-inner">
                                    <div className="plan-icon-v2">{plan.icon}</div>
                                    <h3 className="plan-name-v2">{plan.name}</h3>

                                    <div className="price-tag-v2">
                                        <span className="currency">₹</span>
                                        <span className="amount">{plan.price}</span>
                                        <span className="period">{plan.period}</span>
                                    </div>

                                    <p className="plan-desc-v2">{plan.description}</p>

                                    <ul className="features-list-v2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index}>
                                                <FaCheckCircle className="check-icon" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        className={`premium-button pricing-btn ${isActive ? 'active-btn' : ''}`}
                                        onClick={() => !isActive && handleSelectPlan(plan.id)}
                                        disabled={isActive}
                                    >
                                        {isActive ? 'Active Plan' : `GO ${plan.name.split(' ')[1]}`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="trust-section-v2">
                    <div className="badge-grid">
                        <div className="badge-v2">
                            <FaShieldAlt /> <span>Secure Payments</span>
                        </div>
                        <div className="badge-v2">
                            <FaRocket /> <span>Instant Access</span>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .pricing-v2 {
                    min-height: 100vh;
                    padding: 1rem 2rem 5rem;
                    background: #000;
                    color: white;
                    overflow: hidden;
                    position: relative;
                }

                .pricing-header-v2 {
                    text-align: center;
                    margin-bottom: 6rem;
                }

                .pricing-header-v2 h1 {
                    font-size: clamp(3rem, 8vw, 6rem);
                    font-weight: 800;
                    line-height: 0.85;
                    margin-bottom: 2rem;
                }

                .pricing-header-v2 .subtitle {
                    color: #888;
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    max-width: 600px;
                    margin: 0 auto;
                    font-weight: 600;
                }

                .plans-grid-v2 {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 400px));
                    gap: 3rem;
                    justify-content: center;
                    margin-bottom: 6rem;
                }

                .pricing-card {
                    padding: 2rem 2.5rem;
                    border-radius: 32px;
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .pricing-card.highlight::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 32px;
                    padding: 1px;
                    background: linear-gradient(180deg, var(--accent-orange), transparent);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }

                .card-badge {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--accent-orange);
                    color: black;
                    padding: 0.5rem 1.5rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    z-index: 10;
                    box-shadow: 0 10px 20px rgba(245, 124, 0, 0.3);
                }

                .card-badge.active {
                    background: #4caf50;
                    box-shadow: 0 10px 20px rgba(76, 175, 80, 0.3);
                }

                .plan-icon-v2 {
                    font-size: 2rem;
                    color: var(--accent-orange);
                    margin-bottom: 1rem;
                    opacity: 0.8;
                }

                .plan-name-v2 {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    letter-spacing: -1px;
                }

                .price-tag-v2 {
                    display: flex;
                    align-items: baseline;
                    gap: 0.2rem;
                    margin-bottom: 1rem;
                }

                .price-tag-v2 .currency {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #555;
                }

                .price-tag-v2 .amount {
                    font-size: 3.5rem;
                    font-weight: 900;
                    line-height: 1;
                }

                .price-tag-v2 .period {
                    color: #555;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .plan-desc-v2 {
                    color: #888;
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                    min-height: auto;
                    font-size: 0.95rem;
                }

                .features-list-v2 {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 2rem 0;
                }

                .features-list-v2 li {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.2rem;
                    color: #ccc;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .check-icon {
                    color: var(--accent-orange);
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .pricing-btn {
                    width: 100%;
                }

                .active-btn {
                    background: #4caf50 !important;
                    color: white !important;
                    opacity: 0.7;
                    cursor: default;
                }

                .trust-section-v2 {
                    text-align: center;
                    margin-top: 4rem;
                }

                .badge-grid {
                    display: flex;
                    justify-content: center;
                    gap: 4rem;
                    opacity: 0.5;
                }

                .badge-v2 {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                @media (max-width: 768px) {
                    .pricing-header-v2 h1 { font-size: 3.5rem; }
                    .plans-grid-v2 { grid-template-columns: 1fr; }
                    .pricing-v2 { padding: 8rem 1.5rem 5rem; }
                }
            `}</style>
        </div>
    );
};

export default PricingPage;
