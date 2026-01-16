import React, { useMemo } from 'react';
import { useSolved } from '../context/SolvedContext';
import ProgressGraph from './ProgressGraph';
import SEO from './SEO';

const ProgressPage = () => {
    const { leetcodeUsername, userStats, recentSubmissions, syncWithLeetCode, isSyncing } = useSolved();

    const streak = useMemo(() => {
        if (!userStats?.calendar) return 0;
        try {
            const parsed = JSON.parse(userStats.calendar);
            // Sort timestamps desc
            const dates = Object.keys(parsed).map(k => parseInt(k)).sort((a, b) => b - a);

            if (dates.length === 0) return 0;

            let currentStreak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if last submission was today or yesterday
            const lastSubDate = new Date(dates[0] * 1000);
            lastSubDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(today - lastSubDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) return 0; // Streak broken if last sub was before yesterday

            // Naive streak calc: This is complex because calendar is sparse. 
            // Simple logic: consecutive days backwards from lastSubDate.

            let streakCount = 0;
            let checkDate = lastSubDate; // Start checking from the last valid submission day

            // We need a Set of date strings to quick lookup
            const subDates = new Set(dates.map(ts => {
                const d = new Date(ts * 1000);
                d.setHours(0, 0, 0, 0);
                return d.toISOString();
            }));

            // Max 1000 days check
            for (let i = 0; i < 365 * 3; i++) {
                if (subDates.has(checkDate.toISOString())) {
                    streakCount++;
                    checkDate.setDate(checkDate.getDate() - 1); // Go back one day
                } else {
                    break;
                }
            }
            return streakCount;
        } catch (e) {
            console.error(e);
            return 0;
        }
    }, [userStats]);

    if (!leetcodeUsername) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem', padding: '0 1rem' }}>
                <h2>Connect LeetCode to View Progress</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Enter your username below to visualize your coding journey.</p>

                <div style={{ maxWidth: '400px', margin: '0 auto', background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.username.value;
                        if (val) syncWithLeetCode(val);
                    }}>
                        <input
                            name="username"
                            type="text"
                            placeholder="LeetCode Username"
                            style={{
                                width: '90%', padding: '1rem', marginBottom: '1rem',
                                background: '#222', border: '1px solid #444', color: 'white', borderRadius: '8px'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isSyncing}
                            style={{
                                width: '100%', padding: '1rem', background: 'var(--accent-orange)',
                                border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer',
                                opacity: isSyncing ? 0.7 : 1
                            }}
                        >
                            {isSyncing ? 'Syncing...' : 'View Progress'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title={`${leetcodeUsername}'s Progress - LeetVision`} description="Track your LeetCode progress visually." path="/progress" />

            <div style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
                    Your <span style={{ color: 'var(--accent-orange)' }}>Progress</span>
                </h1>

                {/* Streak Banner */}
                <div style={{
                    background: 'linear-gradient(90deg, #1f1f1f 0%, #111 100%)',
                    padding: '1.5rem 2rem',
                    borderRadius: '12px',
                    border: '1px solid #333',
                    marginBottom: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem'
                }}>
                    <div style={{ fontSize: '3rem' }}>🔥</div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{streak}</div>
                        <div style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Day Streak</div>
                    </div>
                </div>

                {/* Main Graph */}
                <ProgressGraph />

                {/* Recent Activity List */}
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                        Recent Activity
                    </h3>

                    {recentSubmissions.length > 0 ? (
                        <div className="problem-list-container">
                            <table className="problem-table">
                                <thead>
                                    <tr>
                                        <th>Problem</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSubmissions.map((sub, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <a
                                                    href={`https://leetcode.com/problems/${sub.titleSlug}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="problem-title-link"
                                                >
                                                    {sub.title}
                                                </a>
                                            </td>
                                            <td style={{ color: '#888' }}>
                                                {new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span style={{ color: '#00b8a3', fontWeight: 'bold', fontSize: '0.9rem' }}>AC</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>No recent activity found.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProgressPage;
