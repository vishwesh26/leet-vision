import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from './SEO';
import { FaExternalLinkAlt, FaPlay, FaBolt, FaSearch, FaBuilding } from 'react-icons/fa';
import { useSolved } from '../context/SolvedContext';
import { useAuth } from '../context/AuthContext';
import { companyDomains } from '../data/companyDomains';
import SkeletonLoader from './SkeletonLoader';
import EzoicAd from './ads/EzoicAd';

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
    const [selectedTopic, setSelectedTopic] = useState('');

    const COMMON_TOPICS = [
        'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
        'Sorting', 'Greedy', 'Depth-First Search', 'Breadth-First Search',
        'Binary Search', 'Two Pointers', 'Sliding Window', 'Stack', 'Queue',
        'Linked List', 'Tree', 'Binary Tree', 'Graph', 'Heap (Priority Queue)',
        'Backtracking', 'Recursion', 'Divide and Conquer', 'Union Find',
        'Trie', 'Bit Manipulation', 'Design', 'Matrix', 'Monotonic Stack',
        'Prefix Sum', 'Segment Tree', 'Topological Sort', 'Simulation',
    ];

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
                limit: 20,
                sort: sortBy,
                order: 'desc'
            };
            if (difficulty) params.difficulty = difficulty;
            if (searchTerm) params.search = searchTerm;
            if (selectedTopic) params.topic = selectedTopic;

            const response = await axios.get(`${API_BASE}/api/company/${encodeURIComponent(companyName)}/questions`, { params, withCredentials: true });

            // Client-side override for access 
            setQuestions(response.data.questions);
            setTotal(response.data.total);
            setPages(response.data.pages);
            setHasAccess(!!user);
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [companyName, page, difficulty, sortBy, selectedTopic, user]);

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

            {/* ── Controls Bar ── */}
            <div className="controls-bar">
                <form className="search-mini" onSubmit={handleSearch}>
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search questions…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button type="button" className="clear-btn" onClick={() => { setSearchTerm(''); setPage(1); fetchQuestions(); }}>✕</button>
                    )}
                </form>

                <div className="filters-group">
                    {/* Difficulty */}
                    <div className={`filter-pill ${difficulty ? 'filter-pill--active' : ''}`}>
                        <label>Difficulty</label>
                        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}>
                            <option value="">All</option>
                            <option value="Easy">🟢 Easy</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="Hard">🔴 Hard</option>
                        </select>
                        <span className="chevron">▾</span>
                    </div>

                    {/* Topic */}
                    <div className={`filter-pill ${selectedTopic ? 'filter-pill--active' : ''}`}>
                        <label>Topic</label>
                        <select value={selectedTopic} onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}>
                            <option value="">All</option>
                            {COMMON_TOPICS.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <span className="chevron">▾</span>
                    </div>

                    {/* Sort */}
                    <div className="filter-pill">
                        <label>Sort</label>
                        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                            <option value="frequency">Most Frequent</option>
                            <option value="acceptanceRate">High Acceptance</option>
                            <option value="title">Alphabetical</option>
                        </select>
                        <span className="chevron">▾</span>
                    </div>

                    {/* Active filter clear */}
                    {(difficulty || selectedTopic) && (
                        <button
                            className="clear-filters-btn"
                            onClick={() => { setDifficulty(''); setSelectedTopic(''); setPage(1); }}
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Ad placement */}
            <EzoicAd />

            {/* Premium upsell removed for production */}

            {loading ? (
                <div style={{ paddingTop: '20px' }}>
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
                    </table>
                    <SkeletonLoader 
                        variant="row" 
                        count={10} 
                        itemStyle={{ height: '60px', marginBottom: '8px', borderRadius: '8px', background: '#111' }} 
                    />
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
                            {questions.map((q, index) => {
                                const solved = isProblemSolved({ id: q.questionId });
                                const locked = !hasAccess && index >= 4;

                                return (
                                    <tr key={q._id} className={`${solved ? 'solved-row' : ''} ${locked ? 'locked-row' : ''}`}>
                                        <td className="status-cell">
                                            {locked ? (
                                                <span className="lock-icon">🔒</span>
                                            ) : (
                                                solved ? <span className="solved-badge">Done</span> : <span className="todo-dot"></span>
                                            )}
                                        </td>
                                        <td className="title-cell">
                                            <div className="q-title-wrap">
                                                <span className="q-title">
                                                    {q.questionId}. {q.title}
                                                </span>
                                                <div className="q-topics">
                                                    {q.topics.slice(0, 3).map(t => (
                                                        <span
                                                            key={t}
                                                            className={`topic-tag ${selectedTopic === t ? 'topic-tag-active' : ''}`}
                                                            onClick={() => { setSelectedTopic(selectedTopic === t ? '' : t); setPage(1); }}
                                                            title={`Filter by ${t}`}
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="diff-cell">
                                            <span style={{ color: getDifficultyColor(q.difficulty) }}>{q.difficulty}</span>
                                        </td>
                                        <td className="freq-cell">
                                            <div className="freq-bar-container">
                                                <div className="freq-bar" style={{ width: `${q.frequency}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="acc-cell">
                                            {`${q.acceptanceRate.toFixed(1)}%`}
                                        </td>
                                        <td className="actions-cell">
                                            {locked ? (
                                                <button className="unlock-inline-btn" onClick={() => navigate('/login')}>
                                                    Login to Unlock
                                                </button>
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

                    {/* Premium Upsell Gate */}
                    {!hasAccess && questions.length > 4 && (
                        <div className="premium-upsell-card">
                            <div className="upsell-content">
                                <h3>Unlock <span>{total - 4}+</span> More Questions</h3>
                                <p>Login to your LeetVision account to get full access to all interview questions from top tech companies including {companyName}.</p>
                                <div className="upsell-actions">
                                    <button className="primary-btn" onClick={() => navigate('/login')}>
                                        Login to Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {questions.length === 0 && (
                        <div className="no-questions">
                            <p>No questions found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Ad placement below table */}
            <EzoicAd />

            {pages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        ← Prev
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: pages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`page-num-btn ${page === p ? 'page-num-active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }
                    </div>

                    <button
                        className="page-btn"
                        disabled={page === pages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next →
                    </button>
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

                /* ── Controls Bar ── */
                .controls-bar {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding: 1.2rem 1.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    backdrop-filter: blur(12px);
                }

                .search-mini {
                    flex: 1;
                    min-width: 200px;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    padding: 0 1rem;
                    transition: border-color 0.2s ease;
                }

                .search-mini:focus-within {
                    border-color: rgba(245, 124, 0, 0.5);
                    box-shadow: 0 0 0 3px rgba(245, 124, 0, 0.08);
                }

                .search-mini .search-icon {
                    color: #555;
                    flex-shrink: 0;
                    font-size: 0.85rem;
                }

                .search-mini input {
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 0.8rem 0;
                    outline: none;
                    width: 100%;
                    font-size: 0.95rem;
                    font-family: var(--font-family);
                }

                .search-mini input::placeholder {
                    color: #444;
                }

                .clear-btn {
                    background: none;
                    border: none;
                    color: #555;
                    cursor: pointer;
                    font-size: 0.9rem;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    flex-shrink: 0;
                    transition: color 0.2s;
                }

                .clear-btn:hover { color: #ccc; }

                /* Filters */
                .filters-group {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.6rem;
                }

                .filter-pill {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .filter-pill:hover {
                    border-color: rgba(245, 124, 0, 0.35);
                    background: rgba(245, 124, 0, 0.05);
                }

                .filter-pill--active {
                    border-color: rgba(245, 124, 0, 0.6) !important;
                    background: rgba(245, 124, 0, 0.08) !important;
                    box-shadow: 0 0 0 2px rgba(245, 124, 0, 0.12);
                }

                .filter-pill label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    padding: 0 0 0 0.9rem;
                    pointer-events: none;
                    user-select: none;
                    white-space: nowrap;
                }

                .filter-pill--active label {
                    color: #ffa116;
                }

                .filter-pill select {
                    background: transparent;
                    border: none;
                    color: #ccc;
                    padding: 0.65rem 0.5rem 0.65rem 0.4rem;
                    outline: none;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-family: var(--font-family);
                    appearance: none;
                    -webkit-appearance: none;
                    min-width: 80px;
                }

                .filter-pill--active select {
                    color: #fff;
                }

                .filter-pill option {
                    background: #1a1a1a;
                    color: #ccc;
                }

                .filter-pill .chevron {
                    font-size: 0.7rem;
                    color: #444;
                    padding-right: 0.7rem;
                    pointer-events: none;
                    user-select: none;
                }

                .filter-pill--active .chevron {
                    color: #ffa116;
                }

                .clear-filters-btn {
                    background: rgba(245, 124, 0, 0.1);
                    border: 1px solid rgba(245, 124, 0, 0.4);
                    color: #ffa116;
                    padding: 0.5rem 0.9rem;
                    border-radius: 10px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: var(--font-family);
                    letter-spacing: 0.3px;
                }

                .clear-filters-btn:hover {
                    background: rgba(245, 124, 0, 0.2);
                    border-color: rgba(245, 124, 0, 0.7);
                    transform: translateY(-1px);
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
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                }

                .topic-tag:hover {
                    background: rgba(245, 124, 0, 0.1);
                    color: #ffa116;
                    border-color: rgba(245, 124, 0, 0.3);
                }

                .topic-tag-active {
                    background: rgba(245, 124, 0, 0.15) !important;
                    color: #ffa116 !important;
                    border-color: rgba(245, 124, 0, 0.5) !important;
                    font-weight: 700;
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
                    gap: 0.8rem;
                    margin-top: 2.5rem;
                    flex-wrap: wrap;
                }

                .page-btn {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #ccc;
                    padding: 0.55rem 1.2rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.88rem;
                    font-weight: 600;
                    font-family: var(--font-family);
                    transition: all 0.2s ease;
                    letter-spacing: 0.3px;
                }

                .page-btn:hover:not(:disabled) {
                    background: rgba(245, 124, 0, 0.1);
                    border-color: rgba(245, 124, 0, 0.4);
                    color: #ffa116;
                }

                .page-btn:disabled {
                    opacity: 0.25;
                    cursor: not-allowed;
                }

                .page-numbers {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .page-num-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: #888;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.88rem;
                    font-family: var(--font-family);
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .page-num-btn:hover {
                    background: rgba(245, 124, 0, 0.08);
                    border-color: rgba(245, 124, 0, 0.3);
                    color: #ffa116;
                }

                .page-num-active {
                    background: rgba(245, 124, 0, 0.15) !important;
                    border-color: rgba(245, 124, 0, 0.6) !important;
                    color: #ffa116 !important;
                    font-weight: 700;
                    box-shadow: 0 0 0 2px rgba(245, 124, 0, 0.1);
                }

                .page-ellipsis {
                    color: #444;
                    font-size: 1rem;
                    padding: 0 0.2rem;
                    user-select: none;
                }

                .no-questions {
                    padding: 5rem;
                    text-align: center;
                    color: #555;
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
