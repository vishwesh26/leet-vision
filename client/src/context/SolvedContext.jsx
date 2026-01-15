import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SolvedContext = createContext();

export const useSolved = () => useContext(SolvedContext);

export const SolvedProvider = ({ children }) => {
    // State: username, solved problems (Set/Map), stats
    const [leetcodeUsername, setLeetcodeUsername] = useState(() => localStorage.getItem('leetcodeUsername') || '');
    const [solvedProblems, setSolvedProblems] = useState(() => {
        const saved = localStorage.getItem('solvedProblems');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [userStats, setUserStats] = useState(() => {
        const saved = localStorage.getItem('userStats');
        return saved ? JSON.parse(saved) : null;
    });
    const [recentSubmissions, setRecentSubmissions] = useState(() => {
        const saved = localStorage.getItem('recentSubmissions');
        return saved ? JSON.parse(saved) : [];
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState('');

    useEffect(() => {
        localStorage.setItem('leetcodeUsername', leetcodeUsername);
    }, [leetcodeUsername]);

    useEffect(() => {
        localStorage.setItem('solvedProblems', JSON.stringify([...solvedProblems]));
    }, [solvedProblems]);

    useEffect(() => {
        localStorage.setItem('userStats', JSON.stringify(userStats));
    }, [userStats]);

    useEffect(() => {
        localStorage.setItem('recentSubmissions', JSON.stringify(recentSubmissions));
    }, [recentSubmissions]);

    // Initial Auto-Sync if username exists (once per session logic could go here, but for now simple)
    useEffect(() => {
        if (leetcodeUsername) {
            // Optional: Auto-sync on load
            syncWithLeetCode(leetcodeUsername);
        }
    }, []);

    const syncWithLeetCode = async (username) => {
        if (!username) return;
        setIsSyncing(true);
        setSyncError('');

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const response = await axios.post(`${API_BASE}/api/sync/${username}`);

            const { solvedStats, recentSolved } = response.data;

            // Merge with existing solved
            setSolvedProblems(prev => {
                const newSet = new Set(prev);
                recentSolved.forEach(submission => {
                    newSet.add(submission.titleSlug); // Using Title Slug as unique ID for consistency? 
                    // OR submission.id? The ListPage uses problem.id (number) mostly but database has slugs.
                    // LeetCode recent submission returns titleSlug.

                    // Wait, our local DB uses numeric strings "1".
                    // LeetCode "id" in recent list is submission ID (huge number).
                    // We need to map formatted title or slug to our ID.
                    // Our problems.json has "slug". So mapping by Slug is safest.
                    newSet.add(submission.titleSlug);
                });
                return newSet;
            });

            setUserStats(solvedStats);
            setRecentSubmissions(recentSolved); // Store full list
            setLeetcodeUsername(username); // Confirm valid username

        } catch (err) {
            console.error("Sync Error:", err);
            setSyncError(err.response?.data?.error || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const isProblemSolved = (problem) => {
        // Problem from our DB has `slug` and `id`.
        // Solved Set has `slugs`.
        if (!problem) return false;
        return solvedProblems.has(problem.slug);
    };

    const disconnect = () => {
        setLeetcodeUsername('');
        setSolvedProblems(new Set());
        setUserStats(null);
        setRecentSubmissions([]);
        localStorage.removeItem('leetcodeUsername');
        localStorage.removeItem('solvedProblems');
        localStorage.removeItem('userStats');
        localStorage.removeItem('recentSubmissions');
    };

    return (
        <SolvedContext.Provider value={{
            leetcodeUsername,
            solvedProblems,
            userStats,
            recentSubmissions,
            isSyncing,
            syncError,
            syncWithLeetCode,
            isProblemSolved,
            disconnect
        }}>
            {children}
        </SolvedContext.Provider>
    );
};
