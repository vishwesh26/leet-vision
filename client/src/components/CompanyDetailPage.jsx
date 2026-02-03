import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from './SEO';
import { FaExternalLinkAlt, FaPlay, FaBolt, FaSearch, FaFilter, FaBuilding } from 'react-icons/fa';
import { useSolved } from '../context/SolvedContext';
import { useAuth } from '../context/AuthContext';
import { companyDomains } from '../data/companyDomains';

const CompanyDetailPage = () => {
    const { companyName } = useParams();
    const navigate = useNavigate();
    const { isProblemSolved } = useSolved();
    const { user, refreshUser } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [hasAccess, setHasAccess] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Filters
    const [difficulty, setDifficulty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('frequency');

    // Helper to get logo URL (Using Google Favicon Service as it's less likely to be blocked)
    const getLogoUrl = (name) => {
        const domain = companyDomains[name];
        if (domain) {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            return `${API_BASE}/api/logo/${domain}`;
        }
        return null;
    };

    const logo = getLogoUrl(companyName);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const params = {
                page,
                limit: 50,
                sort: sortBy,
                order: 'desc'
            };
            if (difficulty) params.difficulty = difficulty;
            if (searchTerm) params.search = searchTerm;

            const response = await axios.get(`${API_BASE}/api/company/${encodeURIComponent(companyName)}/questions`, { params, withCredentials: true });

            // Client-side override for access if backend check fails 
            // but user object says we own it
            const isOwnedLocally = user?.ownedCompanies?.includes(companyName) || user?.ownedCompanies?.length > 10;

            setQuestions(response.data.questions);
            setTotal(response.data.total);
            setPages(response.data.pages);
            setHasAccess(response.data.hasAccess || isOwnedLocally);
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [companyName, page, difficulty, sortBy, user]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchQuestions();
    };

    const getDifficultyColor = (diff) => {
        switch (diff.toLowerCase()) {
            case 'easy': return '#00b8a3';
            case 'medium': return '#ffc01e';
            case 'hard': return '#ff375f';
            default: return '#888';
        }
    };

    const handleUnlock = async (planType = 'single') => {
        navigate(`/checkout?type=${planType}&company=${encodeURIComponent(companyName)}`);
    };

    return (
        <div className="company-detail-container">
            <SEO
                title={`${companyName} LeetCode Questions - LeetVision`}
                description={`Top LeetCode questions asked in ${companyName} interviews. Sorted by frequency and difficulty.`}
                path={`/company/${companyName}`}
            />

            <div className="detail-header">
                <div className="breadcrumb">
                    <Link to="/companies">Companies</Link> / <span>{companyName}</span>
                </div>
                <div className="header-main">
                    <div className="header-logo">
                        {logo ? (
                            <img
                                src={logo}
                                alt={companyName}
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
                    <div className="header-text">
                        <h1>{companyName} <span>Questions</span></h1>
                        <p>Found {total} questions historically asked at {companyName}.</p>
                    </div>
                </div>
            </div>

            <div className="stats-strip">
                <div className="stat-item">
                    <span className="stat-value">{total}</span>
                    <span className="stat-label">Total Problems</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{questions.filter(q => q.difficulty === 'Easy').length}+</span>
                    <span className="stat-label">Easy</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{questions.filter(q => q.difficulty === 'Medium').length}+</span>
                    <span className="stat-label">Medium</span>
                </div>
            </div>

            <div className="controls-bar">
                <form className="search-mini" onSubmit={handleSearch}>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>

                <div className="filters-group">
                    {!hasAccess && (
                        <button
                            className="unlock-banner-btn"
                            onClick={() => handleUnlock('single')}
                            disabled={isPaying}
                        >
                            <FaBolt /> {isPaying ? 'Processing...' : `Unlock Lifetime Access (₹50)`}
                        </button>
                    )}

                    <div className="filter-select">
                        <FaFilter />
                        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}>
                            <option value="">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div className="filter-select">
                        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                            <option value="frequency">Most Frequent</option>
                            <option value="acceptanceRate">High Acceptance</option>
                            <option value="title">Alphabetical</option>
                        </select>
                    </div>
                </div>
            </div>

            {!hasAccess && (
                <div className="premium-upsell-card">
                    <div className="upsell-content">
                        <h3>Unlock <span>{companyName}</span> Interview Questions</h3>
                        <p>Get lifetime access to the full list of {total} questions, priority sorting, and AI optimized solutions.</p>
                        <div className="upsell-actions">
                            <button className="primary-btn" onClick={() => handleUnlock('single')}>
                                Unlock <b>{companyName}</b> only - ₹50
                            </button>
                            <button className="secondary-btn" onClick={() => handleUnlock('bundle')}>
                                Unlock <b>Top 100 Companies</b> Bundle - ₹300
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Fetching curated questions...</p>
                </div>
            ) : (
                <div className="questions-table-wrapper">
                    <table className="questions-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Title</th>
                                <th>Difficulty</th>
                                <th>Frequency</th>
                                <th>Acceptance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q) => {
                                const solved = isProblemSolved({ id: q.questionId });
                                const locked = q.isLocked;
                                return (
                                    <tr key={q._id} className={`${solved ? 'solved-row' : ''} ${locked ? 'locked-row' : ''}`}>
                                        <td className="status-cell">
                                            {locked ? (
                                                <span className="lock-icon" title="Unlock for full access">🔒</span>
                                            ) : (
                                                solved ? <span className="solved-badge">Done</span> : <span className="todo-dot"></span>
                                            )}
                                        </td>
                                        <td className="title-cell">
                                            <div className="q-title-wrap">
                                                <span className="q-title">
                                                    {q.questionId}. {locked ? '••••••••••••••••' : q.title}
                                                </span>
                                                <div className="q-topics">
                                                    {(locked ? ['Binary Search', 'Dynamic Programming', 'Graph'] : q.topics).slice(0, 3).map(t => (
                                                        <span key={t} className="topic-tag">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="diff-cell">
                                            <span style={{ color: locked ? '#333' : getDifficultyColor(q.difficulty) }}>{q.difficulty}</span>
                                        </td>
                                        <td className="freq-cell">
                                            <div className="freq-bar-container">
                                                <div className="freq-bar" style={{ width: `${locked ? (Math.random() * 40 + 20) : q.frequency}%`, opacity: locked ? 0.2 : 1 }}></div>
                                            </div>
                                        </td>
                                        <td className="acc-cell">
                                            {locked ? '--' : `${q.acceptanceRate.toFixed(1)}%`}
                                        </td>
                                        <td className="actions-cell">
                                            {locked ? (
                                                <button className="unlock-inline-btn" onClick={() => handleUnlock('single')}>Unlock Now</button>
                                            ) : (
                                                <div className="action-btns">
                                                    <a href={q.leetcodeUrl} target="_blank" rel="noreferrer" title="LeetCode" className="btn-icon">
                                                        <FaExternalLinkAlt />
                                                    </a>
                                                    <Link to={`/search/${q.questionId}`} title="Video Solution" className="btn-icon">
                                                        <FaPlay />
                                                    </Link>
                                                    <Link to={`/solution/${q.questionId}`} title="AI Solution" className="btn-pill">
                                                        <FaBolt /> Solution
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {questions.length === 0 && (
                        <div className="no-questions">
                            <p>No questions found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}

            {pages > 1 && (
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                    <span>Page {page} of {pages}</span>
                    <button disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
            )}

            <style>{`
                .company-detail-container {
                    padding: 8rem 5% 4rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    min-height: 100vh;
                }

                .breadcrumb {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .breadcrumb a {
                    color: var(--accent-orange);
                    text-decoration: none;
                }

                .detail-header h1 {
                    font-size: 3rem;
                    margin: 0 0 0.5rem 0;
                    font-weight: 800;
                }

                .detail-header h1 span {
                    color: var(--accent-orange);
                }

                .detail-header p {
                    color: #888;
                    font-size: 1.1rem;
                }

                .header-main {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .header-logo {
                    width: 72px;
                    height: 72px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    flex-shrink: 0;
                }

                .header-logo .company-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 8px;
                    background: white;
                }

                .header-logo .fallback-icon {
                    font-size: 2rem;
                    color: var(--accent-orange);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stats-strip {
                    display: flex;
                    gap: 3rem;
                    margin-bottom: 3rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .controls-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .search-mini {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 0 1.2rem;
                    color: #555;
                }

                .search-mini input {
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 1rem 0;
                    outline: none;
                    width: 100%;
                }

                .filters-group {
                    display: flex;
                    gap: 1rem;
                }

                .filter-select {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 0 1rem;
                    color: #555;
                }

                .filter-select select {
                    background: transparent;
                    border: none;
                    color: #ccc;
                    padding: 1rem 0;
                    outline: none;
                    cursor: pointer;
                }

                .questions-table-wrapper {
                    background: rgba(20, 20, 20, 0.6);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                }

                .questions-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .questions-table th {
                    padding: 1.5rem;
                    font-size: 0.85rem;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .questions-table td {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }

                .solved-row {
                    background: rgba(0, 184, 163, 0.02);
                }

                .status-cell {
                    width: 60px;
                }

                .solved-badge {
                    background: rgba(0, 184, 163, 0.1);
                    color: #00b8a3;
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .todo-dot {
                    width: 8px;
                    height: 8px;
                    background: #333;
                    border-radius: 50%;
                    display: block;
                }

                .q-title {
                    font-weight: 600;
                    display: block;
                    margin-bottom: 0.4rem;
                }

                .q-topics {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .topic-tag {
                    font-size: 0.7rem;
                    background: rgba(255, 255, 255, 0.03);
                    color: #666;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }

                .freq-bar-container {
                    width: 100px;
                    height: 6px;
                    background: #222;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .freq-bar {
                    height: 100%;
                    background: var(--accent-orange);
                    box-shadow: 0 0 10px rgba(245, 124, 0, 0.3);
                }

                .action-btns {
                    display: flex;
                    gap: 0.8rem;
                    align-items: center;
                }

                .btn-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    color: #888;
                    transition: all 0.2s;
                }

                .btn-icon:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    transform: scale(1.05);
                }

                .btn-pill {
                    background: var(--accent-orange);
                    color: white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }

                .btn-pill:hover {
                    opacity: 0.9;
                    transform: scale(1.02);
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 2rem;
                    margin-top: 3rem;
                    color: #666;
                }

                .pagination button {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pagination button:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                }

                .pagination button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .no-questions {
                    padding: 5rem;
                    text-align: center;
                    color: #555;
                }

                .loader-container {
                    text-align: center;
                    padding: 5rem 0;
                    color: #888;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: var(--accent-orange);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .unlock-banner-btn {
                    background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(245, 124, 0, 0.2);
                }

                .unlock-banner-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(245, 124, 0, 0.4);
                }

                .premium-upsell-card {
                    margin-bottom: 2rem;
                    background: linear-gradient(135deg, rgba(245, 124, 0, 0.1) 0%, rgba(20, 20, 20, 0.8) 100%);
                    border: 1px dashed var(--accent-orange);
                    padding: 2.5rem;
                    border-radius: 20px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }

                .upsell-content h3 {
                    font-size: 1.8rem;
                    margin-bottom: 0.8rem;
                }

                .upsell-content h3 span {
                    color: var(--accent-orange);
                }

                .upsell-content p {
                    color: #aaa;
                    margin-bottom: 2rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .upsell-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .primary-btn {
                    background: var(--accent-orange);
                    color: white;
                    border: none;
                    padding: 1rem 2.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .secondary-btn {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1rem 2.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .primary-btn:hover { background: #ff9800; transform: scale(1.02); }
                .secondary-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.02); }

                .locked-row {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .locked-row td {
                    filter: blur(5px);
                    transition: filter 0.3s;
                }

                .locked-row .status-cell, 
                .locked-row .actions-cell {
                    filter: none !important;
                    opacity: 1 !important;
                }

                .lock-icon {
                    font-size: 1.2rem;
                    color: #555;
                }

                .unlock-inline-btn {
                    background: transparent;
                    border: 1px solid var(--accent-orange);
                    color: var(--accent-orange);
                    padding: 0.4rem 1rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .unlock-inline-btn:hover {
                    background: var(--accent-orange);
                    color: white;
                }

                @media (max-width: 992px) {
                    .controls-bar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .questions-table th:nth-child(4),
                    .questions-table td:nth-child(4),
                    .questions-table th:nth-child(5),
                    .questions-table td:nth-child(5) {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default CompanyDetailPage;
