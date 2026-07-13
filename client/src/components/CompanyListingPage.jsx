import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';
import { FaSearch, FaBuilding, FaCode, FaBolt, FaCrown, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { companyDomains } from '../data/companyDomains';
import SkeletonLoader from './SkeletonLoader';

const CompanyListingPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const isBundleOwned = user?.ownedCompanies?.length > 10; // Simple heuristic for bundle
    const ownedSet = new Set(user?.ownedCompanies || []);

    // Helper to get logo URL (Using Google Favicon Service as it's less likely to be blocked)
    const getLogoUrl = (companyName) => {
        const domain = companyDomains[companyName];
        if (domain) {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            return `${API_BASE}/api/logo/${domain}`;
        }
        return null;
    };

    const handleBundleUnlock = async () => {
        if (!user) {
            navigate('/login?redirect=/companies');
            return;
        }
        navigate('/checkout?type=bundle');
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const response = await axios.get(`${API_BASE}/api/companies`);
                setCompanies(response.data);
            } catch (err) {
                console.error("Error fetching companies:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="company-listing-container">
            <SEO
                title="Company-Wise LeetCode Questions - LeetVision"
                description="Browse LeetCode questions asked in interviews at over 400 top tech companies including Google, Amazon, Meta, and more."
                path="/companies"
            />

            <div className="listing-header">
                <div className="premium-badge"><FaCrown /> Official Interview Partner</div>
                <h1>Company <span>Interview</span> Questions</h1>
                <p>Curated list of questions reported by the community for 470+ companies.</p>

                {/* Purchase/Bundle UI removed for production */}

                <div className="search-box-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search company (e.g. Google, Atlassian...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ paddingTop: '20px' }}>
                    <SkeletonLoader 
                        variant="card" 
                        count={12} 
                        itemStyle={{ height: '200px', borderRadius: '16px', background: '#111', border: '1px solid #1a1a1a' }} 
                    />
                </div>
            ) : (
                <div className="companies-grid">
                    {filteredCompanies.map((company) => {
                        const logo = getLogoUrl(company.name);
                        const isOwned = ownedSet.has(company.name);
                        return (
                            <div
                                key={company.name}
                                className={`company-card ${isOwned ? 'owned-card' : ''}`}
                                onClick={() => navigate(`/company-questions/${encodeURIComponent(company.name)}`)}
                            >
                                {isOwned && <div className="owned-indicator"><FaCheckCircle /> Unlocked</div>}
                                <div className="company-info">
                                    <div className="company-logo-type">
                                        {logo ? (
                                            <img
                                                src={logo}
                                                alt={company.name}
                                                className="company-logo-img"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="fallback-icon" style={{ display: logo ? 'none' : 'flex' }}>
                                            <FaBuilding />
                                        </div>
                                    </div>
                                    <div className="company-details">
                                        <h3>{company.name}</h3>
                                        <p><FaCode /> {company.count} Questions</p>
                                    </div>
                                </div>
                                <div className="card-arrow">→</div>
                            </div>
                        );
                    })}
                    {filteredCompanies.length === 0 && !loading && (
                        <div className="no-results">
                            <p>No companies found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .company-listing-container {
                    padding: 8rem 5% 4rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    min-height: 100vh;
                }

                .listing-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .listing-header h1 {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    margin-bottom: 1rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                }

                .listing-header h1 span {
                    color: var(--accent-orange);
                    position: relative;
                }

                .listing-header p {
                    color: #888;
                    font-size: 1.2rem;
                    max-width: 600px;
                    margin: 0 auto 1.5rem;
                }

                .premium-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(245, 124, 0, 0.1);
                    color: var(--accent-orange);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(245, 124, 0, 0.2);
                }

                .bundle-promo {
                    background: linear-gradient(90deg, rgba(245, 124, 0, 0.15) 0%, rgba(20, 20, 20, 0.8) 100%);
                    border: 1px solid var(--accent-orange);
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    text-align: left;
                    backdrop-filter: blur(10px);
                }

                .promo-text h3 {
                    margin: 0 0 0.5rem 0;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .promo-text p {
                    margin: 0;
                    font-size: 1rem;
                    color: #aaa;
                }

                .promo-btn {
                    background: var(--accent-orange);
                    color: white;
                    border: none;
                    padding: 0.8rem 2rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    flex-shrink: 0;
                }

                .promo-btn:hover { background: #ff9800; transform: scale(1.05); }

                .owned-card { border-color: rgba(0, 184, 163, 0.3); }

                .owned-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 0.7rem;
                    background: rgba(0, 184, 163, 0.1);
                    color: #00b8a3;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .search-box-container {
                    position: relative;
                    max-width: 600px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    padding: 0.5rem 1.5rem;
                    display: flex;
                    align-items: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                }

                .search-box-container:focus-within {
                    border-color: var(--accent-orange);
                    box-shadow: 0 0 30px rgba(245, 124, 0, 0.15);
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateY(-2px);
                }

                .search-icon {
                    color: #555;
                    margin-right: 1rem;
                    font-size: 1.2rem;
                }

                .search-box-container input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    padding: 0.8rem 0;
                    font-size: 1.1rem;
                    outline: none;
                }

                .companies-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .company-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .company-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--accent-orange);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .company-info {
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                }

                .company-logo-type {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-orange);
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .company-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 6px;
                    background: white;
                }

                .company-card:hover .company-logo-type {
                    border-color: var(--accent-orange);
                }

                .company-details h3 {
                    margin: 0 0 0.3rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #fff;
                }

                .company-details p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #888;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .card-arrow {
                    color: #333;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                }

                .company-card:hover .card-arrow {
                    color: var(--accent-orange);
                    transform: translateX(5px);
                }

                .no-results {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem;
                    color: #666;
                    font-size: 1.2rem;
                }

                @media (max-width: 768px) {
                    .company-listing-container {
                        padding-top: 6rem;
                    }
                    .companies-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default CompanyListingPage;
