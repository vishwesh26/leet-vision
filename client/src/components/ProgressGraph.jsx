import React, { useMemo } from 'react';
import { useSolved } from '../context/SolvedContext';

const ProgressGraph = () => {
    const { userStats, leetcodeUsername } = useSolved();

    const calendarData = useMemo(() => {
        if (!userStats?.calendar) return [];
        try {
            const parsed = JSON.parse(userStats.calendar);
            // Convert to array of { date, count }
            return Object.entries(parsed).map(([ts, count]) => ({
                date: new Date(parseInt(ts) * 1000), // Check if parsing is needed
                count: count
            }));
        } catch (e) {
            console.error("Failed to parse calendar", e);
            return [];
        }
    }, [userStats]);

    if (!leetcodeUsername || !userStats) return null;

    // Stats Logic
    const total = 3300; // Approx Total LeetCode Questions
    const easyTotal = 800;
    const mediumTotal = 1700;
    const hardTotal = 800;

    const easyPct = Math.min((userStats.easy / easyTotal) * 100, 100);
    const mediumPct = Math.min((userStats.medium / mediumTotal) * 100, 100);
    const hardPct = Math.min((userStats.hard / hardTotal) * 100, 100);
    const totalPct = Math.min((userStats.total / total) * 100, 100);

    return (
        <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto 3rem auto',
            background: '#161616',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '2rem',
            boxSizing: 'border-box'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Progress Evaluation</span>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Synced as {leetcodeUsername}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Circle Progress or Summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(var(--accent-orange) ${totalPct}%, #333 0)` }}>
                        <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', bottom: '4px', background: '#161616', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '1.2rem', color: 'white' }}>{userStats.total}</strong>
                            <span style={{ fontSize: '0.6rem', color: '#888' }}>SOLVED</span>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>All Problems</div>
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>{userStats.total} / {total}</div>
                    </div>
                </div>

                {/* Easy */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#00b8a3' }}>Easy</span>
                        <span style={{ color: '#ccc' }}>{userStats.easy} <span style={{ color: '#444' }}>/ {easyTotal}</span></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${easyPct}%`, height: '100%', background: '#00b8a3' }}></div>
                    </div>
                </div>

                {/* Medium */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#ffc01e' }}>Medium</span>
                        <span style={{ color: '#ccc' }}>{userStats.medium} <span style={{ color: '#444' }}>/ {mediumTotal}</span></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${mediumPct}%`, height: '100%', background: '#ffc01e' }}></div>
                    </div>
                </div>

                {/* Hard */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#ff375f' }}>Hard</span>
                        <span style={{ color: '#ccc' }}>{userStats.hard} <span style={{ color: '#444' }}>/ {hardTotal}</span></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${hardPct}%`, height: '100%', background: '#ff375f' }}></div>
                    </div>
                </div>
            </div>

            {/* Heatmap (Simplified) */}
            {calendarData.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <Heatmap data={calendarData} />
                </div>
            )}
        </div>
    );
};

// Simplified SVG Heatmap
const Heatmap = ({ data }) => {
    // 1. Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (364 - i));
        days.push(d);
    }

    // 2. Map data to dict
    const countMap = {};
    data.forEach(item => {
        // Normalize date key YYYY-MM-DD
        const key = item.date.toISOString().split('T')[0];
        countMap[key] = item.count;
    });

    // 3. Grid
    // Weeks: 53 cols. Days: 7 rows.
    const cellSize = 10;
    const gap = 3;

    // We need to shift start so sunday is row 0
    // Simplified: Just render 52 cols x 7 rows

    return (
        <div style={{ width: 'max-content' }}>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Activity (Last 12 Months)</div>
            <svg width={53 * (cellSize + gap)} height={7 * (cellSize + gap)}>
                {days.map((day, i) => {
                    const weekIndex = Math.floor(i / 7);
                    const dayIndex = i % 7; // This arranges by column-first in list, but we usually want week-column.

                    // Improve: Calculate week offset based on Day of Week
                    // Actually, usually heatmap is: Columns are Weeks. Rows are Sun-Sat.
                    // The array `days` is sequential.
                    // We need to place them in correct (week, dayOfWeek) grid.

                    const dayOfWeek = day.getDay(); // 0-6
                    // Week calculation is tricky slightly.
                    // Simple approach: Horizontal list of blocks? No, user wants GitHub style.
                    // GitHub style: Columns = Weeks. 

                    // Calculate Week Offset from Start Date
                    const startDate = days[0];
                    const diffDays = Math.floor((day - startDate) / (1000 * 60 * 60 * 24));
                    const col = Math.floor((diffDays + startDate.getDay()) / 7);
                    const row = day.getDay();

                    const dateKey = day.toISOString().split('T')[0];
                    const count = countMap[dateKey] || 0;

                    let color = '#2a2a2a'; // Empty
                    if (count > 0) color = '#0e4429';
                    if (count >= 2) color = '#006d32';
                    if (count >= 4) color = '#26a641';
                    if (count >= 6) color = '#39d353';

                    return (
                        <rect
                            key={i}
                            x={col * (cellSize + gap)}
                            y={row * (cellSize + gap)}
                            width={cellSize}
                            height={cellSize}
                            fill={color}
                            rx={2}
                            title={`${dateKey}: ${count} submissions`}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default ProgressGraph;
