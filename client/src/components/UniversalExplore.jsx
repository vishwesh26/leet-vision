import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGlobe, FaSearch, FaExternalLinkAlt, FaBrain, FaPlay, FaChevronDown, FaChevronUp, FaLock, FaPlus, FaEdit } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiGeeksforgeeks, SiCodechef } from 'react-icons/si';

const UniversalExplore = () => {
    // Auth State
    const { user } = useAuth();
    const hasFullAccess = user && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
    const isGuest = !user || !hasFullAccess;

    // Global State
    const [platform, setPlatform] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Pagination State (for 'all' platform)
    const [problems, setProblems] = useState([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Topic-Based State (for specific platforms)
    const [topics, setTopics] = useState([]); // [{ tag: 'Arrays', count: 10 }, ...]
    const [topicProblems, setTopicProblems] = useState({}); // { 'Arrays': [problems...] }
    const [expandedTopics, setExpandedTopics] = useState({}); // { 'Arrays': true }

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // Effect: Handle Platform Change, Search & Initial Fetch
    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            setProblems([]);
            setTopics([]);
            setTopicProblems({});
            setExpandedTopics({});
            setPage(1);
            setHasMore(true);
            setLoading(true);

            const fetchData = async () => {
                try {
                    if (platform === 'all' || searchQuery) {
                        // Fetch global paginated problems (with search if present)
                        // If searching, we default to 'all' logic generally, or specific platform if selected
                        await fetchGlobalProblems(1, searchQuery);
                    } else {
                        // Fetch topics for the platform only if NO search query
                        const response = await axios.get(`${API_BASE}/api/universal-problems/topics`, {
                            params: { platform }
                        });
                        setTopics(response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch data:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [platform, searchQuery]);

    const handlePlatformChange = (newPlatform) => {
        if (platform === newPlatform) return;
        setPlatform(newPlatform);
        // Search query persists, but we reset pagination and results
    };

    // Helper: Fetch Global Problems (Paginated)
    const fetchGlobalProblems = async (pageNum, query = '') => {
        try {
            const response = await axios.get(`${API_BASE}/api/universal-problems`, {
                params: {
                    platform: platform === 'all' ? undefined : platform,
                    page: pageNum,
                    limit: 30,
                    search: query
                }
            });

            // Support both old array format (fallback) and new paginated format
            let newProblems = [];
            let totalPages = 1;

            if (Array.isArray(response.data)) {
                newProblems = response.data;
                totalPages = 1;
            } else {
                newProblems = response.data.problems || [];
                totalPages = response.data.pages || 1;
            }

            setProblems(prev => pageNum === 1 ? newProblems : [...prev, ...newProblems]);
            setHasMore(pageNum < totalPages);
        } catch (err) {
            console.error("Fetch global error:", err);
        }
    };

    // Handler: Load More (Global)
    const handleLoadMore = async () => {
        if (!loadingMore && hasMore) {
            setLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            await fetchGlobalProblems(nextPage, searchQuery);
            setLoadingMore(false);
        }
    };

    // Handler: Toggle Topic (Lazy Load)
    const handleTopicToggle = async (tag) => {
        setExpandedTopics(prev => ({ ...prev, [tag]: !prev[tag] }));

        // If expanding and data not present, fetch it
        if (!expandedTopics[tag] && !topicProblems[tag]) {
            try {
                const response = await axios.get(`${API_BASE}/api/universal-problems`, {
                    params: {
                        platform,
                        tag,
                        limit: 100 // Fetch up to 100 per topic
                    }
                });

                let fetchedProblems = [];
                if (Array.isArray(response.data)) {
                    fetchedProblems = response.data;
                } else {
                    fetchedProblems = response.data.problems || [];
                }

                setTopicProblems(prev => ({
                    ...prev,
                    [tag]: fetchedProblems
                }));
            } catch (err) {
                console.error(`Failed to fetch problems for topic ${tag}:`, err);
            }
        }
    };

    // const filteredProblems = problems; // logic moved to server
    const displayProblems = problems;


    return (
        <div className="explore-page">
            <style>{`
                .explore-page {
                    padding: 40px 20px;
                    background: #000;
                    min-height: 100vh;
                    color: #fff;
                    font-family: 'DM Sans', sans-serif; /* Assuming font availability or fallback */
                }
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                /* Header Styles */
                .page-header {
                    text-align: center;
                    margin-bottom: 60px;
                    position: relative;
                }
                .page-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    letter-spacing: -2px;
                    margin-bottom: 10px;
                    background: -webkit-linear-gradient(45deg, #fff, #888);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .highlight-text {
                    background: linear-gradient(90deg, #ffa116, #ff4b2b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .page-subtitle {
                    color: #666;
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                /* Controls */
                .controls-wrapper {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 40px;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 10px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                .search-container {
                    flex: 1;
                    position: relative;
                    min-width: 300px;
                }
                .search-icon {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
                }
                .search-input {
                    width: 90%;
                    padding: 16px 20px 16px 50px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid #333;
                    border-radius: 12px;
                    color: white;
                    outline: none;
                    transition: 0.2s;
                    font-size: 1rem;
                }
                .search-input:focus {
                    border-color: #ffa116;
                    background: rgba(0,0,0,0.5);
                }
                .tabs-container {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 2px;
                }
                .platform-tab {
                    padding: 12px 24px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    color: #888;
                    cursor: pointer;
                    font-weight: 600;
                    transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                    font-size: 0.95rem;
                    text-transform: capitalize;
                    white-space: nowrap;
                    position: relative;
                    overflow: hidden;
                }
                .platform-tab:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }
                .platform-tab.active {
                    background: rgba(255, 161, 22, 0.15);
                    color: #fff;
                    border-color: rgba(255, 161, 22, 0.5);
                    box-shadow: 0 8px 32px 0 rgba(255, 161, 22, 0.3),
                                inset 0 0 15px rgba(255, 161, 22, 0.1);
                    text-shadow: 0 0 10px rgba(255, 161, 22, 0.5);
                }
                .platform-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: #ffa116;
                    box-shadow: 0 0 10px #ffa116;
                    border-radius: 2px;
                }

                /* Grid Header */
                .grid-header {
                    display: grid;
                    grid-template-columns: 80px 1fr 140px 140px 120px;
                    gap: 20px;
                    padding: 0 25px 15px;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #222;
                    color: #666;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                }

                /* Topic Accordion */
                .topic-accordion {
                    margin-bottom: 15px;
                    border: 1px solid #222;
                    border-radius: 16px;
                    background: #080808;
                    overflow: hidden;
                    transition: 0.3s;
                }
                .topic-accordion:hover {
                    border-color: #333;
                }
                .topic-summary {
                    padding: 20px 25px;
                    background: linear-gradient(90deg, #111, #080808);
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    user-select: none;
                    color: #fff;
                }
                .topic-summary:hover {
                    background: #151515;
                }
                .topic-tag {
                    color: #ffa116;
                    margin-right: 10px;
                }
                .topic-count {
                    font-size: 0.9rem;
                    color: #555;
                    font-weight: 500;
                    margin-left: 5px;
                }

                /* Login Gate Styles */
                .login-gate {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    overflow: hidden;
                }
                
                .gate-blur {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0.8) 40%, rgba(5,5,5,1) 100%);
                    backdrop-filter: blur(4px);
                    pointer-events: none;
                }
                
                .gate-content {
                    position: relative;
                    z-index: 20;
                    text-align: center;
                    background: rgba(30, 30, 30, 0.8);
                    padding: 2rem 3rem;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    backdrop-filter: blur(10px);
                    max-width: 400px;
                    margin: 0 20px;
                    animation: float 6s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .gate-content h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: white;
                }
                
                .gate-content p {
                    color: #aaa;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                
                .gate-btn {
                    display: inline-block;
                    background: var(--accent-orange);
                    color: #000;
                    text-decoration: none;
                    padding: 12px 30px;
                    border-radius: 12px;
                    font-weight: 700;
                    transition: 0.2s;
                }
                
                .gate-btn:hover {
                    background: white;
                    transform: scale(1.05);
                }

                /* Loading/Empty States */
                .state-msg {
                    text-align: center;
                    padding: 60px;
                    color: #666;
                    font-size: 1.1rem;
                }
                
                /* Animations */
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>

            <div className="container">
                <header className="page-header">
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255, 161, 22, 0.1)', borderRadius: '50%', marginRight: '15px' }}>
                            <FaGlobe size={24} color="#ffa116" />
                        </div>
                    </div>
                    <h1 className="page-title">All Platform <span className="highlight-text">Problem</span></h1>
                    <p className="page-subtitle">Access a unified knowledge graph linking LeetCode, HackerRank, GeeksforGeeks, and CodeChef into a single learning ecosystem.</p>
                </header>

                <div className="controls-wrapper">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title, concept, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="tabs-container">
                        {[
                            { id: 'all', label: 'All', icon: FaGlobe, color: '#fff' },
                            { id: 'leetcode', label: 'LeetCode', icon: SiLeetcode, color: '#ffa116' },
                            { id: 'hackerrank', label: 'HackerRank', icon: SiHackerrank, color: '#2ec866' },
                            { id: 'geeksforgeeks', label: 'GFG', icon: SiGeeksforgeeks, color: '#2f8d46' },
                            { id: 'codechef', label: 'CodeChef', icon: SiCodechef, color: '#5b4638' }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => handlePlatformChange(p.id)}
                                className={`platform-tab ${platform === p.id ? 'active' : ''}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <p.icon color={platform === p.id ? '#fff' : p.color} />
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="state-msg">
                        <div style={{ width: '40px', height: '40px', border: '3px solid #222', borderTopColor: '#ffa116', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
                        Initializing Knowledge Stream...
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div className="problems-container">
                        <div className="grid-header">
                            <div>#ID</div>
                            <div>Problem Title</div>
                            <div>Platform</div>
                            <div>Solution</div>
                            <div>Difficulty</div>
                        </div>

                        {platform === 'all' ? (
                            // Global View
                            <>
                                <div className="problems-list" style={{ position: 'relative' }}>
                                    {(isGuest ? displayProblems.slice(0, 4) : displayProblems).map(p => (
                                        <ProblemRow key={p._id} p={p} />
                                    ))}

                                    {isGuest && displayProblems.length > 4 && (
                                        <div className="login-gate">
                                            <div className="gate-content">
                                                <FaLock size={40} style={{ marginBottom: '15px', color: '#ffa116' }} />
                                                <h3>Unlock the Full Universe</h3>
                                                <p>{user ? "Upgrade to Premium to access all problems." : `Join LeetVision to access all ${displayProblems.length}+ problems across platforms.`}</p>
                                                <Link to={user ? "/pricing" : "/login"} className="gate-btn">{user ? "Get Premium" : "Login to Continue"}</Link>
                                            </div>
                                            <div className="gate-blur"></div>
                                        </div>
                                    )}
                                </div>

                                {displayProblems.length === 0 && (
                                    <div className="state-msg">No problems found matching your criteria.</div>
                                )}

                                {hasMore && displayProblems.length > 0 && !isGuest && (
                                    <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '50px' }}>
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            style={{
                                                padding: '14px 40px',
                                                backgroundColor: '#ffa116',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '30px',
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                cursor: loadingMore ? 'wait' : 'pointer',
                                                transition: '0.2s',
                                                boxShadow: '0 5px 20px rgba(255, 161, 22, 0.2)'
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                        >
                                            {loadingMore ? 'Loading More...' : 'Load More Questions'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Topic View
                            <div className="topics-list" style={{ position: 'relative' }}>
                                {(isGuest ? topics.slice(0, 8) : topics).map(({ tag, count }) => (
                                    <details className="topic-accordion" key={tag} open={expandedTopics[tag]}>
                                        <summary
                                            className="topic-summary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleTopicToggle(tag);
                                            }}
                                        >
                                            <span>
                                                <span className="topic-tag">{tag}</span>
                                                <span className="topic-count">({count})</span>
                                            </span>
                                            {expandedTopics[tag] ? <FaChevronUp size={12} color="#666" /> : <FaChevronDown size={12} color="#666" />}
                                        </summary>

                                        {expandedTopics[tag] && (
                                            <div style={{ padding: '0 10px 10px 10px' }}>
                                                {!topicProblems[tag] ? (
                                                    <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                                                        <div style={{ width: '20px', height: '20px', border: '2px solid #222', borderTopColor: '#ffa116', borderRadius: '50%', margin: '0 auto 10px', animation: 'spin 1s linear infinite' }}></div>
                                                        Loading...
                                                    </div>
                                                ) : topicProblems[tag].map(p => (
                                                    <ProblemRow key={p._id} p={p} />
                                                ))}
                                            </div>
                                        )}
                                    </details>
                                ))}

                                {isGuest && topics.length > 0 && (
                                    <div className="login-gate">
                                        <div className="gate-content">
                                            <FaLock size={40} style={{ marginBottom: '15px', color: '#ffa116' }} />
                                            <h3>Unlock All Topics</h3>
                                            <p>{user ? "Upgrade to Premium to access all topics." : `Join LeetVision to access all ${topics.length}+ topics and their problems.`}</p>
                                            <Link to={user ? "/pricing" : "/login"} className="gate-btn">{user ? "Get Premium" : "Login to Continue"}</Link>
                                        </div>
                                        <div className="gate-blur"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

// Helper Component for consistency
const ProblemRow = ({ p }) => {
    const { user } = useAuth();
    // Determine platform icon
    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'leetcode': return <SiLeetcode color="#FFA116" size={18} />;
            case 'hackerrank': return <SiHackerrank color="#2EC866" size={18} />;
            case 'geeksforgeeks': return <SiGeeksforgeeks color="#2F8D46" size={18} />;
            case 'codechef': return <SiCodechef color="#5B4638" size={18} />;
            default: return <FaGlobe color="#888" size={18} />;
        }
    };

    // Determine difficulty color & styling
    const getDifficultyStyle = (diff) => {
        const d = diff?.toLowerCase();
        switch (d) {
            case 'easy': return { bg: 'rgba(0, 184, 163, 0.1)', color: '#00B8A3', border: 'rgba(0, 184, 163, 0.2)' };
            case 'medium': return { bg: 'rgba(255, 192, 30, 0.1)', color: '#FFC01E', border: 'rgba(255, 192, 30, 0.2)' };
            case 'hard': return { bg: 'rgba(255, 55, 95, 0.1)', color: '#FF375F', border: 'rgba(255, 55, 95, 0.2)' };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', color: '#888', border: 'rgba(255, 255, 255, 0.1)' };
        }
    };

    const difficulty = p.difficulty && p.difficulty !== 'Unknown'
        ? p.difficulty
        : (p.concept_id?.difficulty_estimate || 'Unknown');

    const diffStyle = getDifficultyStyle(difficulty);

    return (
        <div className="problem-card fade-in" style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 140px 140px 120px',
            gap: '20px',
            padding: '18px 25px',
            marginBottom: '10px',
            borderRadius: '16px',
            background: '#111',
            border: '1px solid #1a1a1a',
            alignItems: 'center',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            cursor: 'default'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* ID */}
            <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600 }}>
                {p.questionId || (p.slug ? `#${p.slug.substring(0, 4)}` : '-')}
            </div>

            {/* Title */}
            <div style={{ fontWeight: 600, color: '#e0e0e0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.title}
            </div>

            {/* Platform Link */}
            <div>
                <a href={p.url} target="_blank" rel="noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: 'fit-content',
                    minWidth: '40px',
                    height: '34px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    background: '#1a1a1a',
                    color: '#999',
                    border: '1px solid #333',
                    transition: '0.2s',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#666';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.color = '#999';
                    }}
                >
                    {getPlatformIcon(p.platform)}
                    <span style={{ display: 'none' }}>Link</span>
                </a>
            </div>

            {/* Solution Link */}
            <div>
                <Link
                    to={p.platform === 'leetcode' && p.questionId ? `/solution/${p.questionId}` : `/universe/solution/${p.platform}/${p.slug}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: p.concept_id ? 'rgba(255, 161, 22, 0.1)' : '#1a1a1a',
                        color: p.concept_id ? '#ffa116' : '#666',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: p.concept_id ? 700 : 600,
                        border: p.concept_id ? '1px solid rgba(255, 161, 22, 0.2)' : '1px solid #333',
                        transition: '0.2s'
                    }}
                >
                    {p.concept_id && <FaBrain size={12} />} Solution
                </Link>
                {user?.isAdmin && (
                    <Link
                        to={`/admin/${p.hasSolution ? 'edit' : 'add'}-solution/${p.platform === 'leetcode' ? p.questionId : p.slug}`}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            marginTop: '6px', fontSize: '0.7rem', color: p.hasSolution ? '#4db6ac' : '#ffa116',
                            textDecoration: 'none', fontWeight: 600
                        }}
                    >
                        {p.hasSolution ? <><FaEdit size={10} /> Edit</> : <><FaPlus size={10} /> Add</>}
                    </Link>
                )}
            </div>

            {/* Difficulty */}
            <div>
                <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: diffStyle.bg,
                    color: diffStyle.color,
                    border: `1px solid ${diffStyle.border}`
                }}>
                    {difficulty === 'Unknown' ? '-' : difficulty}
                </span>
            </div>
        </div>
    );
};

export default UniversalExplore;
