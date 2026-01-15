import React from 'react';
import SEO from './SEO';
import { Link } from 'react-router-dom';

const RoadmapPage = () => {
    const weeks = [
        {
            title: "Week 1: Basics & Arrays",
            topics: ["Arrays", "Hashing", "Two Pointers"],
            problems: [
                { id: "1", title: "Two Sum", difficulty: "Easy" },
                { id: "217", title: "Contains Duplicate", difficulty: "Easy" },
                { id: "242", title: "Valid Anagram", difficulty: "Easy" }
            ]
        },
        {
            title: "Week 2: Two Pointers & Stack",
            topics: ["Two Pointers", "Stack", "Sliding Window"],
            problems: [
                { id: "125", title: "Valid Palindrome", difficulty: "Easy" },
                { id: "20", title: "Valid Parentheses", difficulty: "Easy" },
                { id: "121", title: "Best Time to Buy Stock", difficulty: "Easy" }
            ]
        },
        {
            title: "Week 3: Trees & Graphs",
            topics: ["Binary Search", "Trees", "Graphs"],
            problems: [
                { id: "226", title: "Invert Binary Tree", difficulty: "Easy" },
                { id: "104", title: "Max Depth of Binary Tree", difficulty: "Easy" },
                { id: "704", title: "Binary Search", difficulty: "Easy" }
            ]
        },
        {
            title: "Week 4: DP & Advanced",
            topics: ["Dynamic Programming", "Backtracking"],
            problems: [
                { id: "70", title: "Climbing Stairs", difficulty: "Easy" },
                { id: "198", title: "House Robber", difficulty: "Medium" }
            ]
        }
    ];

    return (
        <>
            <SEO title="Interview Roadmap" description="A structured 4-week plan to crack coding interviews." path="/interview-roadmap" />
            <div className="results-container">
                <h2 className="results-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    Interactive Interview Roadmap
                </h2>

                <div className="roadmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {weeks.map((week, index) => (
                        <div key={index} className="week-card" style={{
                            background: '#161616',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                background: 'var(--accent-orange)',
                                color: 'white',
                                display: 'inline-block',
                                padding: '0.2rem 0.8rem',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem'
                            }}>
                                Step {index + 1}
                            </div>
                            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.3rem' }}>{week.title}</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Focus: {week.topics.join(', ')}
                            </p>

                            <div className="week-problems">
                                {week.problems.map(prob => (
                                    <Link to={`/search/${prob.id}`} key={prob.id} style={{
                                        display: 'block',
                                        padding: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        marginBottom: '0.5rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        color: '#ddd',
                                        transition: 'background 0.2s'
                                    }} className="problem-link">
                                        <span style={{ color: 'var(--accent-orange)', marginRight: '0.5rem' }}>{prob.id}.</span>
                                        {prob.title}
                                        <span style={{ float: 'right', fontSize: '0.8rem', color: prob.difficulty === 'Easy' ? '#00b8a3' : '#ffc01e' }}>
                                            {prob.difficulty}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default RoadmapPage;
